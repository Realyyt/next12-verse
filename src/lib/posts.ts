import { supabase } from '@/integrations/supabase/client';
import { ensureProfile } from './auth';
import { uploadFile, generateFilePath } from './storage';

interface CreatePostData {
  userId: string;
  content?: string;
  image?: File;
}

interface Post {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    is_verified: boolean;
  };
}

interface PostShare {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export async function createPost({ userId, content, image }: CreatePostData) {
  try {
    // Ensure user has a profile
    await ensureProfile(userId);

    let imageUrl = null;
    if (image) {
      const filePath = generateFilePath('posts', image);
      const { path, error: uploadError } = await uploadFile('posts', image, filePath);
      
      if (uploadError) {
        throw uploadError;
      }
      
      imageUrl = path;
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content: content || null,
        image_url: imageUrl
      })
      .select(`
        *,
        profiles!user_id (
          id,
          name,
          username,
          avatar,
          is_verified
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return data as Post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function getPosts(options?: {
  userId?: string;
  limit?: number;
  offset?: number;
  currentUserId?: string;
}) {
  try {
    let query = supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        image_url,
        likes_count,
        comments_count,
        created_at,
        updated_at,
        profiles!user_id (
          id,
          name,
          username,
          avatar,
          is_verified
        )
      `)
      .order('created_at', { ascending: false });

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data: posts, error } = await query;

    if (error) {
      throw error;
    }

    // If we have a current user, fetch their likes
    let userLikes: string[] = [];
    if (options?.currentUserId) {
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', options.currentUserId);
      
      if (likes) {
        userLikes = likes.map(like => like.post_id);
      }
    }

    // Transform the data to include liked status
    const transformedData = (posts as Post[]).map(post => ({
      ...post,
      liked: userLikes.includes(post.id)
    }));

    return transformedData;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function toggleLike(postId: string, userId: string) {
  try {
    // Check if the like already exists
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike the post
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
      return { liked: false };
    } else {
      // Like the post
      const { error } = await supabase
        .from('post_likes')
        .insert({
          post_id: postId,
          user_id: userId
        });

      if (error) throw error;
      return { liked: true };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

export async function deletePost(postId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

export async function sharePost(postId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('post_shares')
      .insert({
        post_id: postId,
        user_id: userId
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sharing post:', error);
    throw error;
  }
}

export async function getPostShares(postId: string) {
  try {
    const { data, error } = await supabase
      .from('post_shares')
      .select('*')
      .eq('post_id', postId);

    if (error) throw error;
    return data as PostShare[];
  } catch (error) {
    console.error('Error getting post shares:', error);
    throw error;
  }
} 