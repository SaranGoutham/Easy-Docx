"use client";

import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[hsl(var(--background))]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-foreground">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-10 md:px-8 lg:px-10">
        {children}
      </main>
    </div>
  );
}
