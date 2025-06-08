import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/hooks/useAuthUser";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    username: string;
    avatar: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthUser();

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function fetchComments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles!user_id (
          name,
          username,
          avatar
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: false });
    if (error) {
      setComments([]);
    } else {
      setComments(data ?? []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
      })
      .select(`
        *,
        profiles!user_id (
          name,
          username,
          avatar
        )
      `)
      .single();

    if (error) {
      toast({ title: "Failed to add comment", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setComments((prev) => [data, ...prev]);
    setNewComment("");
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          Post
        </Button>
      </form>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            {comment.profiles.avatar && (
              <img
                src={comment.profiles.avatar}
                alt={comment.profiles.name}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <div className="font-medium">{comment.profiles.name}</div>
              <div>{comment.content}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
