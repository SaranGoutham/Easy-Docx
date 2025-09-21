'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/legal-ease/user-profile';

const navigation = [
  { label: 'Workspace', href: '/workspace' },
  { label: 'History', href: '/workspace/history' },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border/60 bg-[hsl(var(--background))]/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:gap-6">
        <Link href="/workspace" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
            <span className="text-sm font-semibold">ED</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight text-foreground">EasyDox AI</span>
            <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Workspace</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navigation.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? 'text-primary'
                    : 'transition-colors hover:text-foreground'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="sm:hidden">
            <Link href="/workspace/history">History</Link>
          </Button>
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
