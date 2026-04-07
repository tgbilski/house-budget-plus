import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { usePageReady } from '@/hooks/usePageReady';

const Blog: React.FC = () => {
  const { setPageReady } = usePageReady();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, tags, published_at, read_time, featured_image_url')
        .eq('published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  React.useEffect(() => {
    if (!isLoading) {
      requestAnimationFrame(() => setPageReady());
    }
  }, [isLoading, setPageReady]);

  return (
    <div className="min-h-screen">
      <SEO
        title="Financial Tips & Budget Guides | House Budget Calculator"
        description="Free financial tips, budgeting strategies, and money-saving guides to help you master your household finances."
        keywords={['budgeting tips', 'financial advice', 'money saving', 'household budget guide']}
        canonical="https://house-budget-plus.lovable.app/blog"
      />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Financial Tips & Guides 💡
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Practical money advice from the House Budget Calculator team. No jargon, just real tips that work.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-5">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="border-[3px] border-stroke bg-card shadow-cartoon hover:shadow-cartoon-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group">
                  <CardContent className="p-5 flex gap-4">
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {post.published_at && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(post.published_at), 'MMM d, yyyy')}
                          </span>
                        )}
                        {post.read_time && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.read_time} min read
                          </span>
                        )}
                        {post.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-primary mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read more <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-foreground mb-2">Coming Soon!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We're working on awesome financial tips and guides. Check back soon, or start budgeting now!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 mt-4 text-primary font-medium hover:underline"
            >
              Start budgeting <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
