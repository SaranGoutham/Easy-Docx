import { NextRequest } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName, summary } = body as {
      fileName?: string;
      summary?: string | null;
    };

    if (!fileName) {
      return new Response(
        JSON.stringify({ message: "fileName is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ message: "Authentication required." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data, error } = await supabase
      .from("document_briefings")
      .insert({
        user_id: user.id,
        file_name: fileName,
        summary: summary ?? null,
      })
      .select()
      .single();

    if (error) {
      if ((error as any).code === '42P01') {
        return new Response(
          JSON.stringify({
            message:
              "Supabase table 'document_briefings' is missing. Run the provided SQL migration to create it before saving history.",
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
      throw new Error(error.message);
    }

    return new Response(JSON.stringify({ record: data }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save history.";
    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
