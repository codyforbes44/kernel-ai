import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CompanionPageSkeleton() {
  return (
    <div className="container max-w-6xl py-8">
      {/* Header skeleton */}
      <div className="text-center space-y-2 mb-6">
        <Skeleton className="h-9 w-48 mx-auto" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Left Sidebar skeleton */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" delay={i * 100} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main chat area skeleton */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0 border-b">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <Skeleton 
                    className={`h-16 rounded-2xl ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`} 
                    delay={i * 150}
                  />
                </div>
              ))}
            </div>
            <Skeleton className="h-12 mt-4 rounded-xl" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
