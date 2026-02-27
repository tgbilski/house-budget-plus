import { useState, useCallback } from "react";
import { Plus, Trash2, ExternalLink, Home, Loader2, Star, StarOff, MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { PremiumLimitBanner } from "@/components/PremiumLimitBanner";

interface HouseProperty {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  streetViewImage: string;
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
  streetViewImage: "",
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
  const { subscribed } = useSubscription();

  const atFreeLimit = !subscribed && properties.length >= 2;

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

    // Extract a friendly name from the URL (e.g. address from Zillow/Realtor path)
    const extractNameFromUrl = (urlStr: string): string => {
      try {
        const urlObj = new URL(urlStr);
        const hostname = urlObj.hostname.replace("www.", "");
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        
        // Realtor: /realestateandhomes-detail/1626-Red-Mill-Dr_Pittsburgh_PA_15241_M40415-90924
        if (hostname.includes("realtor.com")) {
          const detail = pathParts.find(p => p.includes("_") && p.length > 10);
          if (detail) {
            // Remove trailing ID like _M40415-90924
            const cleaned = detail.replace(/_M\d+-\d+$/, "");
            // Split on underscores: address parts use hyphens, city/state use underscores
            const segments = cleaned.split("_");
            const address = segments[0]?.replace(/-/g, " ") || "";
            const city = segments[1]?.replace(/-/g, " ") || "";
            const state = segments[2] || "";
            const zip = segments[3] || "";
            const parts = [address, city, state, zip].filter(Boolean);
            return parts.join(", ").replace(/\b\w/g, c => c.toUpperCase()).trim();
          }
        }

        // Zillow: /homedetails/123-Main-St-City-ST-12345/12345_zpid/
        if (hostname.includes("zillow.com")) {
          const detail = pathParts.find(p => p.includes("-") && p.length > 10 && !p.includes("_zpid"));
          if (detail) {
            return detail.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
          }
        }

        // Generic: find a path segment that looks like an address
        const addressPart = pathParts.find(part => 
          /\d+.*(?:St|Ave|Rd|Dr|Ln|Ct|Blvd|Way|Pl|Cir)/i.test(part)
        );
        if (addressPart) {
          return addressPart.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
        }
        
        return `Property from ${hostname}`;
      } catch {
        return "New Property";
      }
    };

    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-url-metadata", {
        body: { url: validUrl },
      });

      const hasTitle = !error && data?.title && data.title.length > 5;
      const title = hasTitle ? data.title : extractNameFromUrl(validUrl);

      const newProp: HouseProperty = {
        ...createEmptyProperty(),
        url: validUrl,
        title,
        description: data?.description || "",
        image: data?.image || "",
      };

      // If no OG image, try to fetch Street View using the title as address
      if (!newProp.image && title && title !== "New Property" && !title.startsWith("Property from")) {
        try {
          const svResponse = await supabase.functions.invoke("get-street-view", {
            body: { address: title },
          });
          if (svResponse.data && !(svResponse.data instanceof Object && 'error' in svResponse.data)) {
            // Convert to base64 data URL so it persists in localStorage
            const blob = new Blob([svResponse.data], { type: 'image/jpeg' });
            const reader = new FileReader();
            const dataUrl = await new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
            newProp.streetViewImage = dataUrl;
          }
        } catch {
          console.log("Street View not available for this address");
        }
      }

      updateProperties([...properties, newProp]);
      setUrlInput("");
      toast({ 
        title: "Property added!", 
        description: newProp.image
          ? "Preview loaded! Fill in price, beds, baths, etc. from the listing."
          : newProp.streetViewImage
            ? "Street View loaded! Fill in the details from the listing page."
            : "Link saved — fill in the details from the listing page."
      });
    } catch (err) {
      console.error("Metadata fetch error:", err);
      const newProp: HouseProperty = {
        ...createEmptyProperty(),
        url: validUrl,
        title: extractNameFromUrl(validUrl),
      };
      updateProperties([...properties, newProp]);
      setUrlInput("");
      toast({
        title: "Property added!",
        description: "Link saved — fill in the details from the listing page.",
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
            Paste any property link to grab a preview, then fill in the details. Compare side by side and vote as a family!
          </p>
        </div>

        {/* URL Input */}
        {atFreeLimit ? (
          <PremiumLimitBanner featureName="properties" freeLimit={2} />
        ) : (
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
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button onClick={fetchMetadata} disabled={fetching || !urlInput.trim()} className="gap-2 w-full sm:w-auto touch-manipulation">
                    {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {fetching ? "Fetching..." : "Add from URL"}
                  </Button>
                  <Button variant="outline" onClick={addManualProperty} className="gap-2 w-full sm:w-auto touch-manipulation">
                    <Plus className="h-4 w-4" />
                    Add Manually
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
};

const PropertyCard = ({ property, onUpdate, onRemove, onToggleFavorite, onSetRating }: PropertyCardProps) => {
  const p = property;
  const domain = p.url ? getDomain(p.url) : "";
  const displayImage = p.image || p.streetViewImage;
  const hasPreview = displayImage || (p.url && (p.title || p.description));

  return (
    <Card className={`relative overflow-hidden transition-all ${p.isFavorite ? "ring-2 ring-primary shadow-lg" : ""}`}>
      {/* Link Preview — iMessage style */}
      {hasPreview && p.url && (
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group cursor-pointer"
        >
          {displayImage && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={displayImage}
                alt={p.title || "Property"}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {p.streetViewImage && !p.image && (
                <span className="absolute top-2 right-2 text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Street View
                </span>
              )}
              {p.isFavorite && (
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                  ⭐ Family Pick
                </Badge>
              )}
              {domain && (
                <span className="absolute bottom-2 left-3 text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {domain}
                </span>
              )}
            </div>
          )}
          {!displayImage && domain && (
            <div className="flex items-center gap-2 px-4 pt-4">
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                alt=""
                className="h-4 w-4 rounded-sm"
              />
              <span className="text-xs text-muted-foreground font-medium">{domain}</span>
            </div>
          )}
        </a>
      )}
      {/* Fallback when no image at all */}
      {!displayImage && (
        <div className="relative h-32 bg-muted/50 flex flex-col items-center justify-center gap-2">
          <Home className="h-10 w-10 text-muted-foreground/30" />
          {domain && !hasPreview && (
            <span className="text-xs text-muted-foreground">{domain}</span>
          )}
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
              className="font-bold text-lg border-none px-0 h-auto bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/40 placeholder:italic"
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
              className="h-8 text-sm border-dashed placeholder:text-muted-foreground/40 placeholder:italic"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Sq Ft</label>
            <Input
              value={p.sqft}
              onChange={(e) => onUpdate(p.id, "sqft", e.target.value)}
              placeholder="2,100"
              className="h-8 text-sm border-dashed placeholder:text-muted-foreground/40 placeholder:italic"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Beds</label>
            <Input
              value={p.beds}
              onChange={(e) => onUpdate(p.id, "beds", e.target.value)}
              placeholder="3"
              className="h-8 text-sm border-dashed placeholder:text-muted-foreground/40 placeholder:italic"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Baths</label>
            <Input
              value={p.baths}
              onChange={(e) => onUpdate(p.id, "baths", e.target.value)}
              placeholder="2"
              className="h-8 text-sm border-dashed placeholder:text-muted-foreground/40 placeholder:italic"
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
              className="min-h-[60px] text-sm resize-none border-dashed placeholder:text-muted-foreground/40 placeholder:italic"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-red-500">👎 Cons</label>
            <Textarea
              value={p.cons}
              onChange={(e) => onUpdate(p.id, "cons", e.target.value)}
              placeholder="Needs new roof, far from work..."
              className="min-h-[60px] text-sm resize-none border-dashed placeholder:text-muted-foreground/40 placeholder:italic"
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
            className="min-h-[60px] text-sm resize-none border-dashed placeholder:text-muted-foreground/40 placeholder:italic"
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
