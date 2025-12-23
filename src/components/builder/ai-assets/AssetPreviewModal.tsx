import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Trash2, Heart, Code, Check, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { GeneratedAsset } from '@/hooks/useAIAssets';
import { cn } from '@/lib/utils';

interface AssetPreviewModalProps {
  asset: GeneratedAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopyUrl: (url: string) => void;
  onDownload: (asset: GeneratedAsset) => void;
  onDelete: (assetId: string) => void;
  onToggleFavorite: (assetId: string) => void;
  getCodeSnippet: (asset: GeneratedAsset, format: 'jsx' | 'img' | 'bg') => string;
  onEditAsset?: (asset: GeneratedAsset) => void;
}

export function AssetPreviewModal({
  asset,
  open,
  onOpenChange,
  onCopyUrl,
  onDownload,
  onDelete,
  onToggleFavorite,
  getCodeSnippet,
  onEditAsset,
}: AssetPreviewModalProps) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!asset) return null;

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = () => {
    onDelete(asset.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate pr-4">{asset.prompt.slice(0, 50)}...</span>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(asset.id)}
              >
                <Heart
                  className={cn(
                    'h-5 w-5',
                    asset.is_favorite && 'fill-red-500 text-red-500'
                  )}
                />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image preview */}
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border bg-muted">
                <img
                  src={asset.storage_url}
                  alt={asset.prompt}
                  className="w-full h-auto max-h-[400px] object-contain"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onCopyUrl(asset.storage_url);
                    setCopied('url');
                    setTimeout(() => setCopied(null), 2000);
                  }}
                >
                  {copied === 'url' ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onDownload(asset)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Edit with AI button */}
              {onEditAsset && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    onEditAsset(asset);
                    onOpenChange(false);
                  }}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Edit with AI
                </Button>
              )}
            </div>

            {/* Details and code */}
            <div className="space-y-4">
              {/* Details */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Prompt</p>
                  <p className="text-sm">{asset.prompt}</p>
                </div>

                <div className="flex gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Style</p>
                    <Badge variant="secondary">{asset.style}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Aspect Ratio</p>
                    <Badge variant="outline">{asset.aspect_ratio}</Badge>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true })}
                  </p>
                </div>

                {asset.file_size && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">File Size</p>
                    <p className="text-sm text-muted-foreground">
                      {(asset.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>

              {/* Code snippets */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Insert Code
                </p>
                <Tabs defaultValue="jsx" className="w-full">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="jsx">JSX</TabsTrigger>
                    <TabsTrigger value="img">img tag</TabsTrigger>
                    <TabsTrigger value="bg">Background</TabsTrigger>
                  </TabsList>

                  {(['jsx', 'img', 'bg'] as const).map((format) => (
                    <TabsContent key={format} value={format} className="mt-2">
                      <div className="relative">
                        <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                          <code>{getCodeSnippet(asset, format)}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => handleCopy(getCodeSnippet(asset, format), format)}
                        >
                          {copied === format ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              {/* Tags */}
              {asset.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
