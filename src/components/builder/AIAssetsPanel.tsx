import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ImageIcon, Code2, Library, Video, Wand2 } from 'lucide-react';
import { useAIAssets, GeneratedAsset } from '@/hooks/useAIAssets';
import {
  ImageGenerationForm,
  AdvancedImageForm,
  ScreenshotToUI,
  AssetLibrary,
  AssetPreviewModal,
  ImageEditModal,
} from './ai-assets';
import { VideoGenerationForm } from './ai-assets/VideoGenerationForm';

interface AIAssetsPanelProps {
  projectId?: string;
  onInsertCode?: (code: string) => void;
  initialTab?: 'generate' | 'advanced' | 'video' | 'screenshot' | 'library';
}

export function AIAssetsPanel({ projectId, onInsertCode, initialTab = 'generate' }: AIAssetsPanelProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'advanced' | 'video' | 'screenshot' | 'library'>(initialTab);
  const [selectedAsset, setSelectedAsset] = useState<GeneratedAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<GeneratedAsset | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);

  const {
    assets,
    imageAssets,
    videoAssets,
    isLoadingAssets,
    generatingImage,
    generatingVideo,
    convertingScreenshot,
    upscalingImage,
    generateImage,
    generateVideo,
    generateAdvancedImage,
    upscaleImage,
    screenshotToCode,
    deleteAsset,
    toggleFavorite,
    copyImageUrl,
    downloadAsset,
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
    setActiveTab('library');
  };

  const handleGenerateVideo = async (options: {
    prompt: string;
    model: string;
    aspectRatio: string;
    duration: number;
    sourceImageUrl?: string;
  }) => {
    await generateVideo({
      prompt: options.prompt,
      model: options.model as 'luma' | 'kling' | 'minimax' | 'stable-video',
      aspectRatio: options.aspectRatio as '16:9' | '9:16' | '1:1' | '4:3',
      duration: options.duration,
      sourceImageUrl: options.sourceImageUrl,
      projectId,
    });
    setActiveTab('library');
  };

  const handleGenerateAdvancedImage = async (options: {
    prompt: string;
    negativePrompt?: string;
    model: string;
    aspectRatio: string;
    seed?: number;
    numInferenceSteps?: number;
    guidanceScale?: number;
  }) => {
    await generateAdvancedImage({
      prompt: options.prompt,
      negativePrompt: options.negativePrompt,
      model: options.model as 'flux-schnell' | 'flux-dev' | 'flux-pro' | 'sdxl',
      aspectRatio: options.aspectRatio,
      seed: options.seed,
      numInferenceSteps: options.numInferenceSteps,
      guidanceScale: options.guidanceScale,
      projectId,
    });
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

  const handleEditImage = async (imageUrl: string, prompt: string) => {
    setIsEditingImage(true);
    try {
      await generateImage({
        prompt,
        editImageUrl: imageUrl,
        editMode: true,
        projectId,
      });
      setActiveTab('library');
    } finally {
      setIsEditingImage(false);
    }
  };

  const handleOpenEditModal = (asset: GeneratedAsset) => {
    setSelectedAsset(null);
    setEditingAsset(asset);
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
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="generate" className="gap-1 text-xs px-1">
              <ImageIcon className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Quick</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-1 text-xs px-1">
              <Wand2 className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Pro</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-1 text-xs px-1">
              <Video className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Video</span>
            </TabsTrigger>
            <TabsTrigger value="screenshot" className="gap-1 text-xs px-1">
              <Code2 className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Code</span>
            </TabsTrigger>
            <TabsTrigger value="library" className="gap-1 text-xs px-1">
              <Library className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Lib</span>
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

          {activeTab === 'advanced' && (
            <AdvancedImageForm
              onGenerate={handleGenerateAdvancedImage}
              isGenerating={generatingImage}
            />
          )}

          {activeTab === 'video' && (
            <VideoGenerationForm
              onGenerate={handleGenerateVideo}
              isGenerating={generatingVideo}
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
              onDownload={downloadAsset}
              onDelete={deleteAsset}
              onToggleFavorite={toggleFavorite}
              getCodeSnippet={getImageCodeSnippet}
              onEditAsset={handleOpenEditModal}
              onUpscaleAsset={(asset, scale) => upscaleImage({ sourceImageUrl: asset.storage_url, scale, projectId })}
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
        onDownload={downloadAsset}
        onDelete={deleteAsset}
        onToggleFavorite={toggleFavorite}
        getCodeSnippet={getImageCodeSnippet}
        onEditAsset={handleOpenEditModal}
        onUpscaleAsset={(asset, scale) => upscaleImage({ sourceImageUrl: asset.storage_url, scale, projectId })}
        isUpscaling={upscalingImage}
      />

      {/* Edit Modal */}
      <ImageEditModal
        asset={editingAsset}
        open={!!editingAsset}
        onOpenChange={(open) => !open && setEditingAsset(null)}
        onEdit={handleEditImage}
        isEditing={isEditingImage}
      />
    </div>
  );
}
