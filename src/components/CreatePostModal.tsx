
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/hooks/useAuthUser";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated?: (post: any) => void;
}

export function CreatePostModal({ open, onOpenChange, onPostCreated }: CreatePostModalProps) {
  const { user } = useAuthUser();
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user?.email ?? "user"}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("post-images")
      .upload(filePath, imageFile);

    if (error) {
      toast({ title: "Photo upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const imageUrl = supabase.storage.from("post-images").getPublicUrl(filePath).data.publicUrl;
    return imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName) {
      toast({ title: "Event name is required", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "You must be logged in", variant: "destructive" });
      return;
    }
    setLoading(true);
    let imageUrl: string | null = null;

    if (imageFile) {
      imageUrl = await handleUpload();
      if (!imageUrl) {
        setLoading(false);
        return; // error already handled in upload
      }
    }

    // Get the current user's authentication information
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      toast({ title: "Authentication error", description: "Could not retrieve user information", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: authData.user.id, // Use the actual UUID from auth
        event_name: eventName,
        location,
        content,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Failed to create post", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Post created!" });
    setEventName("");
    setLocation("");
    setContent("");
    setImageFile(null);
    onPostCreated?.(data);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-medium text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Event Name
            </label>
            <Input
              placeholder="e.g. Next12 Community BBQ"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="font-medium text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Location
            </label>
            <Input
              placeholder="e.g. Rooftop, Level 12"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium text-sm flex items-center gap-2">
              <Image className="h-4 w-4" /> Photo
            </label>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleImageSelect}>
                {imageFile ? "Change Photo" : "Upload Photo"}
              </Button>
              {imageFile && <span className="text-xs">{imageFile.name}</span>}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div>
            <label className="font-medium text-sm">Post Content</label>
            <Textarea
              rows={3}
              placeholder="What's happening at your event?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
