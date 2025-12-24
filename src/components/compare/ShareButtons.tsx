import { Share2, Download, ExternalLink, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  onShareTwitter: () => void;
  onCopyLink: () => void;
  onDownloadOGImage: () => void;
  onDownloadPDF: () => void;
  isDownloading: boolean;
  isGeneratingPDF: boolean;
}

export const ShareButtons = ({
  onShareTwitter,
  onCopyLink,
  onDownloadOGImage,
  onDownloadPDF,
  isDownloading,
  isGeneratingPDF,
}: ShareButtonsProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      <Button onClick={onShareTwitter} className="gap-2">
        <ExternalLink className="w-4 h-4" />
        Share on X
      </Button>
      <Button variant="outline" onClick={onCopyLink} className="gap-2">
        <Share2 className="w-4 h-4" />
        Copy Link
      </Button>
      <Button 
        variant="secondary" 
        onClick={onDownloadOGImage} 
        disabled={isDownloading}
        className="gap-2"
      >
        {isDownloading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Download OG Image
      </Button>
      <Button 
        variant="gold" 
        onClick={onDownloadPDF} 
        disabled={isGeneratingPDF}
        className="gap-2"
      >
        {isGeneratingPDF ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        Download PDF Report
      </Button>
    </div>
  );
};
