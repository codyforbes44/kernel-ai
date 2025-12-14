import { useState, useEffect, useRef } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useTemplates } from "@/hooks/useTemplates";
import type { PromptTemplate, TemplateCategory } from "@/types/database";
import { Bug, Component, Database, Zap, Shield, Gauge, Palette, RefreshCw, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplatePickerProps {
  onSelect: (template: PromptTemplate) => void;
  onClose: () => void;
  searchQuery?: string;
}

const categoryIcons: Record<TemplateCategory, React.ReactNode> = {
  debug: <Bug className="h-4 w-4" />,
  component: <Component className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  edge_function: <Zap className="h-4 w-4" />,
  rls: <Shield className="h-4 w-4" />,
  performance: <Gauge className="h-4 w-4" />,
  ui_ux: <Palette className="h-4 w-4" />,
  refactor: <RefreshCw className="h-4 w-4" />,
  docs: <FileText className="h-4 w-4" />,
  custom: <Sparkles className="h-4 w-4" />,
};

const categoryLabels: Record<TemplateCategory, string> = {
  debug: "Debug",
  component: "Component",
  database: "Database",
  edge_function: "Edge Function",
  rls: "RLS",
  performance: "Performance",
  ui_ux: "UI/UX",
  refactor: "Refactor",
  docs: "Docs",
  custom: "Custom",
};

const categoryColors: Record<TemplateCategory, string> = {
  debug: "bg-red-500/10 text-red-500 border-red-500/20",
  component: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  database: "bg-green-500/10 text-green-500 border-green-500/20",
  edge_function: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  rls: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  performance: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  ui_ux: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  refactor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  docs: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  custom: "bg-primary/10 text-primary border-primary/20",
};

export function TemplatePicker({ onSelect, onClose, searchQuery = "" }: TemplatePickerProps) {
  const { templates, templatesByCategory, loading, incrementUsage } = useTemplates();
  const [search, setSearch] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSelect = async (template: PromptTemplate) => {
    await incrementUsage(template.id);
    onSelect(template);
    onClose();
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Object.keys(templatesByCategory) as TemplateCategory[];

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
      <Command className="rounded-xl border border-border/50 bg-card shadow-2xl">
        <CommandInput
          ref={inputRef}
          placeholder="Search templates..."
          value={search}
          onValueChange={setSearch}
          className="border-0"
        />
        <CommandList className="max-h-[300px]">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No templates found. Create one in settings.
          </CommandEmpty>
          
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : search ? (
            <CommandGroup heading="Results">
              {filteredTemplates.map((template) => (
                <TemplateItem
                  key={template.id}
                  template={template}
                  onSelect={handleSelect}
                />
              ))}
            </CommandGroup>
          ) : (
            categories.map((category) => (
              <CommandGroup key={category} heading={categoryLabels[category]}>
                {templatesByCategory[category]?.map((template) => (
                  <TemplateItem
                    key={template.id}
                    template={template}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            ))
          )}
        </CommandList>
        
        <div className="border-t border-border/50 px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>↑↓ Navigate • Enter to select • Esc to close</span>
          <span>{templates.length} templates</span>
        </div>
      </Command>
    </div>
  );
}

function TemplateItem({
  template,
  onSelect,
}: {
  template: PromptTemplate;
  onSelect: (template: PromptTemplate) => void;
}) {
  return (
    <CommandItem
      value={`${template.name} ${template.description} ${template.category}`}
      onSelect={() => onSelect(template)}
      className="flex items-start gap-3 py-3 cursor-pointer"
    >
      <div className={cn("p-1.5 rounded-md", categoryColors[template.category])}>
        {categoryIcons[template.category]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{template.name}</span>
          {template.is_favorite && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              ★
            </Badge>
          )}
        </div>
        {template.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {template.description}
          </p>
        )}
        {template.variables.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {template.variables.slice(0, 3).map((v) => (
              <Badge
                key={v}
                variant="outline"
                className="text-[10px] px-1.5 py-0 font-mono"
              >
                {`{{${v}}}`}
              </Badge>
            ))}
            {template.variables.length > 3 && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0"
              >
                +{template.variables.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {template.usage_count} uses
      </span>
    </CommandItem>
  );
}
