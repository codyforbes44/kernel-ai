import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import {
  BookOpen,
  Code,
  Lightbulb,
  ExternalLink,
  BarChart3,
} from "lucide-react";

interface MobileContextPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
];

const tips = [
  "Create templates for frequently used prompts",
  "Pin conversations you reference often",
  "Export conversations as Markdown",
  "Star important messages for quick reference",
];

const resources = [
  { title: "Lovable Docs", url: "https://docs.lovable.dev" },
  { title: "Supabase Docs", url: "https://supabase.com/docs" },
  { title: "Tailwind CSS", url: "https://tailwindcss.com/docs" },
  { title: "shadcn/ui", url: "https://ui.shadcn.com" },
];

export function MobileContextPanel({ open, onOpenChange }: MobileContextPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl p-0">
        <SheetHeader className="p-4 border-b border-border/50">
          <SheetTitle>Quick Reference</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="analytics" className="flex-1 flex flex-col h-[calc(80vh-60px)]">
          <TabsList className="mx-4 mt-2 grid grid-cols-4">
            <TabsTrigger value="analytics" className="text-xs px-2">
              <BarChart3 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="snippets" className="text-xs px-2">
              <Code className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-xs px-2">
              <Lightbulb className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-xs px-2">
              <BookOpen className="h-4 w-4" />
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
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{resource.title}</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
