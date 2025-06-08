import { useState, useEffect } from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { createComment, getComments, toggleCommentLike, deleteComment } from '@/lib/comments';
import { sharePost } from '@/lib/posts';

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

interface CommentSectionProps {
  postId: string;
  onCommentAdded?: () => void;
}

export function CommentSection({ postId, onCommentAdded }: CommentSectionProps) {
  const { user } = useAuthUser();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to comment',
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const comment = await createComment(postId, user.id, newComment, replyingTo || undefined);
      setComments(prev => [...prev, comment]);
      setNewComment('');
      setReplyingTo(null);
      onCommentAdded?.();
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to like comments',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { liked } = await toggleCommentLike(commentId, user.id);
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                likes_count: liked
                  ? comment.likes_count + 1
                  : comment.likes_count - 1,
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async (commentId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to share',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sharePost(postId, user.id);
      toast({
        title: 'Success',
        description: 'Post shared successfully',
      });
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: 'Error',
        description: 'Failed to share post',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    try {
      await deleteComment(commentId, user.id);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
          className="min-h-[100px]"
        />
        <div className="flex justify-between items-center">
          {replyingTo && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
            >
              Cancel Reply
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {comment.profiles.avatar ? (
                  <img
                    src={comment.profiles.avatar}
                    alt={comment.profiles.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900">
                    {comment.profiles.name}
                  </p>
                  {comment.profiles.is_verified && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  @{comment.profiles.username}
                </p>
                <p className="mt-1 text-sm text-gray-900">{comment.content}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{comment.likes_count}</span>
                  </button>
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                  <button
                    onClick={() => handleShare(comment.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-green-500"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  {user?.id === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 