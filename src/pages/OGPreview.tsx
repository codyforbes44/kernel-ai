import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { HomepageOGImage } from "@/components/marketing/HomepageOGImage";
import { HomepageOGImageV2 } from "@/components/marketing/HomepageOGImageV2";
import { XCoverImage } from "@/components/marketing/XCoverImage";

type Version = "v1" | "v2" | "x-cover";

const VERSION_CONFIG: Record<Version, { label: string; width: number; height: number; filename: string }> = {
  v1: { label: "V1 Original", width: 1200, height: 630, filename: "og-image-v1.png" },
  v2: { label: "V2 Constellation", width: 1200, height: 630, filename: "og-image-v2.png" },
  "x-cover": { label: "X Cover", width: 1500, height: 500, filename: "x-cover.png" },
};

const OGPreview = () => {
  const ogImageRef = useRef<HTMLDivElement>(null);
  const ogImageV2Ref = useRef<HTMLDivElement>(null);
  const xCoverRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeVersion, setActiveVersion] = useState<Version>("v2");

  const config = VERSION_CONFIG[activeVersion];

  const getActiveRef = () => {
    switch (activeVersion) {
      case "v1": return ogImageRef;
      case "v2": return ogImageV2Ref;
      case "x-cover": return xCoverRef;
    }
  };

  const handleDownload = async () => {
    const ref = getActiveRef();
    if (!ref.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(ref.current, {
        width: config.width,
        height: config.height,
        pixelRatio: 1,
        cacheBust: true,
      });
      
      const link = document.createElement("a");
      link.download = config.filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderActiveImage = (withRef: boolean) => {
    switch (activeVersion) {
      case "v1":
        return <HomepageOGImage ref={withRef ? ogImageRef : undefined} />;
      case "v2":
        return <HomepageOGImageV2 ref={withRef ? ogImageV2Ref : undefined} />;
      case "x-cover":
        return <XCoverImage ref={withRef ? xCoverRef : undefined} />;
    }
  };

  // Calculate scale to fit preview
  const previewScale = activeVersion === "x-cover" ? 0.5 : 0.6;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">OG Image Preview</h1>
            <p className="text-muted-foreground mt-1">
              Preview and download Open Graph images ({config.width}×{config.height})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {(Object.keys(VERSION_CONFIG) as Version[]).map((version) => (
                <Button
                  key={version}
                  variant={activeVersion === version ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveVersion(version)}
                >
                  {VERSION_CONFIG[version].label}
                </Button>
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
            Scaled preview (actual size: {config.width}×{config.height}px) - {config.label}
          </p>
          <div
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
              width: config.width,
              height: config.height,
            }}
          >
            {renderActiveImage(true)}
          </div>
        </div>

        {/* Actual Size */}
        <div className="mt-8 border border-border rounded-lg overflow-auto bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Full size preview (scroll to see entire image)
          </p>
          <div style={{ width: config.width, height: config.height }}>
            {renderActiveImage(false)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OGPreview;