"use client";

import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  useBriefingHistory,
  type BriefingRecord,
} from "@/hooks/use-briefing-history";

const HistoryList = ({ records }: { records: BriefingRecord[] }) => {
  if (!records.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 px-6 py-14 text-center text-sm text-muted-foreground">
        Upload a document to see it appear here. Your last 20 briefings will
        stay handy for quick reference.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              {item.file_name}
            </p>
            <p className="text-xs text-muted-foreground">
              Uploaded {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary">
            {item.summary ? "Summary captured" : "Processing"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const { data, isLoading, error } = useBriefingHistory(user?.id);

  const showSkeleton = loading || isLoading;
  const records = data ?? [];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Briefing History
          </h1>
          <p className="text-sm text-muted-foreground">
            Your most recent uploads stay here for quick reference. Enterprise plans can sync a longer archive.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/workspace">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to workspace
          </Link>
        </Button>
      </div>

      <Card className="border border-border/60 bg-[hsl(var(--card))]/95 shadow-[0_18px_36px_rgba(17,23,40,0.18)] backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Recent uploads</CardTitle>
            <CardDescription>Latest 20 documents summarized by EasyDox.</CardDescription>
          </div>
          <Clock className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error.message}
            </div>
          ) : showSkeleton ? (
            <div className="space-y-3">
              <div className="h-14 rounded-2xl bg-muted/30" />
              <div className="h-14 rounded-2xl bg-muted/30" />
              <div className="h-14 rounded-2xl bg-muted/30" />
            </div>
          ) : (
            <HistoryList records={records} />
          )}
          <p className="text-xs text-muted-foreground">
            Need a longer retention window? Reach out to support to enable enterprise history sync.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
