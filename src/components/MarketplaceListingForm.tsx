import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, Loader2 } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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
      const { data: listing, error: insertError } = await supabase
        .from('marketplace_listings')
        .insert({
          category,
          title,
          description,
          price: price ? parseFloat(price) : null,
          contact_email: contactEmail || null,
          contact_phone: contactPhone || null,
          website_url: websiteUrl || null,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Moderate content with AI
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
        console.error("Moderation error:", moderationError);
      }

      // Check if approved
      if (moderationResult?.approved === false) {
        toast({
          title: "Listing rejected",
          description: moderationResult.reason || "Your listing didn't pass our content guidelines",
          variant: "destructive",
        });
        onClose();
        return;
      }

      // Create Stripe subscription
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-listing-subscription',
        {
          body: { listingId: listing.id },
        }
      );

      if (checkoutError) throw checkoutError;

      // Redirect to Stripe checkout
      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
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
              <Input
                id="website"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
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

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Payment ($0.99/month)"
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
