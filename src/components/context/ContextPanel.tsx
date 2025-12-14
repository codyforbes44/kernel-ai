import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  BookOpen,
  Code,
  Lightbulb,
  ExternalLink,
  BarChart3,
} from "lucide-react";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

interface ContextPanelProps {
  onClose: () => void;
}

const quickReference = [
  {
    title: "Supabase Client",
    code: `import { supabase } from "@/integrations/supabase/client";`,
  },
  {
    title: "RLS Policy Template",
    code: `CREATE POLICY "Users can view own data"
ON public.table_name
FOR SELECT
USING (auth.uid() = user_id);`,
  },
  {
    title: "Edge Function",
    code: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});`,
  },
  {
    title: "useQuery Hook",
    code: `const { data, isLoading, error } = useQuery({
  queryKey: ['items'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*');
    if (error) throw error;
    return data;
  },
});`,
  },
];

const tips = [
  "Use ⌘K to quickly search and navigate",
  "Star important messages for quick reference",
  "Create templates for frequently used prompts",
  "Pin conversations you reference often",
  "Use ⌘B to toggle the sidebar",
  "Export conversations as Markdown for documentation",
];

const resources = [
  { title: "Lovable Documentation", url: "https://docs.lovable.dev" },
  { title: "Supabase Docs", url: "https://supabase.com/docs" },
  { title: "TanStack Query", url: "https://tanstack.com/query" },
  { title: "Tailwind CSS", url: "https://tailwindcss.com/docs" },
  { title: "shadcn/ui", url: "https://ui.shadcn.com" },
];

export function ContextPanel({ onClose }: ContextPanelProps) {
  return (
    <div className="h-full flex flex-col bg-sidebar border-l border-border/50">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border/50">
        <h2 className="font-semibold text-sm">Quick Reference</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 grid grid-cols-4">
          <TabsTrigger value="analytics" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="snippets" className="text-xs">
            <Code className="h-3 w-3 mr-1" />
            Code
          </TabsTrigger>
          <TabsTrigger value="tips" className="text-xs">
            <Lightbulb className="h-3 w-3 mr-1" />
            Tips
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs">
            <BookOpen className="h-3 w-3 mr-1" />
            Docs
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value="analytics" className="m-0">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="snippets" className="m-0 space-y-4">
            {quickReference.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/50 overflow-hidden"
              >
                <div className="px-3 py-2 bg-muted/50 border-b border-border/50">
                  <span className="text-xs font-medium">{item.title}</span>
                </div>
                <pre className="p-3 text-xs font-mono overflow-x-auto">
                  <code>{item.code}</code>
                </pre>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tips" className="m-0 space-y-2">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
              >
                <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="resources" className="m-0 space-y-2">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <span className="text-sm font-medium">{resource.title}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
