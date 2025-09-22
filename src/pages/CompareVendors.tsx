// src/pages/CompareVendors.tsx
import React from 'react';
import { Scale, Plus, Filter } from 'lucide-react';
// ... other imports
import { useVendorProjects } from '@/hooks/useVendorProjects';
import { VendorCard } from '@/components/VendorCard';
import { ProjectSelector } from '@/components/ProjectSelector';
import { ProjectSummaryCard } from '@/components/ProjectSummaryCard'; // Import the new summary card

const CompareVendors: React.FC = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { selectedYear } = useYear();

  const {
    projects,
    quotes,
    currentProjectId,
    isLoading,
    sortBy,
    summaryStats, // Get the new summary object
    setCurrentProjectId,
    setSortBy,
    addQuote,
    removeQuote,
    updateQuote,
    updateProjectTitle,
  } = useVendorProjects({ user, year: selectedYear });

  if (isLoading) { /* ... */ }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO { /* ... */ } />

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Comparison</h1>
              <p className="text-sm text-gray-600">Compare quotes and find the best value</p>
            </div>
          </div>
          <YearSelector />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <WarningBanner />

        <ProjectSelector
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={setCurrentProjectId}
          onUpdateTitle={updateProjectTitle}
        />

        {/* The new Summary Card goes here! */}
        <ProjectSummaryCard
          stats={summaryStats}
          currencySymbol={currency.symbol}
        />

        <div className="flex justify-between items-center">
          { /* ... Sort by and Add Quote buttons ... */ }
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

        <AIChatbot { /* ... */ } />
      </div>
    </div>
  );
};

export default CompareVendors;
