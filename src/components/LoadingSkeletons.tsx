import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CardSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-24 w-full" />
    </CardContent>
  </Card>
);

export const TableSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
  </div>
);

export const ChartSkeleton = () => (
  <Card className="w-full">
    <CardHeader>
      <Skeleton className="h-6 w-1/3" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

export const PageSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-12 w-1/3" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <ChartSkeleton />
  </div>
);
