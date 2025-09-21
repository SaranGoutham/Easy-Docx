"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";

type TranslationKey = "hindi" | "telugu";

type TranslationState = Partial<Record<TranslationKey, string>>;

type StreamParams = {
  endpoint: string;
  payload: Record<string, unknown>;
  signal: AbortSignal;
  onProgress?: (snapshot: string) => void;
  onDelta?: (text: string) => void;
  onDone: (payload: Record<string, unknown>) => void;
};

const LoadingSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/5" />
  </div>
);

const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content.trim()) {
    return null;
  }
  return (
    <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
      {content}
    </ReactMarkdown>
  );
};

async function streamSSE({
  endpoint,
  payload,
  signal,
  onProgress,
  onDelta,
  onDone,
}: StreamParams) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok || !response.body) {
    let message = "Streaming endpoint returned an error.";
    try {
      const data = await response.json();
      if (data?.message) {
        message = data.message;
      }
    } catch (error) {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let resolved = false;

  const processBuffer = () => {
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const rawEvent = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");

      if (!rawEvent.length) {
        continue;
      }

      const lines = rawEvent.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data:")) {
          continue;
        }
        const dataPortion = line.slice(5).trim();
        if (!dataPortion) {
          continue;
        }
        let payloadData: Record<string, unknown>;
        try {
          payloadData = JSON.parse(dataPortion);
        } catch (error) {
          throw new Error("Failed to parse streaming payload.");
        }

        const type = payloadData.type;
        if (type === "progress" && typeof payloadData.summary === "string") {
          onProgress?.(payloadData.summary);
        } else if (
          type === "progress" &&
          typeof payloadData.translation === "string"
        ) {
          onProgress?.(payloadData.translation);
        } else if (type === "delta" && typeof payloadData.text === "string") {
          onDelta?.(payloadData.text);
        } else if (type === "done") {
          resolved = true;
          onDone(payloadData);
        } else if (type === "error") {
          const message =
            typeof payloadData.message === "string"
              ? payloadData.message
              : "An error occurred during streaming.";
          throw new Error(message);
        }
      }
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    processBuffer();
  }

  buffer += decoder.decode();
  processBuffer();

  if (!resolved) {
    onDone({});
  }
}

export function SummaryCard({
  documentText,
  fileName,
}: {
  documentText: string;
  fileName: string;
}) {
  const { user } = useAuth();
  const [summary, setSummary] = useState("");
  const [translations, setTranslations] = useState<TranslationState>({});
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] =
    useState<TranslationKey | null>(null);
  const { toast } = useToast();

  const summaryControllerRef = useRef<AbortController | null>(null);
  const translationControllersRef = useRef<
    Partial<Record<TranslationKey, AbortController>>
  >({});
  const fileNameRef = useRef(fileName);
  const hasPersistedRef = useRef(false);

  useEffect(() => {
    fileNameRef.current = fileName;
    hasPersistedRef.current = false;
  }, [fileName]);

  const startSummaryStream = useCallback(
    async (text: string, controller: AbortController) => {
      setSummary("");
      setIsLoadingSummary(true);
      setTranslations({});
      setIsLoadingTranslation(null);

      try {
        await streamSSE({
          endpoint: "/api/summary/stream",
          payload: { documentText: text },
          signal: controller.signal,
          onProgress: (snapshot) => {
            setSummary(snapshot);
          },
          onDone: (payload) => {
            const finalSummary =
              typeof payload.summary === "string" ? payload.summary : null;

            if (finalSummary) {
              setSummary(finalSummary);
            }
            setIsLoadingSummary(false);
            if (
              !hasPersistedRef.current &&
              user?.id &&
              fileNameRef.current &&
              finalSummary
            ) {
              hasPersistedRef.current = true;
              // Use the same supabase instance as auth
              void (async () => {
                try {
                  // Debug: Check current user session
                  const {
                    data: { user: currentUser },
                  } = await supabase.auth.getUser();
                  console.log(
                    "Current auth user:",
                    currentUser?.id,
                    "Expected user:",
                    user.id
                  );

                  const { error } = await supabase
                    .from("document_briefings")
                    .insert({
                      user_id: user.id,
                      file_name: fileNameRef.current,
                      summary: finalSummary,
                    });

                  if (error) {
                    throw error;
                  }

                  toast({
                    title: "Summary saved to history",
                    description: "Find it any time under History.",
                  });
                } catch (error) {
                  console.error("Failed to persist briefing history:", error);
                  toast({
                    variant: "destructive",
                    title: "Could not save history",
                    description:
                      error instanceof Error
                        ? error.message
                        : "Please try again later.",
                  });
                }
              })();
            }
          },
        });
      } catch (error) {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Unable to summarize document.";
        toast({
          variant: "destructive",
          title: "Summarization failed",
          description: message,
        });
        setSummary("Failed to generate a summary for the document.");
        setIsLoadingSummary(false);
      }
    },
    [toast]
  );

  const startTranslationStream = useCallback(
    async (language: TranslationKey, controller: AbortController) => {
      setIsLoadingTranslation(language);
      setTranslations((prev) => ({ ...prev, [language]: "" }));

      try {
        await streamSSE({
          endpoint: "/api/translation/stream",
          payload: { summary, language },
          signal: controller.signal,
          onProgress: (snapshot) => {
            setTranslations((prev) => ({
              ...prev,
              [language]: snapshot,
            }));
          },
          onDone: (payload) => {
            setTranslations((prev) => ({
              ...prev,
              [language]:
                typeof payload.translation === "string"
                  ? payload.translation
                  : prev[language] ?? "",
            }));
            setIsLoadingTranslation(null);
          },
        });
      } catch (error) {
        if ((error as Error)?.name === "AbortError") {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Unable to translate summary.";
        toast({
          variant: "destructive",
          title: "Translation failed",
          description: message,
        });
        setIsLoadingTranslation(null);
      }
    },
    [summary, toast]
  );

  useEffect(() => {
    summaryControllerRef.current?.abort();

    if (!documentText) {
      setSummary("");
      setIsLoadingSummary(false);
      setTranslations({});
      setIsLoadingTranslation(null);
      return;
    }

    const controller = new AbortController();
    summaryControllerRef.current = controller;
    startSummaryStream(documentText, controller);

    return () => {
      controller.abort();
    };
  }, [documentText, startSummaryStream]);

  useEffect(
    () => () => {
      summaryControllerRef.current?.abort();
      Object.values(translationControllersRef.current).forEach((ctrl) =>
        ctrl?.abort()
      );
    },
    []
  );

  const handleTabChange = async (tab: string) => {
    if (tab === "summary") {
      return;
    }

    if (!summary || isLoadingSummary) {
      toast({
        title: "Summary still generating",
        description:
          "Translations will be available once the summary is ready.",
      });
      return;
    }

    const language = tab as TranslationKey;

    if (
      translations[language] !== undefined ||
      isLoadingTranslation === language
    ) {
      return;
    }

    translationControllersRef.current[language]?.abort();
    const controller = new AbortController();
    translationControllersRef.current[language] = controller;
    startTranslationStream(language, controller);
  };

  const isStreaming = isLoadingSummary || Boolean(isLoadingTranslation);

  const renderTranslationContent = (language: TranslationKey) => {
    const content = translations[language];

    if (content && content.trim()) {
      return <MarkdownRenderer content={content} />;
    }

    if (isLoadingTranslation === language) {
      return <LoadingSkeleton />;
    }

    return (
      <p className="text-sm text-muted-foreground">
        Select this tab to generate a{" "}
        {language === "hindi" ? "Hindi" : "Telugu"} translation.
      </p>
    );
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Summary &amp; Translation</CardTitle>
            <CardDescription>
              AI-generated summary with instant translations.
            </CardDescription>
          </div>
          {isStreaming && (
            <Badge
              variant="outline"
              className="flex items-center gap-2 border-primary/40 text-primary"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Live
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {(isLoadingSummary || isLoadingTranslation) && (
          <div className="mb-6 space-y-2">
            <Progress indeterminate className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {isLoadingSummary
                ? "Generating summary..."
                : `Translating to ${
                    isLoadingTranslation === "hindi" ? "Hindi" : "Telugu"
                  }...`}
            </p>
          </div>
        )}
        <Tabs
          defaultValue="summary"
          className="flex flex-1 flex-col"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="hindi">Hindi</TabsTrigger>
            <TabsTrigger value="telugu">Telugu</TabsTrigger>
          </TabsList>
          <div className="relative mt-4 flex flex-1">
            <ScrollArea className="absolute inset-0 pr-3">
              <TabsContent value="summary" className="space-y-4">
                {summary.trim() ? (
                  <MarkdownRenderer content={summary} />
                ) : isLoadingSummary ? (
                  <LoadingSkeleton />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Upload a document to generate a concise briefing.
                  </p>
                )}
              </TabsContent>
              <TabsContent value="hindi" className="space-y-4">
                {renderTranslationContent("hindi")}
              </TabsContent>
              <TabsContent value="telugu" className="space-y-4">
                {renderTranslationContent("telugu")}
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
