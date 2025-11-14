import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Plus, Filter } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { BlogPostCard } from '@/components/BlogPostCard';
import { BlogPostForm } from '@/components/BlogPostForm';
import { SEO } from '@/components/SEO';
import { seoData } from '@/utils/seoData';
import { toast } from 'sonner';
import { AdSense } from '@/components/AdSense';
import { emergencyFundGuidePost } from '@/utils/blogPosts/emergencyFundGuide';

const Blog: React.FC = () => {
  const { posts, loading, createPost, updatePost, deletePost } = useBlogPosts();
  const { isAdmin } = useAdminStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Auto-publish emergency fund post if user is admin and post doesn't exist
  useEffect(() => {
    const autoPublishEmergencyPost = async () => {
      if (isAdmin && !loading) {
        const postExists = posts.some(post => post.slug === emergencyFundGuidePost.slug);
        if (!postExists) {
          try {
            await createPost(emergencyFundGuidePost);
            toast.success('Emergency fund blog post published automatically!');
          } catch (error) {
            console.error('Failed to auto-publish emergency fund post:', error);
          }
        }
      }
    };
    
    autoPublishEmergencyPost();
  }, [isAdmin, loading, posts, createPost]);

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Show all posts to admins, only published to others
      const isVisible = isAdmin ? true : post.published;
      
      return matchesSearch && isVisible;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.published_at || a.created_at).getTime() - new Date(b.published_at || b.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
      }
    });

  const handleSavePost = async (postData) => {
    try {
      setFormLoading(true);
      if (editingPost) {
        await updatePost(editingPost.id, postData);
        toast.success('Post updated successfully!');
      } else {
        await createPost(postData);
        toast.success('Post created successfully!');
      }
      setShowForm(false);
      setEditingPost(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save post');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPost(null);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <SEO
          title="Create Blog Post - House Budget Calculator"
          description="Write and publish your financial insights and tips"
          keywords="blog, financial writing, budgeting tips, money management"
        />
        <div className="max-w-7xl mx-auto py-8">
          <BlogPostForm
            post={editingPost}
            onSave={handleSavePost}
            onCancel={handleCancelForm}
            loading={formLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={seoData.blog.title}
        description={seoData.blog.description}
        keywords={seoData.blog.keywords}
        canonical={seoData.blog.canonical}
        ogImage={seoData.blog.ogImage}
        structuredData={seoData.blog.structuredData}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-4 space-y-8">
          {/* Enhanced Header Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background via-teal/5 to-sage/10 border border-teal/20 p-8 md:p-12 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal to-teal/60 rounded-2xl shadow-lg mb-6">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-teal bg-clip-text text-transparent mb-4">
              Financial Insights Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover expert tips, strategies, and insights to help you master your finances and achieve your financial goals.
            </p>
          </div>

          {/* Controls Section */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="title">By Title</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isAdmin && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Post
                </Button>
              )}
            </div>
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-gray-600">No Blog Posts Found</CardTitle>
                  <CardDescription>
                    {searchTerm 
                      ? "Try adjusting your search terms to find what you're looking for."
                      : "Check back soon for new financial insights and tips!"
                    }
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <div 
                  key={post.id} 
                  className="relative group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                >
                  <BlogPostCard 
                    post={post} 
                    isOwner={isAdmin}
                  />
                  {isAdmin && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          handleEditPost(post);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Blog Stats */}
          {filteredPosts.length > 0 && (
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">{filteredPosts.length}</div>
                  <div className="text-gray-600">Total Posts</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {Math.round(filteredPosts.reduce((acc, post) => acc + post.read_time, 0) / filteredPosts.length)}
                  </div>
                  <div className="text-gray-600">Avg. Read Time (min)</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {new Set(filteredPosts.flatMap(post => post.tags || [])).size}
                  </div>
                  <div className="text-gray-600">Unique Tags</div>
                </div>
              </div>
            </div>
          )}

          {/* AdSense Ad */}
          <div className="py-6 md:py-8">
            <AdSense adSlot="1234567890" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;