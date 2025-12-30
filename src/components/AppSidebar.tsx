import { 
  PiggyBank, 
  Plane, 
  Gift, 
  Brain,
  BookOpen,
  Shield,
  Mic
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
  { title: "Monthly Budget", url: "/budget", icon: HouseDollarIcon },
  { title: "Voice Expenses", url: "/expenses", icon: Mic },
  { title: "Savings", url: "/savings", icon: PiggyBank },
  { title: "Vacation", url: "/vacation", icon: Plane },
  { title: "Gifts", url: "/gifts", icon: Gift },
  { title: "Blog", url: "/blog", icon: BookOpen },
  { title: "AI Insights", url: "/ai-insights", icon: Brain },
];

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { setOpen, setOpenMobile, isMobile: sidebarIsMobile, open } = useSidebar();
  const isMobile = useIsMobile();
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
    { title: "Admin Dashboard", url: "/admin", icon: Shield },
  ];

  const allItems = isAdmin 
    ? [...navigationItems, ...adminItems]
    : navigationItems;

  const isActive = (path: string) => currentPath === path;

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar 
      collapsible={isMobile ? "offcanvas" : "icon"}
      className={cn(
        // On desktop: fixed position, starts below 64px header, full height minus header
        !isMobile && "fixed left-0 z-30 border-r bg-sidebar transition-all",
        // On mobile: relative as before
        isMobile && "relative border-r bg-sidebar",
        // Width logic
        !isMobile && (open ? "w-64" : "w-14"),
        "h-full"
      )}
      // Only apply top/height on desktop
      style={!isMobile 
        ? { top: "64px", height: "calc(100vh - 64px)" }
        : undefined
      }
      variant="sidebar"
    >
      <SidebarContent className={cn(!isMobile && "p-2")}>
        <SidebarGroup>
          {isMobile && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className={cn(!isMobile && !open && "flex flex-col items-center space-y-1")}>
              {allItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                        !isMobile && !open && "justify-center px-2"
                      )}
                      title={!open && !isMobile ? item.title : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {(open || isMobile) && <span>{item.title}</span>}
                      </div>
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
