import { useState, useEffect } from 'react';
import { Palette, Sparkles, Check, Trash2, Copy, Loader2, Type, Layers, Eye, EyeOff, Download, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDesignSystem } from '@/hooks/useDesignSystem';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { DesignSystem } from '@/types/marketplace';
import { exportDesignTokens, downloadTokensFile, type ExportFormat } from '@/lib/designTokensExporter';

interface DesignSystemPanelProps {
  projectId: string;
  onPreviewChange?: (cssVariables: string | null, systemName?: string, fontsUrl?: string | null) => void;
}

const STYLE_PRESETS = [
  { value: 'modern', label: 'Modern & Clean' },
  { value: 'playful', label: 'Playful & Colorful' },
  { value: 'corporate', label: 'Corporate & Professional' },
  { value: 'minimal', label: 'Minimal & Elegant' },
  { value: 'bold', label: 'Bold & Vibrant' },
  { value: 'dark', label: 'Dark Mode First' },
  { value: 'retro', label: 'Retro & Vintage' },
  { value: 'nature', label: 'Nature Inspired' },
];

export function DesignSystemPanel({ projectId, onPreviewChange }: DesignSystemPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('modern');
  const [activeTab, setActiveTab] = useState('generate');

  const {
    designSystems,
    activeSystem,
    isLoading,
    isGenerating,
    generateDesignSystem,
    activateSystem,
    isActivating,
    deleteSystem,
    generateCSSVariables,
    generateGoogleFontsUrl,
    previewSystem,
    setPreviewSystem,
  } = useDesignSystem({ projectId });

  // Notify parent when preview changes
  useEffect(() => {
    if (previewSystem) {
      const css = generateCSSVariables(previewSystem);
      const fontsUrl = generateGoogleFontsUrl(previewSystem);
      onPreviewChange?.(css, previewSystem.name, fontsUrl);
    } else {
      onPreviewChange?.(null);
    }
  }, [previewSystem, generateCSSVariables, generateGoogleFontsUrl, onPreviewChange]);

  const handleTogglePreview = (system: DesignSystem) => {
    if (previewSystem?.id === system.id) {
      setPreviewSystem(null);
    } else {
      setPreviewSystem(system);
    }
  };

  const handleActivateSystem = (systemId: string) => {
    setPreviewSystem(null);
    activateSystem(systemId);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your design system');
      return;
    }
    await generateDesignSystem(prompt, style);
    setPrompt('');
  };

  const handleCopyCSS = (system: DesignSystem) => {
    const css = generateCSSVariables(system);
    navigator.clipboard.writeText(css);
    toast.success('CSS copied to clipboard');
  };

  const handleExport = (system: DesignSystem, format: ExportFormat) => {
    const content = exportDesignTokens(system, { format, includeComments: true });
    const safeName = system.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    downloadTokensFile(content, `${safeName}-tokens`, format);
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  const renderColorSwatch = (color: string | { DEFAULT: string; foreground?: string }, name: string) => {
    const hexColor = typeof color === 'string' ? color : color.DEFAULT;
    return (
      <div key={name} className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-md border border-border shadow-sm"
          style={{ backgroundColor: hexColor }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{name}</p>
          <p className="text-xs text-muted-foreground font-mono">{hexColor}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Palette className="h-4 w-4" />
        <h3 className="font-semibold text-sm">Design System</h3>
        {activeSystem && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {activeSystem.name}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-3 mt-3">
          <TabsTrigger value="generate" className="flex-1">
            <Sparkles className="h-3 w-3 mr-1" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="library" className="flex-1">
            <Layers className="h-3 w-3 mr-1" />
            Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="flex-1 flex flex-col p-3 space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="style" className="text-xs">Style Preset</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style" className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_PRESETS.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-xs">Describe your design</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A modern SaaS dashboard with purple accents and clean typography..."
                className="min-h-[80px] text-sm resize-none"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate Design System
            </Button>
          </div>

          {/* Quick examples */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Quick examples:</p>
            <div className="flex flex-wrap gap-1">
              {[
                'Healthcare app with calming blues',
                'E-commerce with warm tones',
                'Developer tools with dark theme',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setPrompt(example)}
                  className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library" className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : designSystems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No design systems yet</p>
                  <p className="text-xs">Generate one to get started</p>
                </div>
              ) : (
                designSystems.map((system) => (
                  <Card key={system.id} className={cn(system.is_active && 'ring-2 ring-primary')}>
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm truncate">{system.name}</CardTitle>
                          {system.description && (
                            <CardDescription className="text-xs line-clamp-2">
                              {system.description}
                            </CardDescription>
                          )}
                        </div>
                        {system.is_active && (
                          <Badge variant="default" className="text-xs ml-2">Active</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-3">
                      {/* Color swatches */}
                      <div className="grid grid-cols-2 gap-2">
                        {system.colors && Object.entries(system.colors).slice(0, 6).map(([name, color]) =>
                          renderColorSwatch(color, name)
                        )}
                      </div>

                      {/* Typography preview */}
                      {system.typography?.fontFamily && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Type className="h-3 w-3" />
                          <span className="truncate">{system.typography.fontFamily.body}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!system.is_active && (
                          <Button
                            size="sm"
                            onClick={() => handleActivateSystem(system.id)}
                            disabled={isActivating}
                            className="flex-1 gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Apply
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={previewSystem?.id === system.id ? 'default' : 'outline'}
                          onClick={() => handleTogglePreview(system)}
                          className="gap-1"
                          title={previewSystem?.id === system.id ? 'Stop preview' : 'Preview in sandbox'}
                        >
                          {previewSystem?.id === system.id ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              title="Export design tokens"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCopyCSS(system)}>
                              <Copy className="h-3 w-3 mr-2" />
                              Copy CSS
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(system, 'css')}>
                              <FileCode className="h-3 w-3 mr-2" />
                              Download CSS
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(system, 'scss')}>
                              <FileCode className="h-3 w-3 mr-2" />
                              Download SCSS
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(system, 'tailwind')}>
                              <FileCode className="h-3 w-3 mr-2" />
                              Download Tailwind Config
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(system, 'json')}>
                              <FileCode className="h-3 w-3 mr-2" />
                              Download JSON Tokens
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteSystem(system.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
