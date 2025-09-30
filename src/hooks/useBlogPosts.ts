import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useAdminStatus } from './useAdminStatus';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string;
  tags?: string[];
  featured_image_url?: string;
  read_time: number;
  user_id: string;
}

export const useBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { isAdmin } = useAdminStatus();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false });

      // Only show published posts to non-admin users
      if (!isAdmin) {
        query = query.eq('published', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: Partial<BlogPost>) => {
    if (!user || !isAdmin) throw new Error('Admin access required to create posts');

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          ...postData,
          user_id: user.id,
          slug: postData.slug || generateSlug(postData.title || ''),
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchPosts();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  const updatePost = async (id: string, postData: Partial<BlogPost>) => {
    if (!user || !isAdmin) throw new Error('Admin access required to update posts');

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchPosts();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update post');
    }
  };

  const deletePost = async (id: string) => {
    if (!user || !isAdmin) throw new Error('Admin access required to delete posts');

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchPosts();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug);

      // Only show published posts to non-admin users
      if (!isAdmin) {
        query = query.eq('published', true);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching post by slug:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user, isAdmin]);

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    getPostBySlug,
    refetch: fetchPosts,
  };
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};