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

export default function AppSidebar({ collapsed, onToggle, headerHeight }) {
  const location = useLocation();

  return (
    <aside
      className="bg-white border-r shadow transition-all duration-200 z-40"
      style={{
        position: "fixed",
        left: 0,
        top: headerHeight,
        height: `calc(100vh - ${headerHeight}px)`,
        width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        minWidth: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,
        transition: "width 0.2s",
        overflowX: "hidden",
      }}
    >
      <div className="flex items-center justify-end px-2 py-2 border-b">
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded p-1 hover:bg-gray-100 transition"
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
      <nav>
        <ul className="space-y-1 mt-2">
          {navigationItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 transition ${
                  location.pathname === item.url ? "bg-gray-100 font-bold" : ""
                }`}
                style={{
                  minWidth: 0,
                }}
              >
                <item.icon className="w-6 h-6" />
                <span
                  className={`whitespace-nowrap transition-all duration-200 ${
                    collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 ml-2"
                  }`}
                  style={{
                    width: collapsed ? 0 : "auto",
                  }}
                >
                  {item.title}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
