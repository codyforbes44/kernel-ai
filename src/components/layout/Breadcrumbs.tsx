import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  /** Auto-generate breadcrumbs from current route */
  auto?: boolean;
}

const routeLabels: Record<string, string> = {
  "": "Home",
  "builder": "App Builder",
  "settings": "Settings",
  "admin": "Admin",
  "auth": "Sign In",
  "pricing": "Pricing",
};

export function Breadcrumbs({ items, className, auto = false }: BreadcrumbsProps) {
  const location = useLocation();

  // Auto-generate breadcrumbs from route
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    if (!auto) return [];
    
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [
      { label: "Home", href: "/", icon: <Home className="h-3.5 w-3.5" /> }
    ];
    
    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      
      crumbs.push({
        label,
        href: index === pathSegments.length - 1 ? undefined : currentPath,
      });
    });
    
    return crumbs;
  })();

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm", className)}
    >
      <ol className="flex items-center gap-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
              )}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded px-1"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1.5 px-1",
                    isLast ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
