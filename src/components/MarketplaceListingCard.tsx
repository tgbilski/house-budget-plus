import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail, Phone, Flag, MapPin, Tag } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

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

interface MarketplaceListingCardProps {
  listing: MarketplaceListing;
}

export function MarketplaceListingCard({ listing }: MarketplaceListingCardProps) {
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const categoryColors = {
    vendor: "bg-blue-500",
    vacation: "bg-green-500",
    gift: "bg-purple-500",
  };

  const handleReport = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to report listings",
        variant: "destructive",
      });
      return;
    }

    if (!reportReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for reporting",
        variant: "destructive",
      });
      return;
    }

    setIsReporting(true);
    try {
      const { error } = await supabase.from('user_reports').insert({
        listing_id: listing.id,
        reporter_user_id: user.id,
        reason: reportReason,
      });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already reported",
            description: "You've already reported this listing",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Report submitted",
          description: "Thank you for helping keep our marketplace safe",
        });
        setReportReason("");
      }
    } catch (error) {
      console.error("Error reporting:", error);
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsReporting(false);
    }
  };

  const handleCardClick = () => {
    if (listing.website_url) {
      window.open(listing.website_url, '_blank', 'noopener,noreferrer');
    }
  };

  const thumbnailImage = listing.image_urls && listing.image_urls.length > 0 
    ? listing.image_urls[0] 
    : null;

  // Check if this is an example listing
  const isExampleListing = listing.user_id === '00000000-0000-0000-0000-000000000000';

  return (
    <Card 
      className={`hover:shadow-lg transition-shadow ${listing.website_url ? 'cursor-pointer' : ''} ${isExampleListing ? 'border-2 border-orange-200' : ''}`}
      onClick={handleCardClick}
    >
      {thumbnailImage && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img 
            src={thumbnailImage} 
            alt={listing.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            <Badge className={categoryColors[listing.category as keyof typeof categoryColors]}>
              {listing.category}
            </Badge>
            {isExampleListing && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                Example
              </Badge>
            )}
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <Flag className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Report Listing</AlertDialogTitle>
                <AlertDialogDescription>
                  Please provide a reason for reporting this listing.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea
                placeholder="Why are you reporting this listing?"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReport} disabled={isReporting}>
                  Submit Report
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <CardTitle className="flex items-center gap-2">
          {listing.title}
          {listing.website_url && (
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
        {listing.price && (
          <CardDescription className="font-semibold text-lg">
            ${listing.price.toFixed(2)}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {listing.description}
        </p>

        {(listing.location_city || listing.location_state) && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4" />
            <span>
              {listing.location_city}{listing.location_city && listing.location_state ? ', ' : ''}{listing.location_state}
            </span>
          </div>
        )}

        {listing.tags && listing.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <Tag className="h-3 w-3" />
              <span>Tags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {listing.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          {listing.contact_email && (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={`mailto:${listing.contact_email}`}>
                <Mail className="mr-2 h-4 w-4" />
                Email
              </a>
            </Button>
          )}
          
          {listing.contact_phone && (
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={`tel:${listing.contact_phone}`}>
                <Phone className="mr-2 h-4 w-4" />
                Call
              </a>
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Listed {new Date(listing.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
