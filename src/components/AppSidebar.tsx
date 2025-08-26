import React, { useState } from "react";
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

const SIDEBAR_WIDTH_COLLAPSED = 64; // px
const SIDEBAR_WIDTH_EXPANDED = 240; // px
const HEADER_HEIGHT = 64; // px

export function AppSidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect mobile (simple approach, can use useMediaQuery or similar)
  const isMobile = window.innerWidth < 768;

  const handleNavClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  const sidebarWidth = expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full transition-all duration-300 flex flex-col bg-white border-r shadow",
          isMobile
            ? mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        )}
        style={{
          width: sidebarWidth,
          marginTop: HEADER_HEIGHT, // ensures the sidebar starts below the header
          top: HEADER_HEIGHT,
        }}
      >
        {/* Expand/Collapse button */}
        <button
          className="flex items-center justify-center h-12 w-full border-b"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? <ChevronLeft /> : <ChevronRight />}
        </button>
        <nav className="flex-1 flex flex-col mt-2">
          {navigationItems.map((item) => {
            const active = location.pathname === item.url;
            return (
              <NavLink
                to={item.url}
                key={item.title}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors",
                  active && "bg-gray-200 text-blue-600 font-semibold"
                )}
                onClick={handleNavClick}
              >
                <item.icon className="w-6 h-6" />
                {expanded && <span className="whitespace-nowrap">{item.title}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      {/* Mobile hamburger button */}
      {isMobile && !mobileOpen && (
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded shadow"
          onClick={() => setMobileOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <ChevronRight />
        </button>
      )}
      {/* Padding for main content */}
      <div style={{ marginLeft: isMobile ? 0 : sidebarWidth, marginTop: HEADER_HEIGHT }} />
    </>
  );
}
