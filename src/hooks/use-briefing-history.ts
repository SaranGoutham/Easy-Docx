"use client";

import useSWR from "swr";
import { supabase } from "@/lib/supabase";
export type BriefingRecord = {
  id: string;
  user_id: string;
  file_name: string;
  summary: string | null;
  created_at: string;
};

const fetcher = async (userId: string | undefined) => {
  if (!userId) return [] as BriefingRecord[];
  const { data, error } = await supabase
    .from("document_briefings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as BriefingRecord[];
};

export const useBriefingHistory = (userId?: string | null) => {
  return useSWR(
    userId ? ["briefing-history", userId] : null,
    () => fetcher(userId ?? undefined),
    {
      revalidateOnFocus: false,
    }
  );
};
