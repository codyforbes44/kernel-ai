import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Sparkles, Loader2, ChevronDown, Shuffle, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MODELS = [
  { value: 'flux-schnell', label: 'Flux Schnell', description: 'Fast, good quality' },
  { value: 'flux-dev', label: 'Flux Dev', description: 'Balanced speed & quality' },
  { value: 'flux-pro', label: 'Flux Pro', description: 'Highest quality, slower' },
  { value: 'sdxl', label: 'SDXL', description: 'Stable Diffusion XL' },
] as const;

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1', description: 'Square (1024x1024)' },
  { value: '16:9', label: '16:9', description: 'Landscape (1344x768)' },
  { value: '9:16', label: '9:16', description: 'Portrait (768x1344)' },
  { value: '4:3', label: '4:3', description: 'Standard (1152x896)' },
  { value: '3:4', label: '3:4', description: 'Portrait (896x1152)' },
  { value: '21:9', label: '21:9', description: 'Ultrawide (1536x640)' },
] as const;

interface AdvancedImageFormProps {
  onGenerate: (options: {
    prompt: string;
    negativePrompt?: string;
    model: string;
    aspectRatio: string;
    seed?: number;
    numInferenceSteps?: number;
    guidanceScale?: number;
  }) => Promise<void>;
  isGenerating: boolean;
}

export function AdvancedImageForm({ onGenerate, isGenerating }: AdvancedImageFormProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('flux-dev');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [seed, setSeed] = useState<string>('');
  const [useRandomSeed, setUseRandomSeed] = useState(true);
  const [numInferenceSteps, setNumInferenceSteps] = useState(28);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    await onGenerate({
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      model,
      aspectRatio,
      seed: useRandomSeed ? undefined : (parseInt(seed) || undefined),
      numInferenceSteps,
      guidanceScale,
    });
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 2147483647);
    setSeed(randomSeed.toString());
    setUseRandomSeed(false);
  };

  const negativePromptSuggestions = [
    'blurry, low quality, distorted',
    'text, watermark, signature',
    'ugly, deformed, disfigured',
    'extra limbs, bad anatomy',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Model Selection */}
      <div className="space-y-2">
        <Label htmlFor="model" className="text-sm font-medium flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          Model
        </Label>
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger id="model">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODELS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{m.label}</span>
                  <span className="text-xs text-muted-foreground">{m.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          Prompt
        </Label>
        <Textarea
          id="prompt"
          placeholder="A majestic mountain landscape at golden hour, cinematic lighting, 8k resolution..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] resize-none"
          maxLength={1000}
        />
        <div className="text-xs text-muted-foreground text-right">
          {prompt.length}/1000
        </div>
      </div>

      {/* Negative Prompt */}
      <div className="space-y-2">
        <Label htmlFor="negativePrompt" className="text-sm font-medium">
          Negative Prompt
          <span className="text-muted-foreground font-normal ml-1">(optional)</span>
        </Label>
        <Textarea
          id="negativePrompt"
          placeholder="Things to avoid in the image..."
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          className="min-h-[60px] resize-none"
          maxLength={500}
        />
        {negativePrompt.length === 0 && (
          <div className="flex flex-wrap gap-1.5">
            {negativePromptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setNegativePrompt(suggestion)}
                className={cn(
                  'text-xs px-2 py-0.5 rounded border',
                  'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground',
                  'transition-colors'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Aspect Ratio */}
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

      {/* Seed Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Seed</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Random</span>
            <Switch
              checked={useRandomSeed}
              onCheckedChange={setUseRandomSeed}
            />
          </div>
        </div>
        {!useRandomSeed && (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter seed number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="flex-1"
              min={0}
              max={2147483647}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={generateRandomSeed}
              title="Generate random seed"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {useRandomSeed
            ? 'A random seed will be used for each generation'
            : 'Use the same seed to reproduce similar results'}
        </p>
      </div>

      {/* Advanced Settings */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between" type="button">
            <span className="text-sm">Advanced Settings</span>
            <ChevronDown className={cn('h-4 w-4 transition-transform', showAdvanced && 'rotate-180')} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          {/* Inference Steps */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Inference Steps</Label>
              <span className="text-sm text-muted-foreground">{numInferenceSteps}</span>
            </div>
            <Input
              type="range"
              min={10}
              max={50}
              value={numInferenceSteps}
              onChange={(e) => setNumInferenceSteps(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              More steps = higher quality but slower (20-30 recommended)
            </p>
          </div>

          {/* Guidance Scale */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">Guidance Scale (CFG)</Label>
              <span className="text-sm text-muted-foreground">{guidanceScale.toFixed(1)}</span>
            </div>
            <Input
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={guidanceScale}
              onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher = follows prompt more strictly (7-8 recommended)
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Generate Button */}
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
            Generate with {MODELS.find(m => m.value === model)?.label}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Uses Replicate API • {model === 'flux-pro' ? '~30-60s' : '~10-20s'} per image
      </p>
    </form>
  );
}
