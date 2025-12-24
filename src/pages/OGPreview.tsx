import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { HomepageOGImage } from "@/components/marketing/HomepageOGImage";
import { HolidayOGImage } from "@/components/marketing/HolidayOGImage";

type OGVariant = "homepage" | "holiday";

const OGPreview = () => {
  const ogImageRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeVariant, setActiveVariant] = useState<OGVariant>("holiday");

  const handleDownload = async () => {
    if (!ogImageRef.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(ogImageRef.current, {
        width: 1200,
        height: 630,
        pixelRatio: 1,
        cacheBust: true,
      });
      
      const link = document.createElement("a");
      link.download = activeVariant === "holiday" ? "holiday-og.png" : "landing.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate OG image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const variants: { key: OGVariant; label: string }[] = [
    { key: "holiday", label: "Holiday" },
    { key: "homepage", label: "Homepage" },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">OG Image Preview</h1>
            <p className="text-muted-foreground mt-1">
              Preview and download Open Graph images (1200×630)
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Variant Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              {variants.map((variant) => (
                <button
                  key={variant.key}
                  onClick={() => setActiveVariant(variant.key)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeVariant === variant.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {variant.label}
                </button>
              ))}
            </div>
            <Button onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download PNG
            </Button>
          </div>
        </div>

        {/* Scaled Preview */}
        <div className="border border-border rounded-lg overflow-hidden bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Scaled preview (actual size: 1200×630px)
          </p>
          <div
            style={{
              transform: "scale(0.6)",
              transformOrigin: "top left",
              width: 1200,
              height: 630,
            }}
          >
            {activeVariant === "holiday" ? (
              <HolidayOGImage ref={ogImageRef} />
            ) : (
              <HomepageOGImage ref={ogImageRef} />
            )}
          </div>
        </div>

        {/* Actual Size (hidden, used for export) */}
        <div className="mt-8 border border-border rounded-lg overflow-auto bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Full size preview (scroll to see entire image)
          </p>
          <div style={{ width: 1200, height: 630 }}>
            {activeVariant === "holiday" ? <HolidayOGImage /> : <HomepageOGImage />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OGPreview;
