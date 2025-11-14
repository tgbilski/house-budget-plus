import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';
import { BlogPost } from '@/hooks/useBlogPosts';
import { format } from 'date-fns';

interface BlogPostCardProps {
  post: BlogPost;
  showAuthor?: boolean;
  isOwner?: boolean;
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ 
  post, 
  showAuthor = false, 
  isOwner = false 
}) => {
  const publishedDate = post.published_at || post.created_at;
  const imageUrl = post.featured_image_url || '/placeholder.svg';

  return (
    <Link to={`/blog/${post.slug}`} className="block h-full">
      <Card className="group relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer hover:scale-[1.02] h-full animate-fade-in bg-gradient-to-br from-white to-gray-50 overflow-hidden">
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        
        <CardHeader className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(publishedDate), 'MMM dd, yyyy')}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{post.read_time} min read</span>
            </div>
            {!post.published && isOwner && (
              <Badge variant="secondary">Draft</Badge>
            )}
          </div>
          
          <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </CardTitle>
          
          {post.excerpt && (
            <CardDescription className="text-gray-600 leading-relaxed line-clamp-3">
              {post.excerpt}
            </CardDescription>
          )}
        </CardHeader>

        {(post.tags?.length || showAuthor) && (
          <CardContent className="pt-0 pb-6">
            <div className="flex items-center justify-between">
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{post.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              {showAuthor && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Author</span>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};