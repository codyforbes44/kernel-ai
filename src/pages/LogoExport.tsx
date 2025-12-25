import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { KernelLogoStatic } from "@/components/ui/kernel-logo-static";
import { Button } from "@/components/ui/button";
import { Download, Check, Square, Circle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EXPORT_SIZES = [512, 256, 128, 64] as const;
type Variant = "square" | "circle";

export default function LogoExport() {
  const logoRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());
  const [activeVariant, setActiveVariant] = useState<Variant>("square");

  const getKey = (size: number, variant: Variant) => `${variant}-${size}`;

  const handleDownload = async (size: number, variant: Variant) => {
    const key = getKey(size, variant);
    const element = logoRefs.current[key];
    if (!element) return;

    setDownloading(key);

    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 1,
        quality: 1,
        backgroundColor: "#0a0a0f",
      });

      const link = document.createElement("a");
      link.download = `kernel-logo-${variant}-${size}x${size}.png`;
      link.href = dataUrl;
      link.click();

      setDownloaded((prev) => new Set([...prev, key]));
      toast.success(`Downloaded ${size}×${size} ${variant} logo`);
    } catch (error) {
      console.error("Failed to download logo:", error);
      toast.error("Failed to download logo");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    for (const size of EXPORT_SIZES) {
      await handleDownload(size, activeVariant);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

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

        {/* Variant Toggle */}
        <div className="flex justify-center gap-2 mb-8">
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

        {/* Download All Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleDownloadAll}
            size="lg"
            className="gap-2"
          >
            <Download className="w-5 h-5" />
            Download All {activeVariant === "circle" ? "Circle" : "Square"} Sizes
          </Button>
        </div>

        {/* Size Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {EXPORT_SIZES.map((size) => {
            const key = getKey(size, activeVariant);
            return (
              <div
                key={key}
                className="flex flex-col items-center p-6 rounded-xl border border-border bg-card"
              >
                {/* Size Label */}
                <div className="text-sm font-medium text-muted-foreground mb-4">
                  {size} × {size}px
                </div>

                {/* Logo Preview (scaled for display) */}
                <div
                  className={cn(
                    "mb-4 overflow-hidden shadow-lg",
                    activeVariant === "circle" ? "rounded-full" : "rounded-lg"
                  )}
                  style={{
                    transform: size > 256 ? `scale(${256 / size})` : "none",
                    transformOrigin: "center",
                    width: Math.min(size, 256),
                    height: Math.min(size, 256),
                  }}
                >
                  <KernelLogoStatic
                    ref={(el) => {
                      logoRefs.current[key] = el;
                    }}
                    size={size}
                    variant={activeVariant}
                  />
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
            Recommended Sizes
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
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
              When to use each variant
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
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
