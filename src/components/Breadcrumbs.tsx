import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/budget': 'Monthly Budget',
  '/expenses': 'Expense Tracker',
  '/savings': 'Savings Goals',
  '/settings': 'Settings',
  '/login': 'Sign In',
  '/signup': 'Sign Up',
  '/about': 'About Us',
  '/contact': 'Contact',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms & Conditions',
  '/disclaimer': 'Disclaimer',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on homepage
  if (pathnames.length === 0) return null;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
  ];

  let currentPath = '';
  pathnames.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: currentPath });
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <React.Fragment key={crumb.href}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href}
                className={cn(
                  "hover:text-foreground transition-colors",
                  index === 0 && "flex items-center gap-1"
                )}
              >
                {index === 0 && <Home className="h-3.5 w-3.5" />}
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
