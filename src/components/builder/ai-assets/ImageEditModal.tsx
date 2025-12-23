import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Sparkles } from 'lucide-react';
import type { GeneratedAsset } from '@/hooks/useAIAssets';

interface ImageEditModalProps {
  asset: GeneratedAsset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (assetUrl: string, prompt: string) => Promise<void>;
  isEditing: boolean;
}

const EDIT_SUGGESTIONS = [
  'Make the background more vibrant',
  'Add a warm sunset glow',
  'Convert to a minimalist style',
  'Add soft shadows and depth',
  'Make it look more professional',
  'Add a vintage film effect',
];

export function ImageEditModal({
  asset,
  open,
  onOpenChange,
  onEdit,
  isEditing,
}: ImageEditModalProps) {
  const [editPrompt, setEditPrompt] = useState('');

  const handleEdit = async () => {
    if (!asset || !editPrompt.trim()) return;
    await onEdit(asset.storage_url, editPrompt);
    setEditPrompt('');
    onOpenChange(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setEditPrompt(suggestion);
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Edit Image with AI
          </DialogTitle>
          <DialogDescription>
            Describe how you want to modify this image
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Original Image Preview */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={asset.storage_url}
              alt={asset.prompt}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-2 left-2 right-2 bg-black/60 rounded px-2 py-1">
              <p className="text-xs text-white line-clamp-1">
                Original: {asset.prompt}
              </p>
            </div>
          </div>

          {/* Edit Prompt */}
          <div className="space-y-2">
            <Label>Edit Instructions</Label>
            <Textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder="Describe how you want to change the image..."
              className="min-h-[80px]"
            />
          </div>

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick suggestions</Label>
            <div className="flex flex-wrap gap-2">
              {EDIT_SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!editPrompt.trim() || isEditing}
            >
              {isEditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Editing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
