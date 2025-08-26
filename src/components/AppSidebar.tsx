import React, { useEffect, useState } from "react";
import {
  Home,
  Calculator,
  PiggyBank,
  ShoppingCart,
  Plane,
  Gift,
  Brain,
  ChevronRight,
  ChevronLeft,
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

// Sidebar widths in px
const SIDEBAR_COLLAPSED = 56;
const SIDEBAR_EXPANDED = 240;

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

  // Dynamically calculate header height
  const [headerHeight, setHeaderHeight] = useState(window.innerWidth < 768 ? 48 : 56);
  useEffect(() => {
    const updateHeaderHeight = () => setHeaderHeight(window.innerWidth < 768 ? 48 : 56);
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  // Always collapsed by default
  const isCollapsed = state === "collapsed";

  // On mobile, close sidebar when nav is clicked
  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar
      variant="inset"
      className={cn(
        "fixed left-0 z-40 bg-white border-r shadow transition-all duration-300",
        isMobile
          ? openMobile
            ? "translate-x-0"
            : "-translate-x-full"
          : "translate-x-0"
      )}
      style={{
        top: headerHeight,
        height: `calc(100vh - ${headerHeight}px)`,
        width: isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        minWidth: isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        maxWidth: isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        transition: "width 0.2s",
        overflowX: "hidden",
      }}
      data-state={state}
    >
      {/* Collapse/Expand Button */}
      <div className="flex items-center justify-end px-2 py-2 border-b">
        <button
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setOpen((prev: boolean) => !prev)}
          className="rounded p-1 hover:bg-accent transition"
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(isCollapsed && "sr-only")}>
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
                      <span
                        className={cn(
                          "transition-all whitespace-nowrap",
                          isCollapsed && "opacity-0 w-0 overflow-hidden"
                        )}
                        style={{
                          transition: "opacity 0.2s, width 0.2s",
                          width: isCollapsed ? 0 : "auto",
                        }}
                      >
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
