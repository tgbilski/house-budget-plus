// src/pages/CompareVendors.tsx
import React from 'react';
import { Scale, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';
import { useYear } from '@/hooks/useYear';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { AIChatbot } from '@/components/AIChatbot';
import { WarningBanner } from '@/components/WarningBanner';
import { YearSelector } from '@/components/YearSelector'; // The import is back

// Import our new hook and components!
import { useVendorProjects } from '@/hooks/useVendorProjects';
import { VendorCard } from '@/components/VendorCard';
import { ProjectSelector } from '@/components/ProjectSelector';

const CompareVendors: React.FC = () => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { selectedYear } = useYear();

  // The hook does all the work!
  const {
    projects,
    quotes,
    currentProjectId,
    isLoading,
    sortBy,
    savingsPotential,
    setCurrentProjectId,
    setSortBy,
    addQuote,
    removeQuote,
    updateQuote,
    updateProjectTitle,
  } = useVendorProjects({ user, year: selectedYear });

  if (isLoading) {
    return <div className="p-8 text-center">Loading your projects...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={seoData.compareVendors.title}
        description={seoData.compareVendors.description}
        keywords={seoData.compareVendors.keywords}
        canonical="https://www.housebudgetcalculator.com/compare-prices"
      />

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendor Comparison</h1>
              <p className="text-sm text-gray-600">Compare quotes and find the best value</p>
            </div>
          </div>

          <YearSelector /> {/* The component is back in its place */}

          {savingsPotential > 0 && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Savings Potential</div>
              <div className="text-2xl font-bold text-green-600">
                {currency.symbol}{savingsPotential.toLocaleString()}
              </div>
            </div>
          )}
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

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={sortBy} onValueChange={(value: 'amount' | 'rating' | 'date') => setSortBy(value)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Sort by Price (Low to High)</SelectItem>
                <SelectItem value="rating">Sort by Rating (High to Low)</SelectItem>
                <SelectItem value="date">Sort by Date (Newest First)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={addQuote} className="gap-2"><Plus className="h-4 w-4" /> Add Quote</Button>
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
      </div>
    </div>
  );
};

export default CompareVendors;
