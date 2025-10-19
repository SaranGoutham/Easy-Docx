"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, loading, refreshSession } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const ensureSession = async () => {
      // In email link flows, supabase-js processes the URL hash on load.
      // We nudge a session refresh just in case and then route onward.
      await refreshSession();
      if (!cancelled) {
        if (user) {
          router.replace("/workspace");
        } else {
          // If still no user (e.g., verification screen), go home.
          router.replace("/");
        }
      }
    };

    // If we already have a user, bounce immediately.
    if (user && !loading) {
      router.replace("/workspace");
      return;
    }

    // Otherwise, attempt to confirm and move on.
    ensureSession();

    return () => {
      cancelled = true;
    };
  }, [user, loading, router, refreshSession]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-semibold">Completing sign-in…</p>
        <p className="text-muted-foreground mt-2">You’ll be redirected shortly.</p>
      </div>
    </div>
  );
}

