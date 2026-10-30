import React from 'react';
import { cn } from '../lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--radius-sm)] bg-[var(--surface-muted)]/80', className)}
      {...props}
    />
  );
}

export function VerseSkeleton() {
  return (
    <div className="space-y-[0.75rem] py-[0.5rem]">
      <div className="flex items-baseline gap-[0.75rem]">
        <Skeleton className="w-[1.5rem] h-[1rem] shrink-0" />
        <div className="space-y-[0.4rem] flex-1">
          <Skeleton className="w-full h-[1.125rem]" />
          <Skeleton className="w-[85%] h-[1.125rem]" />
        </div>
      </div>
    </div>
  );
}

export function StudyCardSkeleton() {
  return (
    <div className="p-[1.25rem] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] space-y-[0.875rem]">
      <div className="flex justify-between items-center">
        <Skeleton className="w-[7rem] h-[1.25rem]" />
        <Skeleton className="w-[3rem] h-[0.875rem]" />
      </div>
      <Skeleton className="w-full h-[2rem]" />
      <div className="flex gap-[0.5rem]">
        <Skeleton className="w-[4rem] h-[1.25rem] rounded-full" />
        <Skeleton className="w-[5rem] h-[1.25rem] rounded-full" />
      </div>
    </div>
  );
}
