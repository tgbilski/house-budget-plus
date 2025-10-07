import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { MarketplaceListingForm } from "@/components/MarketplaceListingForm";
import { MarketplaceGrid } from "@/components/MarketplaceGrid";
import { SEO } from "@/components/SEO";
import { seoData } from "@/utils/seoData";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { InternalLinks } from "@/components/InternalLinks";
import { FAQ } from "@/components/FAQ";

export default function Marketplace() {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Community Marketplace</h1>
            <p className="text-muted-foreground">
              Discover vendors, vacation rentals, and unique gifts. Click any listing to visit their website.
            </p>
          </div>
          <div className="flex gap-2">
            {user && (
              <Button onClick={() => navigate("/my-listings")} variant="outline" size="lg">
                My Listings
              </Button>
            )}
            <Button onClick={handleCreateListing} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              List Your Business
            </Button>
          </div>
        </div>

        {showForm ? (
          <MarketplaceListingForm onClose={() => setShowForm(false)} />
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-4 mb-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="vendor">Vendors</TabsTrigger>
              <TabsTrigger value="vacation">Vacations</TabsTrigger>
              <TabsTrigger value="gift">Gifts</TabsTrigger>
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
