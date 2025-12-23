import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, Loader2, Code, Image, X, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ScreenshotToUIProps {
  onConvert: (options: {
    imageUrl?: string;
    imageBase64?: string;
    description?: string;
    componentName?: string;
  }) => Promise<{ code: string; componentName: string }>;
  isConverting: boolean;
  onCodeGenerated?: (code: string, componentName: string) => void;
}

export function ScreenshotToUI({ onConvert, isConverting, onCodeGenerated }: ScreenshotToUIProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [componentName, setComponentName] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImageBase64(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url.match(/^https?:\/\/.+\.(png|jpg|jpeg|gif|webp)/i)) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const clearImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConvert = async () => {
    if (!imageBase64 && !imageUrl && !description) {
      toast.error('Please provide an image or description');
      return;
    }

    try {
      const result = await onConvert({
        imageUrl: activeTab === 'url' ? imageUrl : undefined,
        imageBase64: activeTab === 'upload' ? imageBase64 || undefined : undefined,
        description,
        componentName: componentName || 'GeneratedComponent',
      });

      setGeneratedCode(result.code);
      onCodeGenerated?.(result.code, result.componentName);
    } catch (error) {
      console.error('Conversion error:', error);
    }
  };

  const copyCode = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const hasInput = imageBase64 || imageUrl || description;

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'url')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2">
            <Link className="h-4 w-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {imagePreview && activeTab === 'upload' ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-contain rounded-lg border bg-muted"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
                'hover:border-primary hover:bg-primary/5 transition-colors',
                'flex flex-col items-center justify-center gap-2'
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Drop an image or click to upload</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              placeholder="https://example.com/screenshot.png"
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>
          {imagePreview && activeTab === 'url' && (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-contain rounded-lg border bg-muted"
            />
          )}
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="description">Additional Context (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe any specific requirements, colors, or functionality..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[60px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="componentName">Component Name</Label>
        <Input
          id="componentName"
          placeholder="MyComponent"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
        />
      </div>

      <Button
        onClick={handleConvert}
        className="w-full"
        disabled={!hasInput || isConverting}
        size="lg"
      >
        {isConverting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Code className="h-4 w-4 mr-2" />
            Convert to React Code
          </>
        )}
      </Button>

      {generatedCode && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Generated Code</span>
            <Button variant="ghost" size="sm" onClick={copyCode}>
              {copied ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[300px]">
            <code>{generatedCode}</code>
          </pre>
        </Card>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Uses AI credits • Works best with clean UI screenshots
      </p>
    </div>
  );
}
