import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { HomepageOGImage } from "@/components/marketing/HomepageOGImage";
import { HomepageOGImageV2 } from "@/components/marketing/HomepageOGImageV2";

const OGPreview = () => {
  const ogImageRef = useRef<HTMLDivElement>(null);
  const ogImageV2Ref = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeVersion, setActiveVersion] = useState<"v1" | "v2">("v2");

  const handleDownload = async () => {
    const ref = activeVersion === "v2" ? ogImageV2Ref : ogImageRef;
    if (!ref.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(ref.current, {
        width: 1200,
        height: 630,
        pixelRatio: 1,
        cacheBust: true,
      });
      
      const link = document.createElement("a");
      link.download = `og-image-${activeVersion}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate OG image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

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
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <Button
                variant={activeVersion === "v1" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveVersion("v1")}
              >
                V1 Original
              </Button>
              <Button
                variant={activeVersion === "v2" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveVersion("v2")}
              >
                V2 Constellation
              </Button>
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
            Scaled preview (actual size: 1200×630px) - {activeVersion === "v2" ? "V2 Capability Constellation" : "V1 Original"}
          </p>
          <div
            style={{
              transform: "scale(0.6)",
              transformOrigin: "top left",
              width: 1200,
              height: 630,
            }}
          >
            {activeVersion === "v2" ? (
              <HomepageOGImageV2 ref={ogImageV2Ref} />
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
            {activeVersion === "v2" ? <HomepageOGImageV2 /> : <HomepageOGImage />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OGPreview;