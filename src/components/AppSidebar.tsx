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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import React from "react";

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
  const { open, setOpen, isMobile, openMobile, setOpenMobile, state } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const isCollapsed = state === "collapsed";

  // The header height is sticky (min-h-[48px] md:min-h-[56px]), so use 56px for md+ and 48px for mobile.
  // We'll use Tailwind's "mt-[56px]" for main, and custom inline style for sidebar offset.
  // Also, make sure on mobile the sidebar overlays content.
  return (
    <Sidebar
      variant="inset"
      className={cn(
        "!fixed left-0 z-40 top-[48px] md:top-[56px]",
        isMobile
          ? openMobile
            ? "translate-x-0"
            : "-translate-x-full"
          : "translate-x-0"
      )}
      style={{
        height: "calc(100vh - 48px)",
        ...(window.innerWidth >= 768 && { height: "calc(100vh - 56px)" }),
        transition: "width 0.3s",
      }}
      data-state={state}
    >
      {/* Expand/Collapse Button */}
      <div className="flex items-center justify-end px-2 py-2 border-b">
        <button
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setOpen((prev) => !prev)}
          className="rounded p-1 hover:bg-accent transition"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn("transition-all", isCollapsed && "sr-only")}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      onClick={handleNavClick}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className={cn(
                        "transition-all whitespace-nowrap",
                        isCollapsed && "opacity-0 w-0 overflow-hidden"
                      )}>
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
