import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface BreadcrumbData {
  label: string;
  href: string;
}

const routeMap: Record<string, string> = {
  '/': 'Home',
  '/home': 'Monthly Budget',
  '/compare-prices': 'Compare Vendors',
  '/takeout': 'Takeout Calendar',
  '/vacation': 'Vacation Planner',
  '/settings': 'Settings',
  '/auth': 'Sign In',
  '/resources': 'Financial Resources',
  '/templates': 'Budget Templates'
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Don't show breadcrumbs on home page
  if (location.pathname === '/' || location.pathname === '/home') {
    return null;
  }
  
  const breadcrumbs: BreadcrumbData[] = [
    { label: 'Home', href: '/' }
  ];
  
  let currentPath = '';
  pathSegments.forEach(segment => {
    currentPath += `/${segment}`;
    const label = routeMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: currentPath });
  });

  // Structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.label,
      "item": `${window.location.origin}${crumb.href}`
    }))
  };

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      <div className="container mx-auto px-4 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-muted-foreground">{crumb.label}</span>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.href} className="flex items-center gap-1">
                        {index === 0 && <Home className="h-4 w-4" />}
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </>
  );
};