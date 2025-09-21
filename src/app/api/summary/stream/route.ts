import { summarizeLegalDocumentStream } from "@/ai/flows/summarize-legal-document";
import { NextRequest } from "next/server";

const encoder = new TextEncoder();

const sseHeaders: HeadersInit = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

export async function POST(req: NextRequest) {
  try {
    const { documentText } = await req.json();

    if (typeof documentText !== "string" || !documentText.trim()) {
      return new Response(
        JSON.stringify({ message: "documentText is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const streamResponse = await summarizeLegalDocumentStream({ documentText });

    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        let latestSummary = "";
        try {
          for await (const chunk of streamResponse.stream) {
            const chunkOutput = (chunk as any).output as
              | { summary?: string }
              | null
              | undefined;

            const snapshot =
              typeof chunkOutput?.summary === "string"
                ? chunkOutput.summary
                : undefined;

            if (!snapshot) {
              continue;
            }

            latestSummary = snapshot;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  summary: latestSummary,
                })}\n\n`
              )
            );
          }

          const final =
            latestSummary ||
            (await streamResponse.response)?.output?.summary ||
            "";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done", summary: final })}\n\n`
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
              : "Unable to stream summary.";
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
