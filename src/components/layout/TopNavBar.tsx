import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useAICredits } from "@/hooks/useAICredits";
import { KernelLogo } from "@/components/ui/kernel-logo";
import { CreditsBadge } from "@/components/ui/credits-badge";
import {
  MessageSquare,
  Code2,
  Settings,
  Shield,
  User,
  LogOut,
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
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/builder", label: "Builder", icon: Code2 },
];

export function TopNavBar() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { balance, isLowBalance } = useAICredits();
  const location = useLocation();

  if (!user) return null;

  return (
    <header className="h-12 border-b border-border/50 bg-sidebar flex items-center justify-between px-4">
      {/* Logo & Brand */}
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <KernelLogo size="sm" />
        <span className="font-semibold text-sm hidden sm:inline">Kernel</span>
      </Link>

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
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
