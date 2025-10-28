import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Store } from "lucide-react";
import { MarketplaceListingForm } from "@/components/MarketplaceListingForm";
import { MarketplaceGrid } from "@/components/MarketplaceGrid";
import { MarketplaceSort, SortOption } from "@/components/MarketplaceSort";
import { SEO } from "@/components/SEO";
import { seoData } from "@/utils/seoData";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { InternalLinks } from "@/components/InternalLinks";
import { FAQ } from "@/components/FAQ";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Marketplace() {
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleCreateListing = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setShowForm(true);
  };

  return (
    <>
      <SEO
        title={seoData.marketplace.title}
        description={seoData.marketplace.description}
        keywords={seoData.marketplace.keywords}
        canonical={seoData.marketplace.canonical}
        ogImage={seoData.marketplace.ogImage}
        structuredData={seoData.marketplace.structuredData}
      />
      
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
        {/* Enhanced header with gradient background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-teal/5 to-sage/10 border border-teal/20 p-6 mb-6 md:mb-8 shadow-lg">
          <div className="flex items-center gap-4 mb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal to-teal/60 rounded-2xl shadow-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-teal bg-clip-text text-transparent">
              Community Marketplace
            </h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground ml-16">
            Discover vendors, vacation rentals, and unique gifts. Click any listing to visit their website.
          </p>
        </div>
        
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {user && (
                <Button 
                  onClick={() => navigate("/my-listings")} 
                  variant="outline" 
                  size={isMobile ? "default" : "lg"}
                  className="w-full sm:w-auto"
                >
                  My Listings
                </Button>
              )}
              <Button 
                onClick={handleCreateListing} 
                size={isMobile ? "default" : "lg"}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                List Your Business
              </Button>
            </div>
            
            <div className="w-full sm:w-auto">
              <MarketplaceSort value={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </div>

        {showForm ? (
          <MarketplaceListingForm onClose={() => setShowForm(false)} />
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-full sm:max-w-md grid-cols-4 mb-6 md:mb-8 h-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-3">All</TabsTrigger>
              <TabsTrigger value="vendor" className="text-xs sm:text-sm px-2 sm:px-3">Vendors</TabsTrigger>
              <TabsTrigger value="vacation" className="text-xs sm:text-sm px-2 sm:px-3">Vacations</TabsTrigger>
              <TabsTrigger value="gift" className="text-xs sm:text-sm px-2 sm:px-3">Gifts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <MarketplaceGrid category={null} />
            </TabsContent>
            <TabsContent value="vendor">
              <MarketplaceGrid category="vendor" />
            </TabsContent>
            <TabsContent value="vacation">
              <MarketplaceGrid category="vacation" />
            </TabsContent>
            <TabsContent value="gift">
              <MarketplaceGrid category="gift" />
            </TabsContent>
          </Tabs>
        )}

        {!showForm && (
          <>
            <FAQ 
              faqs={[
                {
                  question: "How do I list my business on the marketplace?",
                  answer: "Click the 'List Your Business' button at the top of the page. You'll need to sign in first, then fill out the listing form with your business details, category (vendor, vacation rental, or gift), and contact information."
                },
                {
                  question: "Is there a fee to list on the marketplace?",
                  answer: "Basic listings are free! We also offer premium listing options with enhanced visibility and features for a small monthly fee."
                },
                {
                  question: "How do buyers contact me through my listing?",
                  answer: "Each listing includes your website URL and location. Interested buyers can click your listing to visit your website and contact you directly."
                },
                {
                  question: "Can I edit or delete my listing?",
                  answer: "Yes! Navigate to 'My Listings' from the marketplace page to manage all your listings. You can edit details or delete listings at any time."
                }
              ]}
              title="Marketplace FAQs"
            />
            
            <InternalLinks currentPage="/marketplace" />
          </>
        )}
        </div>
      </div>
    </>
  );
}
