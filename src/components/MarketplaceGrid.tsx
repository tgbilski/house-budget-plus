import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MarketplaceListingCard } from "@/components/MarketplaceListingCard";
import { Loader2 } from "lucide-react";

interface MarketplaceListing {
  id: string;
  category: string;
  title: string;
  description: string;
  price: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  image_urls: string[] | null;
  created_at: string;
}

interface MarketplaceGridProps {
  category: string | null;
}

export function MarketplaceGrid({ category }: MarketplaceGridProps) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, [category]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error loading listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No listings found in this category yet.</p>
        <p className="text-sm text-muted-foreground mt-2">Be the first to add one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <MarketplaceListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
