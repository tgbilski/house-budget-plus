// src/pages/CompareVendors.tsx
import React, { useEffect } from 'react';
import { Scale, Plus, Filter, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useYear } from '@/hooks/useYear';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { AIChatbot } from '@/components/AIChatbot';
import { useBadges } from '@/hooks/useBadges';
import { WarningBanner } from '@/components/WarningBanner';
import { YearSelector } from '@/components/YearSelector';
import { useVendorProjects } from '@/hooks/useVendorProjects';
import { VendorCard } from '@/components/VendorCard';
import { ProjectSelector } from '@/components/ProjectSelector';
import { ProjectSummaryCard } from '@/components/ProjectSummaryCard';
import { InternalLinks } from '@/components/InternalLinks';
import { FAQ } from '@/components/FAQ';
import { vendorComparisonFAQs } from '@/utils/faqData';

const CompareVendors: React.FC = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { selectedYear } = useYear();
  const { earnBadge } = useBadges();
  const navigate = useNavigate();

  const {
    projects,
    quotes,
    currentProjectId,
    isLoading,
    sortBy,
    summaryStats,
    setCurrentProjectId,
    setSortBy,
    addQuote,
    removeQuote,
    updateQuote,
    updateProjectTitle,
  } = useVendorProjects({ user, year: selectedYear });

  // Award badge when user has vendor quotes
  useEffect(() => {
    if (user && quotes.length > 0) {
      earnBadge('compare_vendors');
    }
  }, [user, quotes.length, earnBadge]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading your projects...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoData.compareVendors.title}
        description={seoData.compareVendors.description}
        keywords={seoData.compareVendors.keywords}
        canonical={seoData.compareVendors.canonical}
        ogImage={seoData.compareVendors.ogImage}
        structuredData={seoData.compareVendors.structuredData}
      />

      <div className="max-w-7xl mx-auto p-3 md:p-4">
        {/* Compact header at very top */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="flex flex-col lg:items-start space-y-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-teal/20 rounded-full">
                <Scale className="h-5 w-5 md:h-6 md:w-6 text-teal" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Vendor Comparison</h1>
            </div>
            <p className="text-muted-foreground text-xs md:text-sm text-center lg:text-left bg-sage/30 px-2 md:px-3 py-1 rounded-md">
              Compare quotes and find the best value
            </p>
          </div>
          
          {/* Year selector at top right on laptop, centered on mobile */}
          <div className="flex justify-center lg:justify-end">
            <YearSelector />
          </div>
        </div>

        <WarningBanner />

        <div className="space-y-4 md:space-y-6">
          <ProjectSelector
            projects={projects}
            currentProjectId={currentProjectId}
            onSelectProject={setCurrentProjectId}
            onUpdateTitle={updateProjectTitle}
          />

          <ProjectSummaryCard
            stats={summaryStats}
            currencySymbol={currency.symbol}
          />

          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <Select value={sortBy} onValueChange={(value: 'amount' | 'rating' | 'date') => setSortBy(value)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">Sort by Price (Low to High)</SelectItem>
                  <SelectItem value="rating">Sort by Rating (High to Low)</SelectItem>
                  <SelectItem value="date">Sort by Date (Newest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button 
                onClick={() => navigate('/marketplace')} 
                variant="outline" 
                className="gap-2 w-full sm:flex-1 text-sm"
              >
                <Store className="h-4 w-4" /> 
                <span className="hidden sm:inline">See Vendors in Your Area</span>
                <span className="sm:hidden">Find Vendors</span>
              </Button>
              <Button 
                onClick={addQuote} 
                className="gap-2 w-full sm:flex-1 bg-teal hover:bg-teal/90 text-teal-foreground text-sm"
              >
                <Plus className="h-4 w-4" /> Add Quote
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotes.map((quote) => (
              <VendorCard
                key={quote.id}
                quote={quote}
                onUpdate={updateQuote}
                onRemove={removeQuote}
                showRemove={quotes.length > 1}
                currencySymbol={currency.symbol}
              />
            ))}
          </div>

          <AIChatbot
            pageContext="This is the Vendor Comparison page where users can create projects and compare vendor quotes."
            pageName="Vendor Comparison"
          />

          <FAQ faqs={vendorComparisonFAQs} title="Vendor Comparison FAQs" />
        </div>

        <InternalLinks currentPage="/compare-prices" category="comparison" />
      </div>
    </div>
  );
};

export default CompareVendors;
