import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MarketplaceListingCard } from "@/components/MarketplaceListingCard";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  created_at: string;
}

interface MarketplaceGridProps {
  category: string | null;
}

export function MarketplaceGrid({ category }: MarketplaceGridProps) {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  useEffect(() => {
    loadListings();
  }, [category, cityFilter, stateFilter]);

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

      if (cityFilter) {
        query = query.ilike('location_city', `%${cityFilter}%`);
      }

      if (stateFilter) {
        query = query.ilike('location_state', `%${stateFilter}%`);
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

  const handleClearFilters = () => {
    setCityFilter("");
    setStateFilter("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Filter by Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="e.g., New York"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="e.g., NY"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              disabled={!cityFilter && !stateFilter}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No listings found{cityFilter || stateFilter ? ' with these filters' : ' in this category yet'}.</p>
          <p className="text-sm text-muted-foreground mt-2">{cityFilter || stateFilter ? 'Try adjusting your filters.' : 'Be the first to add one!'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <MarketplaceListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
