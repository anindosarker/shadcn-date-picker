import { cn } from '@/lib/cn';

export function ExampleTableSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading example"
      className={cn('animate-pulse space-y-3', className)}
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-56 rounded-md bg-muted" />
      </div>
    </div>
  );
}
