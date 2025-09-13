import { 
  Home, 
  Calculator, 
  PiggyBank, 
  ShoppingCart, 
  Plane, 
  Gift, 
  Brain
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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { setOpen, setOpenMobile, isMobile: sidebarIsMobile, open } = useSidebar();
  const isMobile = useIsMobile();

  const isActive = (path: string) => currentPath === path;

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isMobile) {
      // Close mobile sidebar properly
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar 
      collapsible={isMobile ? "offcanvas" : "icon"}
      className={cn(
        "h-full border-r bg-sidebar",
        isMobile && "relative",
        !isMobile && (open ? "w-64" : "w-14")
      )}
      variant="sidebar"
    >
      <SidebarContent className={cn(!isMobile && "p-2")}>
        <SidebarGroup>
          {isMobile && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className={cn(!isMobile && !open && "flex flex-col items-center space-y-1")}>
              {navigationItems.map((item) => (
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