import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { PostCard } from "@/components/post-card";

import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faCalendar, faBell, faUser } from '@fortawesome/free-solid-svg-icons';

const Index = () => {
  const { user } = useAuthUser();
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Example event images (replace with your own URLs or storage)
  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: "1",
      title: "Community BBQ",
      description: "Neighborhood cookout",
      attendees: 10,
      date: "2023-10-15",
      location: "Rooftop",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "3",
      title: "Movie Night",
      description: "Outdoor screening",
      attendees: 15,
      date: "2023-10-25",
      location: "Courtyard",
      image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80"
    }
  ]);

  const [suggestedUsers, setSuggestedUsers] = useState([
    { id: "1", name: "User 1", username: "user1" },
    { id: "2", name: "User 2", username: "user2" }
  ]);

  const [featuredPosts, setFeaturedPosts] = useState([
    {
      id: "1",
      title: "Featured Post 1",
      content: "Content 1",
      author: { id: "1", name: "Author 1", username: "author1" },
      timestamp: "2023-10-15",
      likes: 10,
      comments: 5
    },
    {
      id: "2",
      title: "Featured Post 2",
      content: "Content 2",
      author: { id: "2", name: "Author 2", username: "author2" },
      timestamp: "2023-10-20",
      likes: 20,
      comments: 15
    }
  ]);

  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoadingFeed(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      setPosts(error ? [] : data ?? []);
      setLoadingFeed(false);
    }
    fetchPosts();
  }, []);

  const handleImageSelect = () => fileInputRef.current?.click();

  const handleUpload = async () => {
    if (!imageFile) return null;
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user?.email ?? "user"}/${fileName}`;

    const { error } = await supabase.storage
      .from("post-images")
      .upload(filePath, imageFile);

    if (error) {
      toast({ title: "Photo upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const imageUrl = supabase.storage.from("post-images").getPublicUrl(filePath).data.publicUrl;
    return imageUrl;
  };

  const handleSubmit = async (e) => {
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
    let imageUrl = null;

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

  // Horizontal scrollable events component
  const HorizontalEvents = () => (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <h2 className="text-lg font-bold text-next12-dark mb-4">Upcoming Events</h2>
      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
        {upcomingEvents.map(event => (
          <div key={event.id} className="flex-shrink-0 w-64">
            <EventCard {...event} image={event.image} />
          </div>
        ))}
      </div>
    </div>
  );

  // Sidebar: events only on desktop, not on mobile
  const Sidebar = () => (
    <div
      className={`fixed top-0 left-0 z-40 h-full w-72 bg-white shadow-lg transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:static md:translate-x-0 md:block overflow-y-auto`}
    >
      <div className="md:hidden flex justify-between items-center p-4 border-b">
        <span className="font-bold text-next12-dark"></span>
        <button onClick={() => setSidebarOpen(false)}><CloseIcon /></button>
      </div>
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-bold text-next12-dark mb-4">Welcome to Next12</h2>
          <p className="text-next12-gray mb-4">
            Your community hub for next12.org residents. Connect with neighbors, join events, and stay updated.
          </p>
        </div>
        {/* Only show events in sidebar on desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-bold text-next12-dark mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} {...event} image={event.image} />
            ))}
            <Button variant="outline" className="w-full">View All Events</Button>
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <a href="/community" className="flex items-center px-4 py-2 text-next12-dark hover:text-next12-primary hover:bg-next12-light rounded">
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            Community
          </a>
          <a href="/events" className="flex items-center px-4 py-2 text-next12-dark hover:text-next12-primary hover:bg-next12-light rounded">
            <FontAwesomeIcon icon={faCalendar} className="mr-2" />
            Events
          </a>
          <a href="/notifications" className="flex items-center px-4 py-2 text-next12-dark hover:text-next12-primary hover:bg-next12-light rounded">
            <FontAwesomeIcon icon={faBell} className="mr-2" />
            Notifications
          </a>
          <a href="/profile" className="flex items-center px-4 py-2 text-next12-dark hover:text-next12-primary hover:bg-next12-light rounded">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Profile
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded bg-white shadow"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-6 py-6">
        {/* Sidebar: visible on desktop, toggled on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black bg-opacity-40 md:hidden" onClick={() => setSidebarOpen(false)}>
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <div className="md:col-span-2 w-full">
          {/* Horizontal scrollable events for all screens */}
          <HorizontalEvents />

          {/* Post creation form */}
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

          {/* Feed */}
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
                  canComment={true}
                  currentUserName={user?.email ?? null}
                />
              ))
            ) : (
              featuredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  {...post}
                  canComment={false}
                  currentUserName={user?.email ?? null}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;

/* Add this to your global CSS for smooth horizontal scroll and hidden scrollbar: */
