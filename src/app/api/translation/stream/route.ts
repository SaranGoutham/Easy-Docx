import { translateSummaryToHindiStream } from "@/ai/flows/translate-summary-hindi";
import { translateSummaryToTeluguStream } from "@/ai/flows/translate-summary-telugu";
import { NextRequest } from "next/server";

const encoder = new TextEncoder();

const sseHeaders: HeadersInit = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

type SupportedLanguage = "hindi" | "telugu";

export async function POST(req: NextRequest) {
  try {
    const { summary, language } = await req.json();

    if (typeof summary !== "string" || !summary.trim()) {
      return new Response(JSON.stringify({ message: "summary is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (language !== "hindi" && language !== "telugu") {
      return new Response(
        JSON.stringify({ message: "Unsupported language." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const streamResponse =
      language === "hindi"
        ? await translateSummaryToHindiStream({ summary })
        : await translateSummaryToTeluguStream({ text: summary });

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        let latestTranslation = "";
        try {
          for await (const chunk of streamResponse.stream) {
            const chunkOutput = (chunk as any).output as
              | { translatedText?: string }
              | null
              | undefined;

            const snapshot =
              typeof chunkOutput?.translatedText === "string"
                ? chunkOutput.translatedText
                : undefined;

            if (!snapshot) {
              continue;
            }

            latestTranslation = snapshot;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  translation: latestTranslation,
                })}\n\n`
              )
            );
          }

          const response = await streamResponse.response;
          const completed =
            latestTranslation || response?.output?.translatedText || "";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                translation: completed,
              })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          if ((error as Error)?.name === "AbortError") {
            controller.close();
            return;
          }
          const message =
            error instanceof Error
              ? error.message
              : "Unable to stream translation.";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, { headers: sseHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request.";
    return new Response(JSON.stringify({ message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
