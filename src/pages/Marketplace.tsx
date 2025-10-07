import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { MarketplaceListingForm } from "@/components/MarketplaceListingForm";
import { MarketplaceGrid } from "@/components/MarketplaceGrid";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

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
        title="Community Marketplace - Find Vendors, Vacations & Gifts"
        description="Browse community-submitted vendors, vacation rentals, and handmade gifts from fellow users. Click any listing to visit the seller's website."
        keywords="marketplace, vendors, vacation rentals, handmade gifts, etsy, community"
      />
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl shadow-2xl p-8 mb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-4 animate-pulse">
              🚀 ADVERTISE YOUR LISTING WITH US! 🚀
            </h2>
            <p className="text-xl md:text-2xl font-bold mb-6">
              LIMITED TIME OFFER: Get Your First 3 MONTHS FREE! 🎉
            </p>
            <p className="text-lg mb-6 max-w-3xl mx-auto">
              Join our growing community marketplace and reach thousands of budget-conscious customers. 
              No payment required for your first 3 months!
            </p>
            <Button 
              onClick={handleCreateListing} 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-full shadow-xl transform hover:scale-105 transition-all"
            >
              <Plus className="mr-2 h-6 w-6" />
              Start Your FREE Listing Now!
            </Button>
          </div>
        </div>

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
        </div>
      </div>
    </>
  );
}
