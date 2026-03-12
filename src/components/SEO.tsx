import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title: string;
  description: string;
  keywords: string;
  structuredData?: any;
  canonical?: string;
  ogImage?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const routeLabels: Record<string, string> = {
  '/': 'Home',
  '/budget': 'Monthly Budget',
  '/savings': 'Savings Goals',
  '/expenses': 'Expense Tracker',
  '/about': 'About Us',
  '/contact': 'Contact',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms & Conditions',
  '/disclaimer': 'Disclaimer',
};

const generateBreadcrumbSchema = (pathname: string, customBreadcrumbs?: BreadcrumbItem[]) => {
  const baseUrl = 'https://www.housebudgetcalculator.com';
  
  // Use custom breadcrumbs if provided
  if (customBreadcrumbs && customBreadcrumbs.length > 0) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": customBreadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
  }
  
  // Auto-generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) {
    return null; // No breadcrumbs for homepage
  }
  
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": baseUrl
    }
  ];
  
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": index + 2,
      "name": label,
      "item": `${baseUrl}${currentPath}`
    });
  });
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  };
};

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  structuredData,
  canonical,
  ogImage = 'https://www.housebudgetcalculator.com/lovable-uploads/og-image-social.png',
  breadcrumbs
}) => {
  const location = useLocation();
  const fullTitle = title.includes('Budget Calculator') ? title : `${title} | House Budget Calculator`;
  const fullUrl = canonical || 'https://www.housebudgetcalculator.com';
  
  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema(location.pathname, breadcrumbs);
  
  // Combine structured data with breadcrumb schema
  const allStructuredData = [];
  if (structuredData) {
    allStructuredData.push(structuredData);
  }
  if (breadcrumbSchema) {
    allStructuredData.push(breadcrumbSchema);
  }
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="google-adsense-account" content="ca-pub-5656855326953521" />
      
      {/* Open Graph tags */}
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="House Budget Calculator" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={fullTitle} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data - render each schema separately */}
      {allStructuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};