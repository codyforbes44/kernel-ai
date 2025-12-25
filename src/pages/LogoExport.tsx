import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { KernelLogoStatic } from "@/components/ui/kernel-logo-static";
import { Button } from "@/components/ui/button";
import { Download, Check, Square, Circle, Layers, Image, FileCode, Maximize, Shrink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EXPORT_SIZES = [512, 256, 180, 128, 64] as const;
type Variant = "square" | "circle";

// SVG template generator
const generateSVG = (variant: "square" | "circle", transparent: boolean, padded: boolean = false): string => {
  const isCircle = variant === "circle";
  const bgColor = transparent ? "none" : "#0a0a0f";
  const size = 512;
  const borderRadius = isCircle ? size / 2 : size * 0.15;
  const inset = isCircle ? size * 0.08 : size * 0.15;
  
  // For padded version, scale content to 75% and center
  const scale = padded ? 0.75 : 1;
  const offset = padded ? (size * (1 - scale)) / 2 : 0;
  
  if (isCircle) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d4ff"/>
      <stop offset="50%" style="stop-color:#ffd700"/>
      <stop offset="100%" style="stop-color:#00d4ff"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="circleClip">
      <circle cx="${size/2}" cy="${size/2}" r="${(size/2) * scale}"/>
    </clipPath>
  </defs>
  
  <!-- Full background for padded version -->
  <rect width="${size}" height="${size}" fill="${bgColor}"/>
  
  <g transform="translate(${offset}, ${offset}) scale(${scale})" clip-path="url(#circleClip)">
    <!-- Background -->
    <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${bgColor}"/>
    
    <!-- Outer glow -->
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.4}" fill="none" stroke="#00d4ff" stroke-width="1" opacity="0.2" filter="url(#glow)"/>
    
    <!-- Gradient border circle -->
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.38}" fill="none" stroke="url(#borderGradient)" stroke-width="4"/>
    
    <!-- Inner background -->
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="#0a0a0f"/>
    
    <!-- Concentric circles pattern -->
    <g opacity="0.25" stroke="#00d4ff" fill="none">
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.25}" stroke-width="0.6"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.18}" stroke-width="0.5"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.11}" stroke-width="0.4"/>
      <circle cx="${size/2}" cy="${size/2}" r="12" fill="#00d4ff"/>
    </g>
    
    <!-- Glyph -->
    <text x="${size/2}" y="${size * 0.56}" font-family="monospace" font-size="${size * 0.28}" font-weight="bold" fill="#00d4ff" text-anchor="middle" filter="url(#glow)">&gt;_</text>
  </g>
</svg>`;
  }
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d4ff"/>
      <stop offset="50%" style="stop-color:#ffd700"/>
      <stop offset="100%" style="stop-color:#00d4ff"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Full background -->
  <rect width="${size}" height="${size}" fill="${bgColor}"/>
  
  <g transform="translate(${offset}, ${offset}) scale(${scale})">
    <!-- Background -->
    <rect width="${size}" height="${size}" fill="${bgColor}"/>
    
    <!-- Outer glow -->
    <rect x="${size * 0.1}" y="${size * 0.1}" width="${size * 0.8}" height="${size * 0.8}" rx="${borderRadius * 1.2}" ry="${borderRadius * 1.2}" fill="#00d4ff" opacity="0.1" filter="url(#glow)"/>
    
    <!-- Gradient border -->
    <rect x="${inset}" y="${inset}" width="${size - inset * 2}" height="${size - inset * 2}" rx="${borderRadius}" ry="${borderRadius}" fill="none" stroke="url(#borderGradient)" stroke-width="4"/>
    
    <!-- Inner background -->
    <rect x="${inset + 4}" y="${inset + 4}" width="${size - inset * 2 - 8}" height="${size - inset * 2 - 8}" rx="${borderRadius - 4}" ry="${borderRadius - 4}" fill="#0a0a0f"/>
    
    <!-- Diamond pattern -->
    <g opacity="0.25" stroke="#00d4ff" fill="none">
      <path d="M${size/2} ${size * 0.25} L${size * 0.75} ${size/2} L${size/2} ${size * 0.75} L${size * 0.25} ${size/2} Z" stroke-width="0.8"/>
      <path d="M${size/2} ${size * 0.35} L${size * 0.65} ${size/2} L${size/2} ${size * 0.65} L${size * 0.35} ${size/2} Z" stroke-width="0.5"/>
      <circle cx="${size/2}" cy="${size/2}" r="10" fill="#00d4ff"/>
      <circle cx="${size/2}" cy="${size * 0.25}" r="6" fill="#00d4ff" opacity="0.6"/>
      <circle cx="${size * 0.75}" cy="${size/2}" r="6" fill="#00d4ff" opacity="0.6"/>
      <circle cx="${size/2}" cy="${size * 0.75}" r="6" fill="#00d4ff" opacity="0.6"/>
      <circle cx="${size * 0.25}" cy="${size/2}" r="6" fill="#00d4ff" opacity="0.6"/>
    </g>
    
    <!-- Corner accents -->
    <path d="M${size * 0.12} ${size * 0.2} L${size * 0.12} ${size * 0.12} L${size * 0.2} ${size * 0.12}" fill="none" stroke="#00d4ff" stroke-width="2" opacity="0.3"/>
    <path d="M${size * 0.88} ${size * 0.2} L${size * 0.88} ${size * 0.12} L${size * 0.8} ${size * 0.12}" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.3"/>
    <path d="M${size * 0.12} ${size * 0.8} L${size * 0.12} ${size * 0.88} L${size * 0.2} ${size * 0.88}" fill="none" stroke="#ffd700" stroke-width="2" opacity="0.3"/>
    <path d="M${size * 0.88} ${size * 0.8} L${size * 0.88} ${size * 0.88} L${size * 0.8} ${size * 0.88}" fill="none" stroke="#00d4ff" stroke-width="2" opacity="0.3"/>
    
    <!-- Glyph -->
    <text x="${size/2}" y="${size * 0.56}" font-family="monospace" font-size="${size * 0.24}" font-weight="bold" fill="#00d4ff" text-anchor="middle" filter="url(#glow)">&gt;_</text>
  </g>
</svg>`;
};

export default function LogoExport() {
  const logoRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [activeVariant, setActiveVariant] = useState<Variant>("square");
  const [transparent, setTransparent] = useState(false);
  const [padded, setPadded] = useState(false);

  const getKey = (size: number, variant: Variant, isTransparent: boolean, isPadded: boolean) => 
    `${variant}-${size}-${isTransparent ? "transparent" : "solid"}-${isPadded ? "padded" : "full"}`;

  const handleDownload = async (size: number, variant: Variant) => {
    const key = getKey(size, variant, transparent, padded);
    const element = logoRefs.current[key];
    if (!element) return;

    setDownloading(key);

    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 1,
        quality: 1,
        backgroundColor: transparent ? undefined : "#0a0a0f",
      });

      const bgSuffix = transparent ? "-transparent" : "";
      const paddedSuffix = padded ? "-padded" : "";
      const link = document.createElement("a");
      link.download = `kernel-logo-${variant}${bgSuffix}${paddedSuffix}-${size}x${size}.png`;
      link.href = dataUrl;
      link.click();

      setDownloaded((prev) => new Set([...prev, key]));
      toast.success(`Downloaded ${size}×${size} ${variant}${transparent ? " (transparent)" : ""}${padded ? " (padded)" : ""} logo`);
    } catch (error) {
      console.error("Failed to download logo:", error);
      toast.error("Failed to download logo");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadSVG = () => {
    const svgContent = generateSVG(activeVariant, transparent, padded);
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    
    const bgSuffix = transparent ? "-transparent" : "";
    const paddedSuffix = padded ? "-padded" : "";
    const link = document.createElement("a");
    link.download = `kernel-logo-${activeVariant}${bgSuffix}${paddedSuffix}.svg`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${activeVariant}${padded ? " (padded)" : ""} SVG logo`);
  };

  const handleDownloadAll = async () => {
    for (const size of EXPORT_SIZES) {
      await handleDownload(size, activeVariant);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  const logoSize = (size: number) => padded ? Math.round(size * 0.75) : size;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Logo Export
          </h1>
          <p className="text-muted-foreground">
            Download the Kernel logo in various sizes for social profiles
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          {/* Variant Toggle */}
          <div className="flex justify-center gap-2">
            <Button
              variant={activeVariant === "square" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveVariant("square")}
              className="gap-2"
            >
              <Square className="w-4 h-4" />
              Square
            </Button>
            <Button
              variant={activeVariant === "circle" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveVariant("circle")}
              className="gap-2"
            >
              <Circle className="w-4 h-4" />
              Circle
            </Button>
          </div>

          {/* Background Toggle */}
          <div className="flex justify-center gap-2">
            <Button
              variant={!transparent ? "default" : "outline"}
              size="sm"
              onClick={() => setTransparent(false)}
              className="gap-2"
            >
              <Image className="w-4 h-4" />
              Solid BG
            </Button>
            <Button
              variant={transparent ? "default" : "outline"}
              size="sm"
              onClick={() => setTransparent(true)}
              className="gap-2"
            >
              <Layers className="w-4 h-4" />
              Transparent
            </Button>
          </div>

          {/* Padding Toggle */}
          <div className="flex justify-center gap-2">
            <Button
              variant={!padded ? "default" : "outline"}
              size="sm"
              onClick={() => setPadded(false)}
              className="gap-2"
            >
              <Maximize className="w-4 h-4" />
              Full Bleed
            </Button>
            <Button
              variant={padded ? "default" : "outline"}
              size="sm"
              onClick={() => setPadded(true)}
              className="gap-2"
            >
              <Shrink className="w-4 h-4" />
              With Padding
            </Button>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Button
            onClick={handleDownloadAll}
            size="lg"
            className="gap-2"
          >
            <Download className="w-5 h-5" />
            Download All PNGs
          </Button>
          <Button
            onClick={handleDownloadSVG}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <FileCode className="w-5 h-5" />
            Download SVG
          </Button>
        </div>

        {/* SVG Preview */}
        <div className="mb-8 p-6 rounded-xl border border-border bg-card">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div
              className={cn(
                "flex-shrink-0 overflow-hidden",
                activeVariant === "circle" && !padded ? "rounded-full" : "rounded-lg",
                transparent && "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXJib2FyZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMyMjIiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzIyMiIvPjxyZWN0IHg9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMzMzMiLz48cmVjdCB5PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMzMzIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2NoZWNrZXJib2FyZCkiLz48L3N2Zz4=')]"
              )}
              style={{ width: 128, height: 128 }}
              dangerouslySetInnerHTML={{ 
                __html: generateSVG(activeVariant, transparent, padded).replace('width="512"', 'width="128"').replace('height="512"', 'height="128"')
              }}
            />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                SVG Vector Format {padded && <span className="text-sm font-normal text-muted-foreground">(with padding)</span>}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Infinitely scalable vector graphics. Perfect for print, large displays, and any size requirement.
              </p>
              <Button
                onClick={handleDownloadSVG}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                <FileCode className="w-4 h-4" />
                Download SVG
              </Button>
            </div>
          </div>
        </div>

        {/* Size Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {EXPORT_SIZES.map((size) => {
            const key = getKey(size, activeVariant, transparent, padded);
            return (
              <div
                key={key}
                className="flex flex-col items-center p-6 rounded-xl border border-border bg-card"
              >
                {/* Size Label */}
                <div className="text-sm font-medium text-muted-foreground mb-4">
                  {size} × {size}px {transparent && "(transparent)"} {padded && "(padded)"}
                </div>

                {/* Logo Preview (scaled for display) */}
                <div
                  className={cn(
                    "mb-4 overflow-hidden shadow-lg relative",
                    activeVariant === "circle" && !padded ? "rounded-full" : "rounded-lg",
                    transparent && "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImNoZWNrZXJib2FyZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMyMjIiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzIyMiIvPjxyZWN0IHg9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMzMzMiLz48cmVjdCB5PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMzMzIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2NoZWNrZXJib2FyZCkiLz48L3N2Zz4=')]"
                  )}
                  style={{
                    transform: size > 256 ? `scale(${256 / size})` : "none",
                    transformOrigin: "center",
                    width: Math.min(size, 256),
                    height: Math.min(size, 256),
                  }}
                >
                  {/* Container for padded export - this is what gets captured */}
                  <div
                    ref={(el) => {
                      logoRefs.current[key] = el;
                    }}
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: transparent ? "transparent" : "#0a0a0f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <KernelLogoStatic
                      size={logoSize(size)}
                      variant={activeVariant}
                      transparent={true}
                    />
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  variant={downloaded.has(key) ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => handleDownload(size, activeVariant)}
                  disabled={downloading === key}
                  className="gap-2"
                >
                  {downloaded.has(key) ? (
                    <>
                      <Check className="w-4 h-4" />
                      Downloaded
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      {downloading === key ? "Downloading..." : "Download PNG"}
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Usage Tips */}
        <div className="mt-12 p-6 rounded-xl border border-border bg-card/50">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Recommended Sizes & Formats
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">SVG:</span>{" "}
              Best for web, print, and any size - infinitely scalable
            </li>
            <li>
              <span className="font-medium text-foreground">512×512:</span>{" "}
              High-res profile images, app icons
            </li>
            <li>
              <span className="font-medium text-foreground">256×256:</span>{" "}
              Discord, Slack, general avatars
            </li>
            <li>
              <span className="font-medium text-foreground">128×128:</span>{" "}
              Smaller profile images, thumbnails
            </li>
            <li>
              <span className="font-medium text-foreground">64×64:</span>{" "}
              Favicons, tiny icons
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              When to use each option
            </h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Square:</span>{" "}
                GitHub, LinkedIn, app stores, general use
              </li>
              <li>
                <span className="font-medium text-foreground">Circle:</span>{" "}
                Twitter/X, Instagram, platforms that crop to circles
              </li>
              <li>
                <span className="font-medium text-foreground">Solid BG:</span>{" "}
                Most social profiles, where the logo stands alone
              </li>
              <li>
                <span className="font-medium text-foreground">Transparent:</span>{" "}
                Overlays, watermarks, custom backgrounds
              </li>
              <li>
                <span className="font-medium text-foreground">With Padding:</span>{" "}
                Zoom editing, video thumbnails, social media safe zones, presentations
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
