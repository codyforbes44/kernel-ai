import { useState } from "react";
import { Copy, Check, Twitter, Linkedin, Facebook, QrCode, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

interface VideoShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  title?: string;
}

export function VideoShareDialog({
  open,
  onOpenChange,
  shareUrl,
  title = "Watch how Kernel works - Build apps with AI",
}: VideoShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share it with anyone to show them how Kernel works.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: "Check out how you can build apps with AI using Kernel!",
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const socialLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "hover:bg-[#1877F2]/10 hover:text-[#1877F2]",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Share Demo Video
          </DialogTitle>
          <DialogDescription>
            Share this demo with others to show them how Kernel works.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Copy Link */}
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="font-mono text-sm"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Share on:</span>
            <div className="flex gap-1">
              {socialLinks.map((social) => (
                <Button
                  key={social.name}
                  variant="ghost"
                  size="icon-sm"
                  asChild
                  className={`h-9 w-9 ${social.color}`}
                >
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Share on ${social.name}`}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowQR(!showQR)}
                className={`h-9 w-9 ${showQR ? 'bg-primary/10 text-primary' : ''}`}
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* QR Code */}
          {showQR && (
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCodeSVG
                value={shareUrl}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>
          )}

          {/* Native Share (Mobile) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleNativeShare}
            >
              <Link2 className="h-4 w-4 mr-2" />
              Share via device
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
