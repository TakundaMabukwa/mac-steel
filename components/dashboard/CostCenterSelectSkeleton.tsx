import { Skeleton } from '@/components/ui/skeleton';

export function CostCenterSelectSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-full h-10" />
    </div>
  );
}

export function CostCenterSelectSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CostCenterSelectSkeleton key={i} />
      ))}
    </div>
  );
}
