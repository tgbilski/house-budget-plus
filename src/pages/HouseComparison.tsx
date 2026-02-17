import { useState, useCallback } from "react";
import { Plus, Trash2, ExternalLink, Home, Loader2, Star, StarOff, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

interface HouseProperty {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  // Manual fields
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  pros: string;
  cons: string;
  notes: string;
  familyRating: number; // 1-5 stars
  isFavorite: boolean;
}

const STORAGE_KEY = "house-comparison-properties";

const loadProperties = (): HouseProperty[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveProperties = (properties: HouseProperty[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
};

const createEmptyProperty = (): HouseProperty => ({
  id: crypto.randomUUID(),
  url: "",
  title: "",
  description: "",
  image: "",
  price: "",
  beds: "",
  baths: "",
  sqft: "",
  pros: "",
  cons: "",
  notes: "",
  familyRating: 0,
  isFavorite: false,
});

const HouseComparison = () => {
  const [properties, setProperties] = useState<HouseProperty[]>(loadProperties);
  const [urlInput, setUrlInput] = useState("");
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();

  // Persist to localStorage on every change
  const updateProperties = useCallback((updated: HouseProperty[]) => {
    setProperties(updated);
    saveProperties(updated);
  }, []);

  const fetchMetadata = async () => {
    const url = urlInput.trim();
    if (!url) return;

    // Basic URL validation
    let validUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      validUrl = `https://${url}`;
    }

    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-url-metadata", {
        body: { url: validUrl },
      });

      if (error) throw error;

      const newProp: HouseProperty = {
        ...createEmptyProperty(),
        url: validUrl,
        title: data?.title || "Untitled Property",
        description: data?.description || "",
        image: data?.image || "",
      };

      // Try to extract price from title/description
      const priceMatch = (data?.title + " " + data?.description)?.match(/\$[\d,]+/);
      if (priceMatch) {
        newProp.price = priceMatch[0];
      }

      // Try to extract beds/baths from description
      const bedMatch = (data?.title + " " + data?.description)?.match(/(\d+)\s*(?:bed|br|bedroom)/i);
      const bathMatch = (data?.title + " " + data?.description)?.match(/(\d+\.?\d*)\s*(?:bath|ba|bathroom)/i);
      const sqftMatch = (data?.title + " " + data?.description)?.match(/([\d,]+)\s*(?:sq\s*ft|sqft|square\s*feet)/i);

      if (bedMatch) newProp.beds = bedMatch[1];
      if (bathMatch) newProp.baths = bathMatch[1];
      if (sqftMatch) newProp.sqft = sqftMatch[1];

      updateProperties([...properties, newProp]);
      setUrlInput("");
      toast({ title: "Property added!", description: "Fill in any missing details below." });
    } catch (err) {
      console.error("Metadata fetch error:", err);
      // Still add with URL even if fetch fails
      const newProp: HouseProperty = {
        ...createEmptyProperty(),
        url: validUrl,
        title: "Could not load details",
      };
      updateProperties([...properties, newProp]);
      setUrlInput("");
      toast({
        title: "Added property",
        description: "We couldn't pull details automatically. You can fill them in manually.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const addManualProperty = () => {
    updateProperties([...properties, createEmptyProperty()]);
  };

  const removeProperty = (id: string) => {
    updateProperties(properties.filter((p) => p.id !== id));
  };

  const updateField = (id: string, field: keyof HouseProperty, value: string | number | boolean) => {
    updateProperties(
      properties.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const toggleFavorite = (id: string) => {
    updateProperties(
      properties.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const setRating = (id: string, rating: number) => {
    updateProperties(
      properties.map((p) => (p.id === id ? { ...p, familyRating: p.familyRating === rating ? 0 : rating } : p))
    );
  };

  const clearAll = () => {
    updateProperties([]);
    toast({ title: "All properties cleared" });
  };

  // Sort: favorites first, then by rating
  const sorted = [...properties].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;
    return b.familyRating - a.familyRating;
  });

  return (
    <>
      <SEO
        title="House Comparison Tool | Compare Homes Side by Side"
        description="Compare houses side by side with your family. Paste Zillow or Realtor URLs to auto-populate property details and make your home buying decision easier."
        canonical="/house-comparison"
        keywords="house comparison, home buying, compare houses, property comparison, family home search"
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3">
            <Home className="h-8 w-8 text-primary" />
            House Comparison
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Paste a Zillow or Realtor link to auto-fill property details, or add manually. Compare side by side and vote as a family!
          </p>
        </div>

        {/* URL Input */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Paste a Zillow, Realtor, or property URL..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchMetadata()}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button onClick={fetchMetadata} disabled={fetching || !urlInput.trim()} className="gap-2">
                  {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {fetching ? "Fetching..." : "Add from URL"}
                </Button>
                <Button variant="outline" onClick={addManualProperty} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Manually
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid */}
        {sorted.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center py-12">
              <Home className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-lg">No properties yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Paste a property URL above or add one manually to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {properties.length} {properties.length === 1 ? "property" : "properties"} compared
              </p>
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sorted.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onUpdate={updateField}
                  onRemove={removeProperty}
                  onToggleFavorite={toggleFavorite}
                  onSetRating={setRating}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

interface PropertyCardProps {
  property: HouseProperty;
  onUpdate: (id: string, field: keyof HouseProperty, value: string | number | boolean) => void;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSetRating: (id: string, rating: number) => void;
}

const PropertyCard = ({ property, onUpdate, onRemove, onToggleFavorite, onSetRating }: PropertyCardProps) => {
  const p = property;

  return (
    <Card className={`relative overflow-hidden transition-all ${p.isFavorite ? "ring-2 ring-primary shadow-lg" : ""}`}>
      {/* Image */}
      {p.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={p.image}
            alt={p.title || "Property"}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {p.isFavorite && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
              ⭐ Family Pick
            </Badge>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Input
              value={p.title}
              onChange={(e) => onUpdate(p.id, "title", e.target.value)}
              placeholder="Property name / address"
              className="font-bold text-lg border-none px-0 h-auto bg-transparent focus-visible:ring-0"
            />
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggleFavorite(p.id)}
            >
              {p.isFavorite ? (
                <Star className="h-4 w-4 fill-primary text-primary" />
              ) : (
                <StarOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            {p.url && (
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onRemove(p.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {p.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Price</label>
            <Input
              value={p.price}
              onChange={(e) => onUpdate(p.id, "price", e.target.value)}
              placeholder="$350,000"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Sq Ft</label>
            <Input
              value={p.sqft}
              onChange={(e) => onUpdate(p.id, "sqft", e.target.value)}
              placeholder="2,100"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Beds</label>
            <Input
              value={p.beds}
              onChange={(e) => onUpdate(p.id, "beds", e.target.value)}
              placeholder="3"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Baths</label>
            <Input
              value={p.baths}
              onChange={(e) => onUpdate(p.id, "baths", e.target.value)}
              placeholder="2"
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="space-y-2">
          <div>
            <label className="text-xs font-medium text-green-600">👍 Pros</label>
            <Textarea
              value={p.pros}
              onChange={(e) => onUpdate(p.id, "pros", e.target.value)}
              placeholder="Great school district, big yard..."
              className="min-h-[60px] text-sm resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-red-500">👎 Cons</label>
            <Textarea
              value={p.cons}
              onChange={(e) => onUpdate(p.id, "cons", e.target.value)}
              placeholder="Needs new roof, far from work..."
              className="min-h-[60px] text-sm resize-none"
            />
          </div>
        </div>

        {/* Family Notes */}
        <div>
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> Family Notes
          </label>
          <Textarea
            value={p.notes}
            onChange={(e) => onUpdate(p.id, "notes", e.target.value)}
            placeholder="Mom loves the kitchen, kids want the pool..."
            className="min-h-[60px] text-sm resize-none"
          />
        </div>

        {/* Family Rating */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Family Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onSetRating(p.id, star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= p.familyRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
            {p.familyRating > 0 && (
              <span className="text-sm text-muted-foreground ml-2 self-center">
                {p.familyRating}/5
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HouseComparison;
