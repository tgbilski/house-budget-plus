import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MarketplaceListingCard } from "@/components/MarketplaceListingCard";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  tags: string[] | null;
  user_id: string;
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    loadListings();
  }, [category, cityFilter, stateFilter, selectedTags]);

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

      if (selectedTags.length > 0) {
        query = query.contains('tags', selectedTags);
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
    setSelectedTags([]);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags([...selectedTags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Filters</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Search by Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="e.g., plumbing, beach, christmas"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
              />
              <Button
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            disabled={!cityFilter && !stateFilter && selectedTags.length === 0}
            className="w-full"
          >
            Clear All Filters
          </Button>
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
