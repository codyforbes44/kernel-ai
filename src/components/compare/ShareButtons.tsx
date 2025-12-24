import { Share2, Download, ExternalLink, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 md:mb-12">
        {/* Mobile: Icon-only buttons with tooltips */}
        <div className="flex gap-2 md:hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onShareTwitter} size="icon" className="h-10 w-10">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share on X</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={onCopyLink} size="icon" className="h-10 w-10">
                <Share2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Link</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                onClick={onDownloadOGImage}
                disabled={isDownloading}
                size="icon"
                className="h-10 w-10"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download Image</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="gold"
                onClick={onDownloadPDF}
                disabled={isGeneratingPDF}
                size="icon"
                className="h-10 w-10"
              >
                {isGeneratingPDF ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download PDF</TooltipContent>
          </Tooltip>
        </div>

        {/* Desktop: Full buttons with labels */}
        <div className="hidden md:flex flex-wrap justify-center gap-3">
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
      </div>
    </TooltipProvider>
  );
};
