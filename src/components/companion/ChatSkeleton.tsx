import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ChatSkeleton() {
  return (
    <Card className="h-[600px] flex flex-col" aria-label="Loading chat">
      {/* Header */}
      <CardHeader className="flex-shrink-0 border-b py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardHeader>

      {/* Messages area */}
      <CardContent className="flex-1 flex flex-col justify-end p-4 overflow-hidden">
        <div className="space-y-4">
          {/* Companion message */}
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <Skeleton className="h-20 w-64 rounded-2xl rounded-tl-sm" delay={100} />
            </div>
          </div>
          
          {/* User message */}
          <div className="flex justify-end">
            <Skeleton className="h-12 w-48 rounded-2xl rounded-tr-sm" delay={200} />
          </div>
          
          {/* Companion message */}
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[80%]">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <Skeleton className="h-16 w-56 rounded-2xl rounded-tl-sm" delay={300} />
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
