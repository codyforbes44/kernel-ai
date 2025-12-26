import { useState } from "react";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompareOGImage } from "@/components/marketing/CompareOGImage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const OGImagePreview = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 md:mb-8">
      <p className="text-center text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
        Preview: X/Twitter OG Image (1200×630)
      </p>

      {/* Mobile: Button to open modal */}
      <div className="flex justify-center md:hidden">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              View OG Image Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full p-2 sm:p-4">
            <DialogHeader>
              <DialogTitle className="text-sm">OG Image Preview</DialogTitle>
              <VisuallyHidden>
                <DialogDescription>
                  Preview of the Open Graph image used for social media sharing.
                </DialogDescription>
              </VisuallyHidden>
            </DialogHeader>
            <div className="overflow-auto">
              <div className="min-w-[600px]">
                <div className="aspect-[1200/630] w-full rounded-lg overflow-hidden border border-border/50">
                  <div className="w-full h-full scale-[0.5] origin-top-left" style={{ width: '200%', height: '200%' }}>
                    <CompareOGImage />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop: Inline scaled preview */}
      <div className="hidden md:flex justify-center">
        <div className="max-w-4xl w-full rounded-xl overflow-hidden border border-border/50 shadow-2xl">
          <div className="aspect-[1200/630] w-full">
            <div className="w-full h-full scale-[0.333] origin-top-left" style={{ width: '300%', height: '300%' }}>
              <CompareOGImage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
