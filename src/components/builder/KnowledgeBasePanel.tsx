import { useState } from 'react';
import { BookMarked, FileText, Settings2, Code, FileCode, Download, Upload, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useKnowledgeBase } from '@/hooks/useKnowledgeBase';
import { InstructionsEditor } from './knowledge-base/InstructionsEditor';
import { TechStackEditor } from './knowledge-base/TechStackEditor';
import { ConventionsEditor } from './knowledge-base/ConventionsEditor';
import { ContextDocsEditor } from './knowledge-base/ContextDocsEditor';
import { cn } from '@/lib/utils';

interface KnowledgeBasePanelProps {
  projectId: string;
}

export function KnowledgeBasePanel({ projectId }: KnowledgeBasePanelProps) {
  const [activeTab, setActiveTab] = useState('instructions');
  const {
    knowledgeBase,
    isLoading,
    isSaving,
    updateInstructions,
    addTechStackItem,
    updateTechStackItem,
    removeTechStackItem,
    updateConventions,
    addCustomRule,
    removeCustomRule,
    addContextDoc,
    updateContextDoc,
    removeContextDoc,
    exportKnowledgeBase,
    importKnowledgeBase,
  } = useKnowledgeBase(projectId);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        importKnowledgeBase(file);
      }
    };
    input.click();
  };

  // Calculate token estimate (rough: 4 chars = 1 token)
  const estimatedTokens = Math.round(
    (knowledgeBase.instructions.length +
      knowledgeBase.techStack.reduce((acc, t) => acc + t.name.length + (t.version?.length || 0) + (t.notes?.length || 0), 0) +
      Object.values(knowledgeBase.conventions).flat().join('').length +
      knowledgeBase.contextDocs.reduce((acc, d) => acc + d.title.length + d.content.length, 0)) / 4
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background border-l border-border">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      {/* Header */}
      <div className="h-10 flex items-center justify-between gap-2 px-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <BookMarked className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Knowledge Base</span>
          {isSaving && (
            <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleImport} title="Import">
            <Upload className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={exportKnowledgeBase} title="Export">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-4 h-9 mx-2 mt-2">
          <TabsTrigger value="instructions" className="text-xs gap-1 data-[state=active]:gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Instructions</span>
          </TabsTrigger>
          <TabsTrigger value="tech" className="text-xs gap-1 data-[state=active]:gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tech</span>
          </TabsTrigger>
          <TabsTrigger value="conventions" className="text-xs gap-1 data-[state=active]:gap-1.5">
            <Code className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Style</span>
          </TabsTrigger>
          <TabsTrigger value="docs" className="text-xs gap-1 data-[state=active]:gap-1.5">
            <FileCode className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Docs</span>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-3">
            <TabsContent value="instructions" className="m-0">
              <InstructionsEditor
                value={knowledgeBase.instructions}
                onChange={updateInstructions}
              />
            </TabsContent>

            <TabsContent value="tech" className="m-0">
              <TechStackEditor
                items={knowledgeBase.techStack}
                onAdd={addTechStackItem}
                onUpdate={updateTechStackItem}
                onRemove={removeTechStackItem}
              />
            </TabsContent>

            <TabsContent value="conventions" className="m-0">
              <ConventionsEditor
                conventions={knowledgeBase.conventions}
                onUpdate={updateConventions}
                onAddRule={addCustomRule}
                onRemoveRule={removeCustomRule}
              />
            </TabsContent>

            <TabsContent value="docs" className="m-0">
              <ContextDocsEditor
                docs={knowledgeBase.contextDocs}
                onAdd={addContextDoc}
                onUpdate={updateContextDoc}
                onRemove={removeContextDoc}
              />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      {/* Footer with token estimate */}
      <div className="px-3 py-2 border-t border-border bg-muted/30">
        <p className={cn(
          "text-xs text-muted-foreground",
          estimatedTokens > 2000 && "text-warning",
          estimatedTokens > 4000 && "text-destructive"
        )}>
          ~{estimatedTokens.toLocaleString()} tokens • Added to every AI request
        </p>
      </div>
    </div>
  );
}
