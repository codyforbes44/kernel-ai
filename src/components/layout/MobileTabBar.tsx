import { Link, useLocation } from "react-router-dom";
import { MessageSquare, Code2, Settings, Sparkles, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/useHaptic";
import { useAdmin } from "@/hooks/useAdmin";

const baseTabs = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/builder", label: "Builder", icon: Code2 },
];

const settingsTab = { href: "/settings", label: "Settings", icon: Settings };
const adminTab = { href: "/admin", label: "Admin", icon: Shield };

export function MobileTabBar() {
  const location = useLocation();
  const { light } = useHaptic();
  const { isAdmin } = useAdmin();

  const handleTabClick = () => {
    light();
  };

  // Build tabs array: Chat, Builder, [Admin if admin], Settings
  const tabs = isAdmin 
    ? [...baseTabs, adminTab, settingsTab]
    : [...baseTabs, settingsTab];

  return (
    <nav 
      className="shrink-0 border-t border-border/50 bg-sidebar flex items-center justify-around px-2 z-50"
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        minHeight: '64px'
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            to={tab.href}
            onClick={handleTabClick}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[60px]",
              "active:scale-95 touch-manipulation",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "relative flex items-center justify-center w-10 h-7 rounded-full transition-colors",
              isActive && "bg-primary/15"
            )}>
              <Icon className={cn(
                "h-5 w-5 transition-transform",
                isActive && "scale-110"
              )} />
              {isActive && (
                <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary animate-pulse" />
              )}
            </div>
            <span className={cn(
              "text-[10px] font-medium",
              isActive && "font-semibold"
            )}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
