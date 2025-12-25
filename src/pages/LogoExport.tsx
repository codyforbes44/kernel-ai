import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { KernelLogoStatic } from "@/components/ui/kernel-logo-static";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { toast } from "sonner";

const EXPORT_SIZES = [512, 256, 128, 64] as const;

export default function LogoExport() {
  const logoRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [downloading, setDownloading] = useState<number | null>(null);
  const [downloaded, setDownloaded] = useState<Set<number>>(new Set());

  const handleDownload = async (size: number) => {
    const element = logoRefs.current[size];
    if (!element) return;

    setDownloading(size);

    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 1,
        quality: 1,
        backgroundColor: "#0a0a0f",
      });

      const link = document.createElement("a");
      link.download = `kernel-logo-${size}x${size}.png`;
      link.href = dataUrl;
      link.click();

      setDownloaded((prev) => new Set([...prev, size]));
      toast.success(`Downloaded ${size}×${size} logo`);
    } catch (error) {
      console.error("Failed to download logo:", error);
      toast.error("Failed to download logo");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    for (const size of EXPORT_SIZES) {
      await handleDownload(size);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Logo Export
          </h1>
          <p className="text-muted-foreground">
            Download the Kernel logo in various sizes for social profiles
          </p>
        </div>

        {/* Download All Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleDownloadAll}
            size="lg"
            className="gap-2"
          >
            <Download className="w-5 h-5" />
            Download All Sizes
          </Button>
        </div>

        {/* Size Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {EXPORT_SIZES.map((size) => (
            <div
              key={size}
              className="flex flex-col items-center p-6 rounded-xl border border-border bg-card"
            >
              {/* Size Label */}
              <div className="text-sm font-medium text-muted-foreground mb-4">
                {size} × {size}px
              </div>

              {/* Logo Preview (scaled for display) */}
              <div
                className="mb-4 rounded-lg overflow-hidden shadow-lg"
                style={{
                  transform: size > 256 ? `scale(${256 / size})` : "none",
                  transformOrigin: "center",
                  width: Math.min(size, 256),
                  height: Math.min(size, 256),
                }}
              >
                <KernelLogoStatic
                  ref={(el) => {
                    logoRefs.current[size] = el;
                  }}
                  size={size}
                />
              </div>

              {/* Download Button */}
              <Button
                variant={downloaded.has(size) ? "outline" : "secondary"}
                size="sm"
                onClick={() => handleDownload(size)}
                disabled={downloading === size}
                className="gap-2"
              >
                {downloaded.has(size) ? (
                  <>
                    <Check className="w-4 h-4" />
                    Downloaded
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {downloading === size ? "Downloading..." : "Download PNG"}
                  </>
                )}
              </Button>
            </div>
          ))}
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
        </div>
      </div>
    </div>
  );
}
