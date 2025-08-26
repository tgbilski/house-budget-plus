import { useState } from "react";
import { 
  Home, 
  Calculator, 
  PiggyBank, 
  ShoppingCart, 
  Plane, 
  Gift, 
  Brain,
  ChevronRight,
  ChevronLeft 
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Monthly Budget", url: "/budget", icon: Calculator },
  { title: "Savings", url: "/savings", icon: PiggyBank },
  { title: "Compare Vendors", url: "/compare-prices", icon: ShoppingCart },
  { title: "Vacation", url: "/vacation", icon: Plane },
  { title: "Gifts", url: "/gifts", icon: Gift },
  { title: "AI Insights", url: "/ai-insights", icon: Brain },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = (path: string) => currentPath === path;

  return (
    <div
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-border transition-all duration-300 ease-in-out z-40",
        isExpanded ? "w-64" : "w-16"
      )}
    >
      <div className="p-2">
        {/* Toggle Button */}
        <div className={cn("flex mb-4", isExpanded ? "justify-end" : "justify-center")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex items-center w-full h-12 rounded-lg transition-colors",
                isExpanded ? "justify-start px-3" : "justify-center",
                isActive(item.url)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isExpanded && (
                <span className="ml-3 text-sm font-medium truncate">
                  {item.title}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}