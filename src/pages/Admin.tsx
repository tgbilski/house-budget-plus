import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, TrendingUp, Users, Home, CreditCard, MessageSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Review {
  id: string;
  message: string;
  category: string;
  page_source: string;
  user_id: string | null;
  created_at: string;
}

export default function Admin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    users: 0,
    subscribers: 0,
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
      loadMetrics();
      loadReviews();
    }
  }, [isAdmin]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load feedback",
        variant: "destructive",
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadMetrics = async () => {
    setMetricsLoading(true);
    try {
      const [usersRes, subscribersRes, householdsRes, profilesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('subscribed', true),
        supabase.from('households').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('created_at').order('created_at', { ascending: true }),
      ]);

      setMetrics({
        users: usersRes.count || 0,
        subscribers: subscribersRes.count || 0,
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
          .slice(-12);

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

  if (adminLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Admin Dashboard"
        description="Admin metrics and feedback"
        keywords="admin, dashboard"
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="mb-6 w-full grid grid-cols-2 lg:w-auto lg:inline-flex">
            <TabsTrigger value="metrics" className="text-xs sm:text-sm">Metrics</TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs sm:text-sm">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  User Feedback ({reviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No feedback submitted yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Page</TableHead>
                          <TableHead className="min-w-[300px]">Message</TableHead>
                          <TableHead>User</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(review.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {review.category === 'suggestion' && '💡 '}
                                {review.category === 'bug' && '🐛 '}
                                {review.category === 'praise' && '🎉 '}
                                {review.category === 'question' && '❓ '}
                                {review.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{review.page_source}</TableCell>
                            <TableCell className="max-w-md">
                              <p className="whitespace-pre-wrap">{review.message}</p>
                            </TableCell>
                            <TableCell>
                              {review.user_id ? (
                                <Badge variant="secondary">Logged in</Badge>
                              ) : (
                                <Badge variant="outline">Guest</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            {metricsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
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
                              return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                            }}
                          />
                          <YAxis className="text-xs" />
                          <Tooltip 
                            labelFormatter={(value) => {
                              const [year, month] = value.split('-');
                              return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
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
