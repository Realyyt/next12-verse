import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { PostCard } from "@/components/post-card";
import { UserCard } from "@/components/user-card";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, User, Image as ImageIcon, MapPin as MapPinIcon, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
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
        return;
      }
    }
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      toast({
        title: "Authentication error",
        description: "Could not retrieve user information",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: authData.user.id,
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
    setPosts((prev) => [data, ...prev]);
    setLoading(false);
  };

  const [posts, setPosts] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoadingFeed(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        setPosts([]);
      } else {
        setPosts(data ?? []);
      }
      setLoadingFeed(false);
    }
    fetchPosts();
  }, []);

  const featuredPosts = [
    {
      id: "1",
      author: {
        id: "user1",
        name: "Jane Cooper",
        username: "janecooper",
        isVerified: true,
      },
      content: "Just moved into Next12! The architecture is amazing and everyone has been so welcoming. Looking forward to the community events this weekend.",
      timestamp: "2h ago",
      likes: 24,
      comments: 5,
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: "2",
      author: {
        id: "user2",
        name: "Wade Warren",
        username: "wadewarren",
      },
      content: "Reminder: The community garden planning session is tomorrow at 10am. We'll be discussing the spring planting schedule. Bring your ideas!",
      timestamp: "4h ago",
      likes: 18,
      comments: 12,
    },
    {
      id: "3",
      author: {
        id: "user3",
        name: "Esther Howard",
        username: "estherhoward",
        isVerified: true,
      },
      content: "The new coffee shop on level 3 is amazing! They have the best pastries and the barista makes incredible latte art.",
      timestamp: "6h ago",
      likes: 32,
      comments: 8,
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
  ];

  const suggestedUsers = [
    {
      id: "user4",
      name: "Kristin Watson",
      username: "kristinwatson",
      location: "Level 12, Apt 1204",
      bio: "Chef, food enthusiast, and community garden volunteer",
      isVerified: false,
      connectionStatus: "none" as const,
    },
    {
      id: "user5",
      name: "Cameron Williamson",
      username: "cameronw",
      location: "Level 8, Apt 824",
      bio: "Tech consultant and drone photography hobbyist",
      isVerified: true,
      connectionStatus: "none" as const,
    },
  ];

  const upcomingEvents = [
    {
      id: "event1",
      title: "Next12 Community Meetup",
      description: "Monthly gathering to discuss community initiatives and meet your neighbors.",
      date: "Tomorrow at 6:00 PM",
      location: "Main Lobby",
      attendees: 42,
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      variant: "highlight" as const,
    },
    {
      id: "event2",
      title: "Rooftop Yoga Session",
      description: "Start your day with a relaxing yoga session and amazing city views.",
      date: "Saturday at 8:30 AM",
      location: "Rooftop Garden",
      attendees: 18,
    },
  ];

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
        <div className="hidden md:block">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-bold text-next12-dark mb-4">Welcome to Next12</h2>
              <p className="text-next12-gray mb-4">Your community hub for next12.org residents. Connect with neighbors, join events, and stay updated.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-bold text-next12-dark mb-4">Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} {...event} className="shadow-none" />
                ))}
                <Button variant="outline" className="w-full">View All Events</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6 space-y-4">
            <div className="flex space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-next12-gray" />
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Event Name (e.g. Next12 Community BBQ)"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                  className="bg-gray-50"
                  autoFocus
                />
                <Input
                  placeholder="Location (e.g. Rooftop, Level 12)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-gray-50"
                />
                <Textarea
                  rows={2}
                  placeholder="What's happening at your event?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-gray-50"
                />
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleImageSelect}>
                    {imageFile ? "Change Photo" : "Upload Photo"}
                  </Button>
                  {imageFile && <span className="text-xs truncate">{imageFile.name}</span>}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                {imageFile && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="rounded-lg w-auto max-h-40"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
          
          <div className="space-y-4">
            {loadingFeed ? (
              <div className="text-center text-next12-gray py-12">Loading posts…</div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  author={{
                    id: post.user_id,
                    name: post.event_name,
                    username: post.user_id?.slice(0, 8) || "user",
                  }}
                  content={post.content || ""}
                  timestamp={post.created_at ? new Date(post.created_at).toLocaleString() : ""}
                  likes={0}
                  comments={0}
                  image={post.image_url}
                />
              ))
            ) : (
              featuredPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
