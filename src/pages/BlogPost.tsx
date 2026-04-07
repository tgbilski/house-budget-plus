import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { usePageReady } from '@/hooks/usePageReady';
import InlineSignUpForm from '@/components/InlineSignUpForm';
import BlogAffiliateSection from '@/components/BlogAffiliateSection';
import { useAuth } from '@/hooks/useAuth';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { setPageReady } = usePageReady();
  const { user } = useAuth();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  React.useEffect(() => {
    if (!isLoading) {
      requestAnimationFrame(() => setPageReady());
    }
  }, [isLoading, setPageReady]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🔍</div>
        <h1 className="text-2xl font-bold text-foreground">Post Not Found</h1>
        <Link to="/blog" className="text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title={`${post.title} | House Budget Calculator Blog`}
        description={post.excerpt || post.title}
        keywords={post.tags?.join(', ') || ''}
        canonical={`https://house-budget-plus.lovable.app/blog/${post.slug}`}
        ogImage={post.featured_image_url || undefined}
      />

      <article className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>

        {post.featured_image_url && (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-48 sm:h-64 object-cover rounded-xl border-[3px] border-stroke shadow-cartoon mb-6"
          />
        )}

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">{post.title}</h1>

        <div className="flex items-center gap-3 flex-wrap mb-6">
          {post.published_at && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.published_at), 'MMMM d, yyyy')}
            </span>
          )}
          {post.read_time && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.read_time} min read
            </span>
          )}
          {post.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>

        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-foreground prose-headings:text-foreground prose-headings:font-bold prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-p:mb-4 prose-li:mb-1 prose-ul:my-4 prose-ol:my-4 prose-strong:text-foreground prose-a:text-primary prose-blockquote:border-primary/50 prose-blockquote:text-muted-foreground">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Affiliate products mid-article */}
        <BlogAffiliateSection />

        {/* CTA after article */}
        {!user && (
          <div className="mt-10 border-t-2 border-border pt-8">
            <div className="bg-card border-[3px] border-stroke rounded-xl p-5 shadow-cartoon text-center">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Ready to take control of your budget? 🎯
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sign up free and start tracking your money today.
              </p>
              <InlineSignUpForm />
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
