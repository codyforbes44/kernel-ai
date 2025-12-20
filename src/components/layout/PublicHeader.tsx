import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KernelLogo } from "@/components/ui/kernel-logo";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <KernelLogo className="w-8 h-8" />
          <span className="font-bold text-xl">Kernel</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/auth?mode=signup">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] pt-12">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    to={link.href}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
              <div className="border-t border-border my-4" />
              <SheetClose asChild>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button className="w-full" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
