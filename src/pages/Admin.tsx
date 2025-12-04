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
import { useAuth } from "@/hooks/useAuth";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Shield, PenSquare, TrendingUp, Users, Home, Store, CreditCard } from "lucide-react";
import { BlogPostForm } from "@/components/BlogPostForm";
import { BlogPost } from "@/hooks/useBlogPosts";
import { SEO } from "@/components/SEO";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { giftListChristmasShoppingPost } from "@/utils/blogPosts/giftListChristmasShopping";

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
  image_urls: string[] | null;
  status: string;
  report_count: number;
  moderation_result: any;
  created_at: string;
}

export default function Admin() {
  const [flaggedListings, setFlaggedListings] = useState<Listing[]>([]);
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishingGiftPost, setPublishingGiftPost] = useState(false);
  const [metrics, setMetrics] = useState({
    users: 0,
    subscribers: 0,
    listings: 0,
    households: 0,
  });
  const [userGrowth, setUserGrowth] = useState<{ date: string; users: number }[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdminStatus();
  const { user } = useAuth();

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadListings();
      loadMetrics();
    }
  }, [isAdmin]);

  const loadMetrics = async () => {
    setMetricsLoading(true);
    try {
      const [usersRes, subscribersRes, listingsRes, householdsRes, profilesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('subscribed', true),
        supabase.from('marketplace_listings').select('id', { count: 'exact', head: true }),
        supabase.from('households').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('created_at').order('created_at', { ascending: true })
      ]);

      setMetrics({
        users: usersRes.count || 0,
        subscribers: subscribersRes.count || 0,
        listings: listingsRes.count || 0,
        households: householdsRes.count || 0,
      });

      // Process user growth data by month
      if (profilesRes.data) {
        const growthMap = new Map<string, number>();
        let cumulativeUsers = 0;

        profilesRes.data.forEach(profile => {
          const date = new Date(profile.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          cumulativeUsers++;
          growthMap.set(monthKey, cumulativeUsers);
        });

        const growthData = Array.from(growthMap.entries())
          .map(([date, users]) => ({ date, users }))
          .slice(-12); // Last 12 months

        setUserGrowth(growthData);
      }
    } catch (error) {
      console.error("Error loading metrics:", error);
      toast({
        title: "Error",
        description: "Failed to load metrics",
        variant: "destructive",
      });
    } finally {
      setMetricsLoading(false);
    }
  };

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
          rejection_reason: 'Flagged by multiple users or rejected by admin'
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

  const handleSaveBlogPost = async (postData: Partial<BlogPost>) => {
    setSaving(true);
    try {
      const slug = postData.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: postData.title,
          content: postData.content,
          excerpt: postData.excerpt,
          published: postData.published,
          featured_image_url: postData.featured_image_url,
          read_time: postData.read_time,
          tags: postData.tags,
          slug: slug,
          user_id: user!.id,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Blog post created successfully.",
      });
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: "Error",
        description: "Failed to create blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishGiftListPost = async () => {
    setPublishingGiftPost(true);
    try {
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: giftListChristmasShoppingPost.title,
          content: giftListChristmasShoppingPost.content,
          excerpt: giftListChristmasShoppingPost.excerpt,
          published: giftListChristmasShoppingPost.published,
          featured_image_url: giftListChristmasShoppingPost.featured_image_url,
          read_time: giftListChristmasShoppingPost.read_time,
          tags: giftListChristmasShoppingPost.tags,
          slug: giftListChristmasShoppingPost.slug,
          user_id: user!.id,
          published_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Christmas Gift List blog post published!",
      });
      navigate('/blog/christmas-gift-list-organizer-2025');
    } catch (error: any) {
      console.error('Error publishing blog post:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to publish blog post.",
        variant: "destructive",
      });
    } finally {
      setPublishingGiftPost(false);
    }
  };

  const ListingCard = ({ listing }: { listing: Listing }) => {
    const thumbnailImage = listing.image_urls && listing.image_urls.length > 0 
      ? listing.image_urls[0] 
      : null;

    return (
      <Card className="mb-4">
        {thumbnailImage && (
          <div className="w-full h-48 overflow-hidden rounded-t-lg">
            <img 
              src={thumbnailImage} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{listing.title}</CardTitle>
              <Badge variant="outline" className="mt-2">{listing.category}</Badge>
            </div>
            {listing.status === 'flagged' && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {listing.report_count} reports
              </Badge>
            )}
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
              <p className="text-sm">
                <strong>Website:</strong>{" "}
                <a 
                  href={listing.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {listing.website_url}
                </a>
              </p>
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
  };

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
      <SEO
        title="Admin Dashboard"
        description="Manage blog posts and marketplace listings"
        keywords="admin, blog management, marketplace management"
      />
      <main className="flex-1 container mx-auto px-4 py-8">

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="mb-6 w-full grid grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="metrics" className="text-xs sm:text-sm">Metrics</TabsTrigger>
            <TabsTrigger value="listings" className="text-xs sm:text-sm">Listings</TabsTrigger>
            <TabsTrigger value="blog" className="text-xs sm:text-sm">Blog</TabsTrigger>
          </TabsList>

          <TabsContent value="blog" className="space-y-6">
            {/* Quick Publish Section */}
            <Card className="border-teal/30 bg-teal/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎄 Quick Publish: Christmas Gift List Article
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <strong>{giftListChristmasShoppingPost.title}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  {giftListChristmasShoppingPost.excerpt}
                </p>
                <div className="flex flex-wrap gap-2">
                  {giftListChristmasShoppingPost.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <Button 
                  onClick={handlePublishGiftListPost} 
                  disabled={publishingGiftPost}
                  className="bg-teal hover:bg-teal/90"
                >
                  {publishingGiftPost ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Publish Christmas Gift List Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center gap-3 p-4">
                <PenSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Blog Admin Access</p>
                  <p className="text-sm text-muted-foreground">
                    Create and manage blog posts that will be visible to all users on the blog page.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create New Blog Post</CardTitle>
              </CardHeader>
              <CardContent>
                <BlogPostForm 
                  onSave={handleSaveBlogPost} 
                  onCancel={() => navigate('/blog')} 
                  loading={saving} 
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold text-foreground">View Published Posts</p>
                  <p className="text-sm text-muted-foreground">
                    See how your posts appear to users
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/blog')}>
                  Go to Blog
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="w-full grid grid-cols-2 lg:w-auto lg:inline-flex">
                <TabsTrigger value="pending" className="text-xs sm:text-sm">
                  Pending ({pendingListings.length})
                </TabsTrigger>
                <TabsTrigger value="flagged" className="text-xs sm:text-sm">
                  Flagged ({flaggedListings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                {pendingListings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending listings</p>
                ) : (
                  pendingListings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="flagged" className="mt-6">
                {flaggedListings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No flagged listings</p>
                ) : (
                  flaggedListings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            {metricsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.users}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.subscribers}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                      <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.listings}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Households</CardTitle>
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics.households}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      User Growth (Last 12 Months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 sm:p-6">
                    {userGrowth.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250} className="sm:h-[350px]">
                        <LineChart data={userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="date" 
                            className="text-xs"
                            tickFormatter={(value) => {
                              const [year, month] = value.split('-');
                              return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                            }}
                          />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            labelFormatter={(value) => {
                              const [year, month] = value.split('-');
                              return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                            }}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="users" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--primary))' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex justify-center items-center h-64 text-muted-foreground">
                        No user growth data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
