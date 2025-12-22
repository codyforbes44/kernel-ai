import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// File explorer skeleton with realistic file tree structure
export function FileExplorerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("h-full flex flex-col bg-sidebar-background border-r border-sidebar-border", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      
      {/* File tree */}
      <div className="flex-1 p-2 space-y-1">
        {/* Root folder */}
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="h-4 w-4 rounded" delay={0} />
          <Skeleton className="h-4 w-4 rounded" delay={50} />
          <Skeleton className="h-4 w-16" delay={100} />
        </div>
        
        {/* Nested items */}
        {[0, 1, 2].map((i) => (
          <div key={`folder-${i}`} className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 ml-3">
              <Skeleton className="h-4 w-4 rounded" delay={150 + i * 100} />
              <Skeleton className="h-4 w-4 rounded" delay={200 + i * 100} />
              <Skeleton className="h-4 w-20" delay={250 + i * 100} />
            </div>
            
            {/* Files in folder */}
            {[0, 1].map((j) => (
              <div key={`file-${i}-${j}`} className="flex items-center gap-2 px-2 py-1.5 ml-6">
                <Skeleton className="h-4 w-4 rounded" delay={300 + i * 100 + j * 50} />
                <Skeleton className="h-4 w-24" delay={350 + i * 100 + j * 50} />
              </div>
            ))}
          </div>
        ))}
        
        {/* Additional root files */}
        {[0, 1, 2].map((i) => (
          <div key={`root-file-${i}`} className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-4 w-4 rounded" delay={600 + i * 50} />
            <Skeleton className={`h-4 w-${i === 0 ? '28' : i === 1 ? '20' : '24'}`} delay={650 + i * 50} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Editor tabs skeleton
export function EditorTabsSkeleton() {
  return (
    <div className="h-10 bg-background border-b border-border flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-2 px-3 h-8 border-r border-border rounded-t",
            i === 0 ? "bg-background" : "bg-muted/30"
          )}
        >
          <Skeleton className="h-4 w-4 rounded" delay={i * 100} />
          <Skeleton className="h-4 w-16" delay={i * 100 + 50} />
        </div>
      ))}
    </div>
  );
}

// Code editor skeleton with line numbers and code-like structure
export function EditorSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex-1 bg-[hsl(var(--code-background))] overflow-hidden", className)}>
      <div className="flex h-full">
        {/* Line numbers */}
        <div className="w-12 border-r border-border/30 pt-4 flex flex-col items-end pr-3 gap-1.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-3 w-4 bg-muted/50" 
              delay={i * 30} 
            />
          ))}
        </div>
        
        {/* Code content */}
        <div className="flex-1 pt-4 pl-4 space-y-1.5">
          {/* Import statements */}
          <div className="flex gap-2">
            <Skeleton className="h-4 w-12" delay={0} />
            <Skeleton className="h-4 w-24" delay={50} />
            <Skeleton className="h-4 w-8" delay={100} />
            <Skeleton className="h-4 w-32" delay={150} />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-12" delay={100} />
            <Skeleton className="h-4 w-20" delay={150} />
            <Skeleton className="h-4 w-8" delay={200} />
            <Skeleton className="h-4 w-28" delay={250} />
          </div>
          <Skeleton className="h-4 w-0" /> {/* Empty line */}
          
          {/* Function/component */}
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16" delay={200} />
            <Skeleton className="h-4 w-8" delay={250} />
            <Skeleton className="h-4 w-32" delay={300} />
            <Skeleton className="h-4 w-4" delay={350} />
          </div>
          
          {/* Function body */}
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2 ml-4">
              <Skeleton className="h-4 w-16" delay={400 + i * 80} />
              <Skeleton className="h-4 w-20" delay={450 + i * 80} />
              <Skeleton className="h-4 w-12" delay={500 + i * 80} />
            </div>
          ))}
          
          <Skeleton className="h-4 w-0" /> {/* Empty line */}
          
          {/* Return statement */}
          <div className="flex gap-2 ml-4">
            <Skeleton className="h-4 w-12" delay={700} />
            <Skeleton className="h-4 w-4" delay={750} />
          </div>
          
          {/* JSX content */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={`jsx-${i}`} className="flex gap-2 ml-8">
              <Skeleton className="h-4 w-8" delay={800 + i * 60} />
              <Skeleton className="h-4 w-24" delay={850 + i * 60} />
              <Skeleton className="h-4 w-16" delay={900 + i * 60} />
            </div>
          ))}
          
          {/* Closing brackets */}
          <div className="flex gap-2 ml-4">
            <Skeleton className="h-4 w-4" delay={1100} />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-4" delay={1150} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Preview skeleton with browser-like structure
export function PreviewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {/* Browser toolbar */}
      <div className="h-10 border-b border-border flex items-center gap-2 px-3">
        <div className="flex gap-1.5">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-3 rounded-full" delay={50} />
          <Skeleton className="h-3 w-3 rounded-full" delay={100} />
        </div>
        <Skeleton className="h-6 flex-1 max-w-md rounded-full" delay={150} />
        <Skeleton className="h-6 w-6 rounded" delay={200} />
      </div>
      
      {/* Preview content */}
      <div className="flex-1 p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" delay={250} />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded" delay={300} />
            <Skeleton className="h-8 w-24 rounded" delay={350} />
          </div>
        </div>
        
        {/* Hero section */}
        <div className="space-y-4 pt-8">
          <Skeleton className="h-12 w-3/4" delay={400} />
          <Skeleton className="h-6 w-1/2" delay={450} />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 w-32 rounded" delay={500} />
            <Skeleton className="h-10 w-28 rounded" delay={550} />
          </div>
        </div>
        
        {/* Cards grid */}
        <div className="grid grid-cols-3 gap-4 pt-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3 p-4 border border-border rounded-lg">
              <Skeleton className="h-24 w-full rounded" delay={600 + i * 100} />
              <Skeleton className="h-5 w-3/4" delay={650 + i * 100} />
              <Skeleton className="h-4 w-full" delay={700 + i * 100} />
              <Skeleton className="h-4 w-2/3" delay={750 + i * 100} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Panel skeleton for side panels
export function PanelSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("h-full flex flex-col bg-card border-l border-border", className)}>
      {/* Panel header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-6 rounded" delay={50} />
      </div>
      
      {/* Panel content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Search/filter bar */}
        <Skeleton className="h-9 w-full rounded" delay={100} />
        
        {/* List items */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Skeleton className="h-10 w-10 rounded" delay={150 + i * 80} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" delay={200 + i * 80} />
              <Skeleton className="h-3 w-1/2" delay={250 + i * 80} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Full builder loading skeleton
export function BuilderLoadingSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-background animate-fade-in">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-3 rounded" delay={50} />
          <Skeleton className="h-4 w-24" delay={100} />
        </div>
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-8 rounded" delay={150 + i * 50} />
          ))}
          <Skeleton className="h-8 w-16 rounded" delay={500} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* File explorer */}
        <div className="w-56 border-r border-border">
          <FileExplorerSkeleton />
        </div>
        
        {/* Editor area */}
        <div className="flex-1 flex flex-col">
          <EditorTabsSkeleton />
          <EditorSkeleton />
        </div>
        
        {/* Preview */}
        <div className="w-[40%] border-l border-border">
          <PreviewSkeleton />
        </div>
      </div>
    </div>
  );
}

// Project card skeleton for the projects list page
export function ProjectCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <Card className="animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-10 w-10 rounded-lg" delay={delay} />
          <Skeleton className="h-8 w-8 rounded opacity-0" />
        </div>
        <Skeleton className="h-5 w-3/4 mt-3" delay={delay + 50} />
        <Skeleton className="h-4 w-full mt-2" delay={delay + 100} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded" delay={delay + 150} />
          <Skeleton className="h-3 w-32" delay={delay + 200} />
        </div>
      </CardContent>
    </Card>
  );
}

// Projects grid skeleton
export function ProjectsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} delay={i * 100} />
      ))}
    </div>
  );
}
