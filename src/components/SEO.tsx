import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords: string;
  structuredData?: any;
  canonical?: string;
  ogImage?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  structuredData,
  canonical,
  ogImage = 'https://www.housebudgetcalculator.com/lovable-uploads/calculator-preview-hero.png'
}) => {
  const fullTitle = title.includes('Budget Calculator') ? title : `${title} | House Budget Calculator`;
  const fullUrl = canonical || 'https://www.housebudgetcalculator.com';
  
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
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};