
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface CommentSectionProps {
  postId: string;
  currentUserName: string | null;
}

export function CommentSection({ postId, currentUserName }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function fetchComments() {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*")
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
    if (!newComment.trim()) return;
    setLoading(true);
    const author_name = currentUserName ?? "Anonymous";
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_name,
        content: newComment.trim(),
      })
      .select()
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
    <div className="bg-gray-50 rounded-xl p-4 mt-2">
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <Input
          placeholder="Write a comment…"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !newComment.trim()}>Post</Button>
      </form>
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {loading && comments.length === 0 && <div className="text-next12-gray text-sm">Loading comments…</div>}
        {!loading && comments.length === 0 && <div className="text-next12-gray text-sm">No comments yet.</div>}
        {comments.map(comment => (
          <div key={comment.id} className="p-2 bg-white rounded shadow-sm">
            <div className="text-xs text-next12-gray flex gap-2 items-center">
              <span className="font-semibold text-next12-dark">{comment.author_name}</span>
              <span className="opacity-60">•</span>
              <span>{new Date(comment.created_at).toLocaleString()}</span>
            </div>
            <div className="text-sm mt-1">{comment.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
