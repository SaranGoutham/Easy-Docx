'use client';

import { useAuth } from '@/hooks/use-auth';
import { AuthForm } from '@/components/auth/auth-form';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { loading, user } = useAuth();

  // The AuthProvider handles all redirection logic.
  // We just need to show a loader while the initial auth check is happening,
  // or if a user is logged in and is about to be redirected.
  if (loading || user) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center bg-[hsl(var(--background))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(108,129,255,0.18),transparent_62%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(86,107,255,0.22),transparent_60%)]" />
        <Loader2 className="relative z-10 h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  // If not loading and there's no user, show the login form.
  return (
    <main className="relative flex min-h-screen flex-col bg-[hsl(var(--background))] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(108,129,255,0.22),transparent_62%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(88,107,255,0.24),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-64 w-[520px] rounded-full bg-primary/10 blur-3xl" />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 md:px-10">
        <AuthForm />
        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p className="font-medium tracking-wider text-foreground/80">EASYDOX AI</p>
          <p className="mt-2 text-muted-foreground/80">Crafted for legal, compliance, and finance teams who move fast and expect clarity.</p>
        </footer>
      </div>
    </main>
  );
}
