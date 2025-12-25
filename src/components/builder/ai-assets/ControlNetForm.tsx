import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, Upload, X, Image as ImageIcon, Scan, Box, Move, Pencil, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONTROLNET_TYPES = [
  { 
    value: 'canny', 
    label: 'Canny Edge', 
    description: 'Detect edges for structure-guided generation',
    icon: Scan,
  },
  { 
    value: 'depth', 
    label: 'Depth Map', 
    description: 'Use depth information for 3D-aware generation',
    icon: Box,
  },
  { 
    value: 'pose', 
    label: 'Pose Detection', 
    description: 'Detect human poses for character generation',
    icon: Move,
  },
  { 
    value: 'scribble', 
    label: 'Scribble', 
    description: 'Generate from rough sketches or drawings',
    icon: Pencil,
  },
  { 
    value: 'softedge', 
    label: 'Soft Edge (HED)', 
    description: 'Soft edge detection for smoother results',
    icon: Layers,
  },
] as const;

interface ControlNetFormProps {
  onGenerate: (options: {
    prompt: string;
    negativePrompt?: string;
    controlnetType: string;
    controlnetStrength: number;
    sourceImageUrl: string;
    guidanceScale?: number;
    numInferenceSteps?: number;
    seed?: number;
  }) => Promise<void>;
  isGenerating: boolean;
}

export function ControlNetForm({ onGenerate, isGenerating }: ControlNetFormProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [controlnetType, setControlnetType] = useState<string>('canny');
  const [controlnetStrength, setControlnetStrength] = useState(0.8);
  const [guidanceScale, setGuidanceScale] = useState(9);
  const [numInferenceSteps, setNumInferenceSteps] = useState(20);
  const [seed, setSeed] = useState<string>('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSourceImage(null);
    setSourceImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !sourceImage || isGenerating) return;

    await onGenerate({
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      controlnetType,
      controlnetStrength,
      sourceImageUrl: sourceImage,
      guidanceScale,
      numInferenceSteps,
      seed: seed ? parseInt(seed) : undefined,
    });
  };

  const selectedType = CONTROLNET_TYPES.find(t => t.value === controlnetType);
  const TypeIcon = selectedType?.icon || Scan;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ControlNet Type Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <TypeIcon className="h-4 w-4" />
          ControlNet Type
        </Label>
        <Select value={controlnetType} onValueChange={setControlnetType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTROLNET_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Reference Image Upload */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Reference Image</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {sourceImage ? (
          <div className="relative rounded-lg overflow-hidden border bg-muted">
            <img
              src={sourceImage}
              alt="Reference"
              className="w-full h-40 object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 left-2">
              <span className="text-xs bg-background/80 px-2 py-1 rounded">
                {selectedType?.label} reference
              </span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full h-32 border-2 border-dashed rounded-lg',
              'flex flex-col items-center justify-center gap-2',
              'text-muted-foreground hover:text-foreground hover:border-primary/50',
              'transition-colors cursor-pointer'
            )}
          >
            <Upload className="h-8 w-8" />
            <span className="text-sm">Upload reference image</span>
            <span className="text-xs">PNG, JPG up to 10MB</span>
          </button>
        )}
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <Label htmlFor="prompt" className="text-sm font-medium">
          Prompt
        </Label>
        <Textarea
          id="prompt"
          placeholder="Describe what you want to generate based on the reference..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[80px] resize-none"
          maxLength={500}
        />
      </div>

      {/* Negative Prompt */}
      <div className="space-y-2">
        <Label htmlFor="negativePrompt" className="text-sm font-medium">
          Negative Prompt
          <span className="text-muted-foreground font-normal ml-1">(optional)</span>
        </Label>
        <Textarea
          id="negativePrompt"
          placeholder="Things to avoid..."
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          className="min-h-[50px] resize-none text-sm"
          maxLength={300}
        />
      </div>

      {/* ControlNet Strength */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm font-medium">Control Strength</Label>
          <span className="text-sm text-muted-foreground">{controlnetStrength.toFixed(2)}</span>
        </div>
        <Slider
          value={[controlnetStrength]}
          onValueChange={([v]) => setControlnetStrength(v)}
          min={0.1}
          max={1}
          step={0.05}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Higher = more faithful to reference structure
        </p>
      </div>

      {/* Guidance Scale */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm font-medium">Guidance Scale</Label>
          <span className="text-sm text-muted-foreground">{guidanceScale}</span>
        </div>
        <Slider
          value={[guidanceScale]}
          onValueChange={([v]) => setGuidanceScale(v)}
          min={1}
          max={20}
          step={0.5}
          className="w-full"
        />
      </div>

      {/* Inference Steps */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-sm font-medium">Steps</Label>
          <span className="text-sm text-muted-foreground">{numInferenceSteps}</span>
        </div>
        <Slider
          value={[numInferenceSteps]}
          onValueChange={([v]) => setNumInferenceSteps(v)}
          min={10}
          max={50}
          step={1}
          className="w-full"
        />
      </div>

      {/* Seed */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Seed
          <span className="text-muted-foreground font-normal ml-1">(optional)</span>
        </Label>
        <Input
          type="number"
          placeholder="Random"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          min={0}
          max={2147483647}
        />
      </div>

      {/* Generate Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!prompt.trim() || !sourceImage || isGenerating}
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating with ControlNet...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate with {selectedType?.label}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Uses Replicate ControlNet • ~20-40 seconds
      </p>
    </form>
  );
}
