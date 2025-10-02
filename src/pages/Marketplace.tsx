import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Community Marketplace - Find Vendors, Vacations & Gifts"
        description="Browse community-submitted vendors, vacation rentals, and handmade gifts from fellow users."
        keywords="marketplace, vendors, vacation rentals, handmade gifts, etsy, community"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Community Marketplace</h1>
            <p className="text-muted-foreground">
              Discover vendors, vacation rentals, and unique gifts shared by our community
            </p>
          </div>
          <Button onClick={handleCreateListing} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            List Your Business
          </Button>
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
      </main>

      <Footer />
    </div>
  );
}
