import { useCallback, useState, RefObject } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { pdfExportService } from "@/services/pdfExportService";
import { COMPARE_SHARE_TEXT } from "@/lib/compare-data";

interface UseCompareExportsOptions {
  ogImageRef: RefObject<HTMLDivElement>;
  pdfRef: RefObject<HTMLDivElement>;
}

export const useCompareExports = ({ ogImageRef, pdfRef }: UseCompareExportsOptions) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleShareTwitter = useCallback(() => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(COMPARE_SHARE_TEXT);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  const handleDownloadOGImage = useCallback(async () => {
    if (!ogImageRef.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(ogImageRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: 1200,
        height: 630,
      });
      
      const link = document.createElement("a");
      link.download = "kernel-vs-competition.png";
      link.href = dataUrl;
      link.click();
      
      toast.success("OG Image downloaded!");
    } catch (err) {
      logger.error("Failed to generate image:", err);
      toast.error("Failed to download image");
    } finally {
      setIsDownloading(false);
    }
  }, [ogImageRef]);

  const handleDownloadPDF = useCallback(async () => {
    if (!pdfRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      await pdfExportService.exportAndDownload(pdfRef.current, {
        filename: "kernel-competitive-analysis.pdf",
        format: "a4",
        quality: "high",
      });
      toast.success("PDF Report downloaded!");
    } catch (err) {
      logger.error("Failed to generate PDF:", err);
      toast.error("Failed to download PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [pdfRef]);

  return {
    isDownloading,
    isGeneratingPDF,
    handleShareTwitter,
    handleCopyLink,
    handleDownloadOGImage,
    handleDownloadPDF,
  };
};
