import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, Loader2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MarketplaceListingFormProps {
  onClose: () => void;
}

export function MarketplaceListingForm({ onClose }: MarketplaceListingFormProps) {
  const [category, setCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [address, setAddress] = useState("");
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
  } | null>(null);
  const [subscriptionType, setSubscriptionType] = useState<"monthly" | "annual">("monthly");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const { toast } = useToast();

  // Geocode address
  const geocodeAddress = async () => {
    if (!address || address.length < 5) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid address",
        variant: "destructive",
      });
      return;
    }

    setIsGeocodingAddress(true);
    try {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { address }
      });

      if (error) throw error;

      if (data?.latitude && data?.longitude) {
        setLocationData({
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
        });
        toast({
          title: "Address verified",
          description: `Location: ${data.city ? data.city + ', ' : ''}${data.state || data.country}`,
        });
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      toast({
        title: "Error",
        description: "Could not verify address. Please check and try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeocodingAddress(false);
    }
  };

  // Handle adding tags
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Fetch metadata when URL is entered
  const fetchUrlMetadata = async (url: string) => {
    if (!url || url.length < 10) return;
    
    setIsFetchingMetadata(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-url-metadata', {
        body: { url }
      });

      if (error) throw error;

      if (data?.image) {
        setThumbnailUrl(data.image);
      }
      
      // Optionally pre-fill title/description if empty
      if (data?.title && !title) {
        setTitle(data.title.substring(0, 100));
      }
      if (data?.description && !description) {
        setDescription(data.description.substring(0, 1000));
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create a listing",
          variant: "destructive",
        });
        return;
      }

      // Validation
      if (!category || !title || !description) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      if (title.length < 5) {
        toast({
          title: "Title too short",
          description: "Title must be at least 5 characters",
          variant: "destructive",
        });
        return;
      }

      if (description.length < 20) {
        toast({
          title: "Description too short",
          description: "Description must be at least 20 characters",
          variant: "destructive",
        });
        return;
      }

      // Create listing
      console.log("[MarketplaceForm] Creating listing for user:", user.id);
      const { data: listing, error: insertError } = await supabase
        .from('marketplace_listings')
        .insert({
          user_id: user.id,
          category,
          title,
          description,
          price: price ? parseFloat(price) : null,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          website_url: websiteUrl || null,
          image_urls: thumbnailUrl ? [thumbnailUrl] : [],
          location_address: address || null,
          location_latitude: locationData?.latitude || null,
          location_longitude: locationData?.longitude || null,
          location_city: locationData?.city || null,
          location_state: locationData?.state || null,
          location_country: locationData?.country || null,
          tags: tags.length > 0 ? tags : [],
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error("[MarketplaceForm] Insert error:", insertError);
        throw new Error(`Failed to create listing: ${insertError.message}`);
      }
      
      console.log("[MarketplaceForm] Listing created:", listing.id);

      // Moderate content with AI
      console.log("[MarketplaceForm] Moderating listing...");
      const { data: moderationResult, error: moderationError } = await supabase.functions.invoke(
        'moderate-listing',
        {
          body: {
            title,
            description,
            category,
            website_url: websiteUrl,
            listingId: listing.id,
          },
        }
      );

      if (moderationError) {
        console.error("[MarketplaceForm] Moderation error:", moderationError);
        // Don't throw - moderation is optional
      }

      console.log("[MarketplaceForm] Moderation result:", moderationResult);

      // Check if approved
      if (moderationResult?.approved === false) {
        console.log("[MarketplaceForm] Listing rejected by moderation");
        toast({
          title: "Listing rejected",
          description: moderationResult.reason || "Your listing didn't pass our content guidelines",
          variant: "destructive",
        });
        onClose();
        return;
      }

      // Create Stripe subscription
      console.log("[MarketplaceForm] Creating Stripe checkout for:", subscriptionType);
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-listing-subscription',
        {
          body: { 
            listingId: listing.id,
            subscriptionType 
          },
        }
      );

      if (checkoutError) {
        console.error("[MarketplaceForm] Checkout error:", checkoutError);
        throw new Error(`Failed to create checkout: ${checkoutError.message}`);
      }

      console.log("[MarketplaceForm] Checkout data:", checkoutData);

      // Redirect to Stripe checkout
      if (checkoutData?.url) {
        console.log("[MarketplaceForm] Redirecting to:", checkoutData.url);
        window.location.href = checkoutData.url;
      } else {
        console.error("[MarketplaceForm] No checkout URL in response");
        throw new Error("No checkout URL returned from Stripe");
      }
    } catch (error) {
      console.error("[MarketplaceForm] Error creating listing:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Failed to create listing",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Create Marketplace Listing</CardTitle>
            <CardDescription>
              List your business for $0.99/month. Listings are reviewed automatically and go live after payment.
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendor">Vendor/Contractor</SelectItem>
                <SelectItem value="vacation">Vacation Rental</SelectItem>
                <SelectItem value="gift">Handmade Gift/Etsy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Business Name *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your business name"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your business, services, or products (minimum 20 characters)"
              rows={4}
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground">{description.length}/1000 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (up to 10)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder={category === "vendor" ? "e.g., plumbing, roofing" : 
                            category === "vacation" ? "e.g., beach, family-friendly" : 
                            "e.g., handmade, wedding"}
                maxLength={30}
                disabled={tags.length >= 10}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 10}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
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
            <p className="text-xs text-muted-foreground">
              {category === "vendor" && "Add tags like: plumbing, electrical, roofing, landscaping, etc."}
              {category === "vacation" && "Add tags like: beach, mountain, pet-friendly, family-friendly, etc."}
              {category === "gift" && "Add tags like: wedding, birthday, christmas, handmade, personalized, etc."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price/Rate (optional)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="website"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchUrlMetadata(websiteUrl)}
                  disabled={isFetchingMetadata || !websiteUrl}
                >
                  {isFetchingMetadata ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Fetch Image"
                  )}
                </Button>
              </div>
              {thumbnailUrl && (
                <div className="mt-2">
                  <img 
                    src={thumbnailUrl} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
              />
              <Button
                type="button"
                variant="outline"
                onClick={geocodeAddress}
                disabled={isGeocodingAddress || !address}
              >
                {isGeocodingAddress ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
            {locationData && (
              <p className="text-xs text-muted-foreground">
                ✓ Verified: {locationData.city}{locationData.city && locationData.state ? ', ' : ''}{locationData.state}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contact@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">Listing Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Provide accurate business information</li>
              <li>✓ Use professional language</li>
              <li>✓ Include clear contact details</li>
              <li>✗ No spam or inappropriate content</li>
              <li>✗ No fraudulent offers</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Choose Subscription Plan</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSubscriptionType("monthly")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  subscriptionType === "monthly"
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="text-lg font-semibold">Monthly</div>
                <div className="text-2xl font-bold">$0.99</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </button>
              
              <button
                type="button"
                onClick={() => setSubscriptionType("annual")}
                className={`p-4 rounded-lg border-2 transition-all ${
                  subscriptionType === "annual"
                    ? "border-green-500 bg-green-500/10"
                    : "border-muted hover:border-green-500/50"
                }`}
              >
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Annual - Save 17%
                </div>
                <div className="text-2xl font-bold">$9.99</div>
                <div className="text-sm text-muted-foreground">per year</div>
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className={subscriptionType === "annual" ? "flex-1 bg-green-600 hover:bg-green-700" : "flex-1"}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Continue to Payment (${subscriptionType === "monthly" ? "$0.99/month" : "$9.99/year"})`
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
