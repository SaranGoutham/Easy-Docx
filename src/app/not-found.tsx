import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--background))] px-6 py-16 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(108,129,255,0.22),transparent_62%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(88,107,255,0.24),transparent_60%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center space-y-6 text-center">
        <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.35em] text-primary">
          404
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">We couldn’t find that page</h1>
        <p className="text-sm text-muted-foreground">
          The link you followed might be broken or the content has been moved. Let’s get you back on track.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/workspace">Go to workspace</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Return to sign in</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
