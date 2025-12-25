import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useAICredits } from "@/hooks/useAICredits";
import { KernelLogoAnimated } from "@/components/ui/kernel-logo-animated";
import { CreditsBadge } from "@/components/ui/credits-badge";
import { CommandNav } from "@/components/layout/CommandNav";
import { useCommandNav } from "@/hooks/useCommandNav";
import { hapticFeedback } from "@/hooks/useHaptic";
import {
  MessageSquare,
  Code2,
  Settings,
  Shield,
  User,
  LogOut,
  Command as CommandIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/builder", label: "Builder", icon: Code2 },
];

export function TopNavBar() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { balance, isLowBalance } = useAICredits();
  const location = useLocation();
  const { isOpen: commandOpen, toggle: toggleCommand, close: closeCommand } = useCommandNav();

  if (!user) return null;

  const handleCommandClick = () => {
    hapticFeedback("light");
    toggleCommand();
  };

  return (
    <>
      <header className="h-12 border-b border-border/50 bg-sidebar flex items-center justify-between px-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <KernelLogoAnimated
            size="sm"
            variant="animated"
            isActive={commandOpen}
            onClick={handleCommandClick}
            className="cursor-pointer"
          />
          <Link to="/assistant" className="hover:opacity-80 transition-opacity">
            <span className="font-semibold text-sm hidden sm:inline bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]">
              Kernel
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 h-8",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin">
              <Button
                variant={location.pathname === "/admin" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2 h-8",
                  location.pathname === "/admin" && "bg-primary/10 text-primary hover:bg-primary/15"
                )}
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          )}
          
          {/* Command trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCommandClick}
            className="gap-1 h-8 text-muted-foreground hover:text-foreground"
          >
            <CommandIcon className="h-4 w-4" />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/30 px-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
              ⌘K
            </kbd>
          </Button>
        </nav>

        {/* Credits & User Menu */}
        <div className="flex items-center gap-2">
          <CreditsBadge balance={balance} isLowBalance={isLowBalance} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-8">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="hidden md:inline text-sm truncate max-w-[120px]">
                  {user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-primary/20">
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-primary/10" />
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command Navigation Modal */}
      <CommandNav isOpen={commandOpen} onClose={closeCommand} />
    </>
  );
}
