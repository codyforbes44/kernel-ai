import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Sparkles,
  Home,
  Info,
  Mail,
  CreditCard,
  LogIn,
  UserPlus,
  Clock,
  Zap,
  Command as CommandIcon,
  ExternalLink,
} from "lucide-react";
import { useCommandNav } from "@/hooks/useCommandNav";
import { XLogo } from "@/components/ui/x-logo";
import { hapticFeedback } from "@/hooks/useHaptic";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  isExternal?: boolean;
  isAnchor?: boolean;
}

const mainNavItems: NavItem[] = [
  { label: "Home", path: "/", icon: Home, description: "Return to homepage" },
  { label: "Features", path: "#features", icon: Sparkles, description: "Explore capabilities", isAnchor: true },
  { label: "How It Works", path: "#how-it-works", icon: Zap, description: "See the workflow", isAnchor: true },
  { label: "Pricing", path: "#pricing", icon: CreditCard, description: "View plans", isAnchor: true },
  { label: "About", path: "/about", icon: Info, description: "Learn about Kernel" },
  { label: "Contact", path: "/contact", icon: Mail, description: "Get in touch" },
];

const actionItems: NavItem[] = [
  { label: "Sign In", path: "/login", icon: LogIn, description: "Access your account" },
  { label: "Request Access", path: "/redeem", icon: UserPlus, description: "Join the waitlist" },
];

const socialItems: NavItem[] = [
  { label: "Follow on X", path: "https://x.com/KernelPlatform", icon: XLogo, isExternal: true },
];

interface CommandNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandNav({ isOpen, onClose }: CommandNavProps) {
  const { recentPages, navigateTo } = useCommandNav();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (item: NavItem) => {
    hapticFeedback("light");
    
    if (item.isExternal) {
      window.open(item.path, "_blank", "noopener,noreferrer");
      onClose();
      return;
    }
    
    navigateTo(item.path, item.label);
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Command className="rounded-2xl border border-primary/20 bg-background/95 backdrop-blur-xl shadow-2xl shadow-primary/10">
        <div className="flex items-center border-b border-primary/10 px-3">
          <CommandIcon className="mr-2 h-4 w-4 shrink-0 text-primary" />
          <CommandInput
            ref={inputRef}
            placeholder="Search commands, pages, actions..."
            className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-2 font-mono text-xs text-muted-foreground sm:flex">
            ESC
          </kbd>
        </div>
        
        <CommandList className="max-h-[400px] overflow-y-auto p-2">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </CommandEmpty>

          {recentPages.length > 0 && (
            <>
              <CommandGroup heading="Recent">
                {recentPages.map((page) => (
                  <CommandItem
                    key={page.path}
                    onSelect={() => navigateTo(page.path, page.title)}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-foreground"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground group-data-[selected=true]:text-primary" />
                    <span>{page.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator className="my-2 bg-primary/10" />
            </>
          )}

          <CommandGroup heading="Navigation">
            {mainNavItems.map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => handleSelect(item)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-primary/10"
              >
                <item.icon className="h-4 w-4 text-muted-foreground group-data-[selected=true]:text-primary" />
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="my-2 bg-primary/10" />

          <CommandGroup heading="Actions">
            {actionItems.map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => handleSelect(item)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-primary/10"
              >
                <item.icon className="h-4 w-4 text-muted-foreground group-data-[selected=true]:text-primary" />
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  )}
                </div>
                {item.path === "/redeem" && (
                  <span className="ml-auto text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="my-2 bg-primary/10" />

          <CommandGroup heading="Connect">
            {socialItems.map((item) => (
              <CommandItem
                key={item.path}
                onSelect={() => handleSelect(item)}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer data-[selected=true]:bg-primary/10"
              >
                <item.icon className="h-4 w-4 text-muted-foreground group-data-[selected=true]:text-primary" />
                <span>{item.label}</span>
                <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>

        <div className="border-t border-primary/10 p-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50">↵</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted/50 border border-border/50">⌘K</kbd>
            Toggle
          </span>
        </div>
      </Command>
    </CommandDialog>
  );
}
