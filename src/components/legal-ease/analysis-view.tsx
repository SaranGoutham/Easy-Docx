"use client";

import type { Document } from "@/app/workspace/page";
import { Button } from "@/components/ui/button";
import { ChevronLeft, History } from "lucide-react";
import { SummaryCard } from "./summary-card";
import { QAChat } from "./qa-chat";
import { UserProfile } from "./user-profile";
import { useRouter } from "next/navigation";

interface AnalysisViewProps {
  document: Document;
  onBack: () => void;
}

export function AnalysisView({ document, onBack }: AnalysisViewProps) {
  const router = useRouter();

  const handleHistory = () => {
    router.push("/workspace/history");
  };

  return (
    <div className="relative w-full max-w-7xl overflow-hidden rounded-[2rem] border border-border/60 bg-[hsl(var(--card))]/95 p-8 shadow-[0_18px_38px_rgba(16,22,40,0.14)] animate-in fade-in-50 duration-500">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(112,132,255,0.16),transparent_65%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(90,110,255,0.22),transparent_60%)]" />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            aria-label="Back to upload"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Analysis Result</h2>
            <p className="text-sm text-muted-foreground truncate max-w-xs sm:max-w-md">
              {document.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleHistory}
            className="gap-2 border-primary/40 text-primary"
          >
            <History className="h-4 w-4" />
            View History
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:gap-8">
        <SummaryCard documentText={document.text} fileName={document.name} />
        <QAChat documentText={document.text} />
      </div>
    </div>
  );
}
