import { 
  PiggyBank, 
  Plane, 
  Gift, 
  Brain,
  BookOpen,
  Shield,
  Receipt,
  Home
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { prefetchRoute } from "@/utils/prefetch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Custom house icon with dollar sign inside
const HouseDollarIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={cn("h-5 w-5 flex-shrink-0", className)}
  >
    {/* House outline */}
    <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.5z" />
    {/* Dollar sign inside */}
    <path d="M12 10v6" />
    <path d="M14 11.5c0-.83-.67-1.5-1.5-1.5h-1c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h1c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-1c-.83 0-1.5-.67-1.5-1.5" />
  </svg>
);

const navigationItems = [
  { title: "BUDGET", url: "/budget", icon: HouseDollarIcon },
  { title: "HOUSES", url: "/house-comparison", icon: Home },
  { title: "EXPENSES", url: "/expenses", icon: Receipt },
  { title: "SAVINGS", url: "/savings", icon: PiggyBank },
  { title: "VACATIONS", url: "/vacation", icon: Plane },
  { title: "GIFTS", url: "/gifts", icon: Gift },
  { title: "BLOG", url: "/blog", icon: BookOpen },
  { title: "AI INSIGHT", url: "/ai-insights", icon: Brain },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const adminItems = [
    { title: "ADMIN", url: "/admin", icon: Shield },
  ];

  const allItems = isAdmin 
    ? [...navigationItems, ...adminItems]
    : navigationItems;

  const isActive = (path: string) => {
    // Root "/" and "/budget" should both highlight BUDGET
    if (path === "/budget") {
      return currentPath === "/budget" || currentPath === "/";
    }
    return currentPath === path;
  };

  return (
    <Sidebar 
      collapsible={isMobile ? "offcanvas" : "none"}
      className={cn(
        "fixed left-0 z-30 border-r bg-sidebar transition-all w-44 h-full",
        isMobile && "relative"
      )}
      style={!isMobile 
        ? { top: "64px", height: "calc(100vh - 64px)" }
        : undefined
      }
      variant="sidebar"
    >
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col space-y-1">
              {allItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    tooltip={null}
                  >
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                      onMouseEnter={() => prefetchRoute(item.url)}
                      onTouchStart={() => prefetchRoute(item.url)}
                      onClick={() => {
                        if (isMobile) {
                          setOpenMobile(false);
                        }
                      }}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium tracking-wide">{item.title}</span>
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
