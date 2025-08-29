import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CostCenterSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-64 h-4" />
      </div>
      
      {/* Stats Cards Skeleton */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="bg-white border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="w-32 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="w-16 h-8" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Cost Centers Table Skeleton */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-gray-200 border-b">
          <Skeleton className="w-32 h-6" />
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-24 h-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
