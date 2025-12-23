import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ImageIcon, Code2, Library } from 'lucide-react';
import { useAIAssets, GeneratedAsset } from '@/hooks/useAIAssets';
import {
  ImageGenerationForm,
  ScreenshotToUI,
  AssetLibrary,
  AssetPreviewModal,
} from './ai-assets';

interface AIAssetsPanelProps {
  projectId?: string;
  onInsertCode?: (code: string) => void;
  initialTab?: 'generate' | 'screenshot' | 'library';
}

export function AIAssetsPanel({ projectId, onInsertCode, initialTab = 'generate' }: AIAssetsPanelProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'screenshot' | 'library'>(initialTab);
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null);

  const {
    assets,
    isLoadingAssets,
    generatingImage,
    convertingScreenshot,
    generateImage,
    screenshotToCode,
    deleteAsset,
    toggleFavorite,
    copyImageUrl,
    downloadImage,
    getImageCodeSnippet,
  } = useAIAssets(projectId);

  const handleGenerateImage = async (options: {
    prompt: string;
    style: string;
    aspectRatio: string;
  }) => {
    await generateImage({
      prompt: options.prompt,
      style: options.style as 'realistic' | 'illustration' | 'icon' | '3d' | 'abstract' | 'minimal',
      aspectRatio: options.aspectRatio as '1:1' | '16:9' | '9:16' | '4:3' | '3:4',
      projectId,
    });
    // Switch to library after generating
    setActiveTab('library');
  };

  const handleScreenshotToCode = async (options: {
    imageUrl?: string;
    imageBase64?: string;
    description?: string;
    componentName?: string;
  }) => {
    const result = await screenshotToCode(options);
    return result;
  };

  const handleCodeGenerated = (code: string, componentName: string) => {
    onInsertCode?.(code);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">AI Studio</h2>
          {assets.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {assets.length} assets
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="generate" className="gap-1.5">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Generate</span>
            </TabsTrigger>
            <TabsTrigger value="screenshot" className="gap-1.5">
              <Code2 className="h-4 w-4" />
              <span className="hidden sm:inline">Screenshot</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-1.5">
              <Library className="h-4 w-4" />
              <span className="hidden sm:inline">Library</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {activeTab === 'generate' && (
            <ImageGenerationForm
              onGenerate={handleGenerateImage}
              isGenerating={generatingImage}
            />
          )}

          {activeTab === 'screenshot' && (
            <ScreenshotToUI
              onConvert={handleScreenshotToCode}
              isConverting={convertingScreenshot}
              onCodeGenerated={handleCodeGenerated}
            />
          )}

          {activeTab === 'library' && (
            <AssetLibrary
              assets={assets}
              isLoading={isLoadingAssets}
              onSelectAsset={setSelectedAsset}
              onCopyUrl={copyImageUrl}
              onDownload={downloadImage}
              onDelete={deleteAsset}
              onToggleFavorite={toggleFavorite}
              getCodeSnippet={getImageCodeSnippet}
            />
          )}
        </div>
      </ScrollArea>

      {/* Preview Modal */}
      <AssetPreviewModal
        asset={selectedAsset}
        open={!!selectedAsset}
        onOpenChange={(open) => !open && setSelectedAsset(null)}
        onCopyUrl={copyImageUrl}
        onDownload={downloadImage}
        onDelete={deleteAsset}
        onToggleFavorite={toggleFavorite}
        getCodeSnippet={getImageCodeSnippet}
      />
    </div>
  );
}
