import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  profiles: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    is_verified: boolean;
  };
}

export async function createComment(postId: string, userId: string, content: string, parentId?: string) {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        parent_id: parentId || null,
        content: content.trim()
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

    if (error) throw error;
    return data as Comment;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

export async function getComments(postId: string, parentId?: string) {
  try {
    const query = supabase
      .from('comments')
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
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (parentId) {
      query.eq('parent_id', parentId);
    } else {
      query.is('parent_id', null);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Comment[];
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

export async function toggleCommentLike(commentId: string, userId: string) {
  try {
    // Check if the like already exists
    const { data: existingLike } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike the comment
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
      return { liked: false };
    } else {
      // Like the comment
      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId
        });

      if (error) throw error;
      return { liked: true };
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
}

export async function deleteComment(commentId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
} 