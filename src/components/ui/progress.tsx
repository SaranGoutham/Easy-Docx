import * as React from 'react';
import { cn } from '@/lib/utils';

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number | null;
    indeterminate?: boolean;
  }
>(({ className, value, indeterminate, ...props }, ref) => {
  const percentage =
    value !== undefined && value !== null
      ? Math.min(100, Math.max(0, value))
      : undefined;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      className={cn(
        'relative h-1.5 w-full overflow-hidden rounded-full bg-muted',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full w-full flex-1 rounded-full bg-primary transition-all duration-300 ease-out',
          indeterminate && 'animate-[progress-indeterminate_1.5s_ease-in-out_infinite]',
        )}
        style={
          indeterminate ? undefined : { transform: `translateX(-${100 - (percentage ?? 0)}%)` }
        }
      />
    </div>
  );
});

Progress.displayName = 'Progress';

export { Progress };
