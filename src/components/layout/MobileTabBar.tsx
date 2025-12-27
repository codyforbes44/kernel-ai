import { Link, useLocation } from "react-router-dom";
import { MessageSquare, Code2, Settings, Sparkles, Shield, Coins, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/useHaptic";
import { useAdmin } from "@/hooks/useAdmin";
import { useNotifications } from "@/hooks/useNotifications";
import { useAICredits } from "@/hooks/useAICredits";

type TabKey = "chat" | "builder" | "companion" | "settings" | "admin";

interface Tab {
  href: string;
  label: string;
  icon: typeof MessageSquare;
  key: TabKey;
}

const baseTabs: Tab[] = [
  { href: "/assistant", label: "Assistant", icon: MessageSquare, key: "chat" },
  { href: "/builder", label: "Builder", icon: Code2, key: "builder" },
  { href: "/companion", label: "Companion", icon: Users, key: "companion" },
];

const settingsTab: Tab = { href: "/settings", label: "Settings", icon: Settings, key: "settings" };
const adminTab: Tab = { href: "/admin", label: "Admin", icon: Shield, key: "admin" };

interface NotificationBadgeProps {
  count: number;
}

function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full animate-in zoom-in-50 duration-200">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function MobileTabBar() {
  const location = useLocation();
  const { light } = useHaptic();
  const { isAdmin } = useAdmin();
  const { counts: notificationCounts } = useNotifications();
  const { credits } = useAICredits();

  const handleTabClick = () => {
    light();
  };

  // Build tabs array: Chat, Builder, [Admin if admin], Settings
  const tabs = isAdmin 
    ? [...baseTabs, adminTab, settingsTab]
    : [...baseTabs, settingsTab];

  const isLowCredits = (credits?.balance ?? 0) < 10;

  return (
    <nav 
      className="shrink-0 border-t border-border/50 bg-sidebar flex items-center justify-evenly px-1 z-50 animate-fade-in"
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
        minHeight: '72px'
      }}
      role="navigation"
      aria-label="Main navigation"
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
              "flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl transition-all",
              "flex-1 max-w-[80px] min-h-[52px]",
              "active:scale-95 touch-manipulation",
              isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <div className={cn(
              "relative flex items-center justify-center w-11 h-9 rounded-full transition-all",
              isActive && "bg-primary/15 scale-110"
            )}>
              <Icon className={cn(
                "h-5 w-5 transition-transform",
                isActive && "scale-105"
              )} />
              {isActive ? (
                <Sparkles className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary animate-pulse" />
              ) : (
                <NotificationBadge count={notificationCounts[tab.key]} />
              )}
            </div>
            <span className={cn(
              "text-[11px] font-medium",
              isActive && "font-semibold"
            )}>
              {tab.label}
            </span>
          </Link>
        );
      })}

      {/* Compact Credits Badge */}
      <div className={cn(
        "flex flex-col items-center justify-center gap-0.5 py-2 px-1.5 rounded-xl",
        "flex-1 max-w-[60px] min-h-[52px] touch-manipulation"
      )}>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
          isLowCredits 
            ? "bg-destructive/15 text-destructive" 
            : "bg-primary/15 text-primary"
        )}>
          <Coins className="h-3 w-3" />
          <span>{credits?.balance ?? 0}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">Credits</span>
      </div>
    </nav>
  );
}
