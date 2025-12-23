import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const STYLES = [
  { value: 'realistic', label: 'Realistic', description: 'Photo-realistic images' },
  { value: 'illustration', label: 'Illustration', description: 'Digital art style' },
  { value: 'icon', label: 'Icon', description: 'Flat, minimal icons' },
  { value: '3d', label: '3D Render', description: 'Three-dimensional' },
  { value: 'abstract', label: 'Abstract', description: 'Creative patterns' },
  { value: 'minimal', label: 'Minimal', description: 'Clean and simple' },
] as const;

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', description: 'Square' },
  { value: '16:9', label: '16:9', description: 'Landscape' },
  { value: '9:16', label: '9:16', description: 'Portrait' },
  { value: '4:3', label: '4:3', description: 'Standard' },
  { value: '3:4', label: '3:4', description: 'Portrait' },
] as const;

interface ImageGenerationFormProps {
  onGenerate: (options: {
    prompt: string;
    style: string;
    aspectRatio: string;
  }) => Promise<void>;
  isGenerating: boolean;
}

export function ImageGenerationForm({ onGenerate, isGenerating }: ImageGenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    await onGenerate({
      prompt: prompt.trim(),
      style,
      aspectRatio,
    });
  };

  const promptSuggestions = [
    'A modern dashboard UI with gradient cards',
    'Abstract geometric pattern for hero background',
    'Minimal icon set for a productivity app',
    'Elegant product showcase with soft shadows',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          Describe your image
        </Label>
        <Textarea
          id="prompt"
          placeholder="A futuristic city skyline at sunset with flying cars..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] resize-none"
          maxLength={500}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{prompt.length}/500 characters</span>
          {prompt.length === 0 && (
            <span className="text-primary">Be descriptive for best results</span>
          )}
        </div>
      </div>

      {/* Quick prompts */}
      {prompt.length === 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Try a suggestion</Label>
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className={cn(
                  'text-xs px-2 py-1 rounded-md border',
                  'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground',
                  'transition-colors'
                )}
              >
                <Wand2 className="h-3 w-3 inline mr-1" />
                {suggestion.slice(0, 30)}...
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="style" className="text-sm font-medium">
            Style
          </Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger id="style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div className="flex flex-col">
                    <span>{s.label}</span>
                    <span className="text-xs text-muted-foreground">{s.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="aspectRatio" className="text-sm font-medium">
            Aspect Ratio
          </Label>
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger id="aspectRatio">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIOS.map((ar) => (
                <SelectItem key={ar.value} value={ar.value}>
                  <div className="flex items-center gap-2">
                    <span>{ar.label}</span>
                    <span className="text-xs text-muted-foreground">({ar.description})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!prompt.trim() || isGenerating}
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Image
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Uses AI credits • Typically takes 10-30 seconds
      </p>
    </form>
  );
}
