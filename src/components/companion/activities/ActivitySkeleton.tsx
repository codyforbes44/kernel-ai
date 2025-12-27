import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ActivitySkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading activities">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded" delay={i * 100} />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" delay={i * 100} />
                  <Skeleton className="h-3 w-40" delay={i * 100 + 50} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" delay={i * 100 + 100} />
              <Skeleton className="h-5 w-20 rounded-full" delay={i * 100 + 150} />
            </div>
          </CardContent>
        </Card>
      ))}
      <span className="sr-only">Loading activities...</span>
    </div>
  );
}
