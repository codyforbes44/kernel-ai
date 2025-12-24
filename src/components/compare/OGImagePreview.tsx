import { CompareOGImage } from "@/components/marketing/CompareOGImage";

export const OGImagePreview = () => {
  return (
    <div className="mb-8">
      <p className="text-center text-sm text-muted-foreground mb-4">
        Preview: X/Twitter OG Image (1200×630)
      </p>
      <div className="flex justify-center">
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
