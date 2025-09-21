"use client";

import { useState, DragEvent } from "react";
import type { Document } from "@/app/workspace/page";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  UploadCloud,
  FileText,
  Loader2,
  Sparkles,
  ShieldCheck,
  History,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { extractTextFromFile } from "@/ai/flows/extract-text-from-file";
import { UserProfile } from "./user-profile";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
];

interface UploadViewProps {
  onProcess: (document: Document) => void;
}

const featureHighlights = [
  {
    icon: Sparkles,
    title: "AI briefings that stay on task",
    description:
      "Condense complex agreements into stakeholder-ready talking points and clear next actions.",
  },
  {
    icon: ShieldCheck,
    title: "Security-first by design",
    description:
      "Regional processing, zero retention, and SOC2-aligned controls that legal and compliance sign off on.",
  },
  {
    icon: History,
    title: "Institutional memory unlocked",
    description:
      "Browse prior uploads, compare revisions, and reuse AI answers at the speed of deal flow.",
  },
];

const secondaryHighlights = [
  "Drag & drop or browse from secure storage",
  "Supports PDF, Word, and image-based agreements",
  "Summaries flag obligations, dates, and watch-outs automatically",
];

export function UploadView({ onProcess }: UploadViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
        toast({
          variant: "destructive",
          title: "Unsupported file type",
          description: `Please upload a PDF, DOC, DOCX, PPTX, JPG, or PNG file.`,
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcessClick = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Choose a document before starting the analysis.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const fileDataUri = await fileToDataUri(file);
      const result = await extractTextFromFile({ fileDataUri });
      onProcess({ name: file.name, text: result.extractedText });
      toast({
        title: "Document received",
        description: "We are generating your summary now.",
      });
    } catch (error) {
      console.error("Error processing document:", error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description:
          "Could not extract text from the document. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isProcessable = file && !isLoading;

  return (
    <div className="relative grid w-full max-w-6xl gap-12 px-4 xl:grid-cols-[1.08fr,0.92fr] xl:px-0">
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,_rgba(96,116,255,0.18),transparent_55%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(78,98,255,0.24),transparent_60%)]" />
      <section className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-border/60 bg-[hsl(var(--background))] p-10 shadow-[0_24px_48px_rgba(16,22,40,0.14)]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(108,129,255,0.16),transparent_62%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(88,107,255,0.22),transparent_60%)]" />
        <div className="space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-[2.75rem]">
                Document Briefing Hub
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                Upload agreements, NDAs, or policy decks. EasyDox turns them
                into concise travel-ready briefs with obligations, risk
                call-outs, and suggested follow-ups.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-10 gap-2"
                onClick={() => router.push("/workspace/history")}
              >
                <History className="h-4 w-4" />
                History
              </Button>
              <UserProfile />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-primary/35 bg-primary/10 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.32em] text-primary/70">
                Turnaround
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-primary">12s</span>
                <span className="text-xs text-primary/65">
                  to first draft summary
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-[rgba(26,170,129,0.12)] px-4 py-4 dark:border-emerald-400/35 dark:bg-[rgba(26,170,129,0.08)]">
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-600 dark:text-emerald-200">
                Confidence
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-200">
                  97%
                </span>
                <span className="text-xs text-emerald-600/80 dark:text-emerald-200/70">
                  human validated
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-muted/40 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">
                Retention
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-foreground">
                  0 days
                </span>
                <span className="text-xs text-muted-foreground">
                  of data stored
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-5">
            {featureHighlights.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-2xl border border-border/50 bg-card/70 px-4 py-4 shadow-[0_12px_28px_rgba(18,26,44,0.1)]"
              >
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-8">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            What to expect
          </p>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {secondaryHighlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Card className="relative h-full w-full overflow-hidden border border-border/60 bg-[hsl(var(--card))]/95 shadow-[0_20px_42px_rgba(17,23,40,0.18)]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(122,144,255,0.16),transparent_65%)] dark:bg-[radial-gradient(circle_at_top,_rgba(94,112,255,0.22),transparent_60%)]" />
        <CardHeader className="space-y-2 pb-0">
          <CardTitle className="text-2xl">Upload Your Document</CardTitle>
          <CardDescription>
            Securely parse files up to 50 MB in one click.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-7 pt-6">
          <div
            className={`relative flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              dragActive
                ? "border-primary bg-accent/10"
                : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() =>
              !isLoading && document.getElementById("file-upload")?.click()
            }
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept={ACCEPTED_FILE_TYPES.join(",")}
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              disabled={isLoading}
            />
            {file ? (
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-2 font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  Drag &amp; drop a file or{" "}
                  <span className="text-accent font-semibold">
                    click to upload
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, DOC, DOCX, JPG, PNG
                </p>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleProcessClick}
            disabled={!isProcessable}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Processing..." : "Summarize & Analyze"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
