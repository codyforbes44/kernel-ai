import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Video, Loader2, Wand2, ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VIDEO_MODELS = [
  { value: 'luma', label: 'Luma Dream Machine', description: 'High quality, creative motion' },
  { value: 'kling', label: 'Kling 1.5', description: 'Fast, realistic motion' },
  { value: 'minimax', label: 'MiniMax', description: 'Fastest generation' },
  { value: 'stable-video', label: 'Stable Video', description: 'Image to video only' },
] as const;

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9', description: 'Landscape' },
  { value: '9:16', label: '9:16', description: 'Portrait/TikTok' },
  { value: '1:1', label: '1:1', description: 'Square' },
  { value: '4:3', label: '4:3', description: 'Standard' },
] as const;

const DURATIONS = [
  { value: '4', label: '4 seconds' },
  { value: '5', label: '5 seconds' },
  { value: '8', label: '8 seconds' },
  { value: '10', label: '10 seconds' },
] as const;

interface VideoGenerationFormProps {
  onGenerate: (options: {
    prompt: string;
    model: string;
    aspectRatio: string;
    duration: number;
    sourceImageUrl?: string;
  }) => Promise<void>;
  isGenerating: boolean;
}

export function VideoGenerationForm({ onGenerate, isGenerating }: VideoGenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('luma');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState('5');
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [sourceImageUrl, setSourceImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    if (mode === 'image' && model === 'stable-video' && !sourceImageUrl) return;

    await onGenerate({
      prompt: prompt.trim(),
      model,
      aspectRatio,
      duration: parseInt(duration),
      sourceImageUrl: mode === 'image' && sourceImageUrl ? sourceImageUrl : undefined,
    });
  };

  const promptSuggestions = [
    'A drone shot flying over misty mountains at sunrise',
    'Ocean waves crashing on rocks in slow motion',
    'City timelapse with cars and people moving fast',
    'Abstract colorful liquid flowing and mixing',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode selection */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'text' | 'image')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Text to Video
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Image to Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-prompt" className="text-sm font-medium">
              Describe your video
            </Label>
            <Textarea
              id="video-prompt"
              placeholder="A cinematic shot of a sunset over the ocean with gentle waves..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{prompt.length}/500 characters</span>
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
                    <Video className="h-3 w-3 inline mr-1" />
                    {suggestion.slice(0, 35)}...
                  </button>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-image" className="text-sm font-medium">
              Source Image URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="source-image"
                placeholder="https://example.com/image.jpg"
                value={sourceImageUrl}
                onChange={(e) => setSourceImageUrl(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Paste a URL to an image you want to animate
            </p>
          </div>

          {sourceImageUrl && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={sourceImageUrl}
                alt="Source preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="motion-prompt" className="text-sm font-medium">
              Motion Description
            </Label>
            <Textarea
              id="motion-prompt"
              placeholder="Gentle camera zoom, subtle movement in the clouds..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={300}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Model and settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="video-model" className="text-sm font-medium">
            Model
          </Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id="video-model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_MODELS.map((m) => (
                <SelectItem 
                  key={m.value} 
                  value={m.value}
                  disabled={m.value === 'stable-video' && mode === 'text'}
                >
                  <div className="flex flex-col">
                    <span>{m.label}</span>
                    <span className="text-xs text-muted-foreground">{m.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="video-aspect" className="text-sm font-medium">
            Aspect Ratio
          </Label>
          <Select value={aspectRatio} onValueChange={setAspectRatio}>
            <SelectTrigger id="video-aspect">
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

      <div className="space-y-2">
        <Label htmlFor="video-duration" className="text-sm font-medium">
          Duration
        </Label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger id="video-duration">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!prompt.trim() || isGenerating || (mode === 'image' && model === 'stable-video' && !sourceImageUrl)}
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Video...
          </>
        ) : (
          <>
            <Video className="h-4 w-4 mr-2" />
            Generate Video
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Uses AI credits • Video generation typically takes 1-3 minutes
      </p>
    </form>
  );
}
