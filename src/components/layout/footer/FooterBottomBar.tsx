import { Link } from "react-router-dom";
import { APP_VERSION } from "@/lib/version";

export function FooterBottomBar() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="pt-6 sm:pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Kernel. All rights reserved.
        </p>
        <span className="text-xs text-muted-foreground/50 font-mono">
          v{APP_VERSION}
        </span>
      </div>
      <nav aria-label="Legal links" className="flex items-center gap-4 sm:gap-6">
        <Link
          to="/privacy"
          className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          Privacy
        </Link>
        <Link
          to="/terms"
          className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          Terms
        </Link>
      </nav>
    </div>
  );
}
