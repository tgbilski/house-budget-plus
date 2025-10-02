import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface Listing {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  price: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  status: string;
  report_count: number;
  moderation_result: any;
  created_at: string;
}

export default function AdminMarketplace() {
  const [flaggedListings, setFlaggedListings] = useState<Listing[]>([]);
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadListings();
    }
  }, [isAdmin]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const [flaggedRes, pendingRes] = await Promise.all([
        supabase
          .from('marketplace_listings')
          .select('*')
          .eq('status', 'flagged')
          .order('report_count', { ascending: false }),
        supabase
          .from('marketplace_listings')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
      ]);

      if (flaggedRes.error) throw flaggedRes.error;
      if (pendingRes.error) throw pendingRes.error;

      setFlaggedListings(flaggedRes.data || []);
      setPendingListings(pendingRes.data || []);
    } catch (error) {
      console.error("Error loading listings:", error);
      toast({
        title: "Error",
        description: "Failed to load listings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ status: 'active', report_count: 0 })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Listing approved",
        description: "The listing is now active",
      });
      loadListings();
    } catch (error) {
      console.error("Error approving listing:", error);
      toast({
        title: "Error",
        description: "Failed to approve listing",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({ 
          status: 'rejected',
          rejection_reason: 'Flagged by multiple users'
        })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Listing rejected",
        description: "The listing has been removed",
      });
      loadListings();
    } catch (error) {
      console.error("Error rejecting listing:", error);
      toast({
        title: "Error",
        description: "Failed to reject listing",
        variant: "destructive",
      });
    }
  };

  const ListingCard = ({ listing }: { listing: Listing }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{listing.title}</CardTitle>
            <Badge variant="outline" className="mt-2">{listing.category}</Badge>
          </div>
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {listing.report_count} reports
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2"><strong>Description:</strong></p>
            <p className="text-sm">{listing.description}</p>
          </div>

          {listing.price && (
            <p className="text-sm"><strong>Price:</strong> ${listing.price.toFixed(2)}</p>
          )}

          {listing.contact_email && (
            <p className="text-sm"><strong>Email:</strong> {listing.contact_email}</p>
          )}

          {listing.contact_phone && (
            <p className="text-sm"><strong>Phone:</strong> {listing.contact_phone}</p>
          )}

          {listing.website_url && (
            <p className="text-sm"><strong>Website:</strong> {listing.website_url}</p>
          )}

          {listing.moderation_result && (
            <div className="bg-muted p-3 rounded">
              <p className="text-sm font-semibold mb-1">AI Moderation Result:</p>
              <p className="text-xs">
                Approved: {listing.moderation_result.approved ? 'Yes' : 'No'}
              </p>
              {listing.moderation_result.reason && (
                <p className="text-xs">Reason: {listing.moderation_result.reason}</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => handleApprove(listing.id)} size="sm" className="flex-1">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button 
              onClick={() => handleReject(listing.id)} 
              size="sm" 
              variant="destructive" 
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (adminLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Marketplace Administration</h1>

        <Tabs defaultValue="flagged" className="w-full">
          <TabsList>
            <TabsTrigger value="flagged">
              Flagged ({flaggedListings.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingListings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flagged" className="mt-6">
            {flaggedListings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No flagged listings</p>
            ) : (
              flaggedListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {pendingListings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No pending listings</p>
            ) : (
              pendingListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
