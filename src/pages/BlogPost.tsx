import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { SEO } from '@/components/SEO';
import ReactMarkdown from 'react-markdown';
import { AdSense } from '@/components/AdSense';
import { getBlogImageUrl } from '@/utils/blogImages';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getPostBySlug } = useBlogPosts();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      setLoading(true);
      const fetchedPost = await getPostBySlug(slug);
      setPost(fetchedPost);
      setLoading(false);
    };

    fetchPost();
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold text-gray-900">Blog Post Not Found</h1>
              <p className="text-gray-600 mt-2">The blog post you're looking for doesn't exist.</p>
              <Link to="/blog">
                <Button className="mt-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const imageUrl = getBlogImageUrl(post.slug, post.featured_image_url);

  return (
    <>
      <SEO
        title={`${post.title} - House Budget Calculator`}
        description={post.excerpt || post.content.substring(0, 160)}
        keywords={post.tags?.join(', ') || 'house budget, budgeting, financial planning'}
        canonical={`https://www.housebudgetcalculator.com/blog/${slug}`}
        ogImage={imageUrl}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt || post.content.substring(0, 160),
          "image": imageUrl,
          "datePublished": post.published_at || post.created_at,
          "dateModified": post.updated_at || post.created_at,
          "author": {
            "@type": "Organization",
            "name": "House Budget Calculator"
          },
          "publisher": {
            "@type": "Organization",
            "name": "House Budget Calculator",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.housebudgetcalculator.com/lovable-uploads/ed809955-ef71-4d81-b072-945082f4380a.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.housebudgetcalculator.com/blog/${slug}`
          },
          "keywords": post.tags?.join(', ') || 'budgeting, financial planning',
          "wordCount": post.content.split(' ').length,
          "timeRequired": `PT${post.read_time}M`
        }}
      />
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto p-4 py-8">
          <Link to="/blog">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          <Card className="overflow-hidden">
            <div className="w-full h-64 md:h-96 overflow-hidden">
              <img 
                src={imageUrl} 
                alt={`Featured image for ${post.title} - Financial advice article`}
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                width={800}
                height={400}
              />
            </div>
            
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {post.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.read_time} min read</span>
                </div>
              </div>

              {post.excerpt && (
                <p className="text-lg text-gray-700 italic border-l-4 border-primary pl-4">
                  {post.excerpt}
                </p>
              )}
            </CardHeader>

            <CardContent className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="font-bold text-2xl mt-8 mb-4 text-gray-900">{children}</h2>
                  ),
                  p: ({ children }) => (
                    <p className="mb-6 text-gray-700 leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900">{children}</strong>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </CardContent>
          </Card>

          {/* AdSense Ad */}
          <div className="mt-8">
            <AdSense adSlot="1234567890" />
          </div>

          <div className="mt-8 text-center">
            <Link to="/blog">
              <Button size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Read More Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPost;
