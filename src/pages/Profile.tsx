import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  UserIcon, 
  MapPinIcon, 
  CalendarIcon, 
  Edit2Icon, 
  UsersIcon,
  ImageIcon,
  PlusIcon,
  User,
  Camera
} from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreatePostModal } from "@/components/CreatePostModal";
import { Textarea } from "@/components/ui/textarea";
import classNames from "classnames";

interface Profile {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatar: string | null;
  cover_photo: string | null;
  location: string | null;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  is_banned: boolean;
  admin_notes: string | null;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url?: string;
}

interface Post {
  id: string;
  content: string | null;
  image_url: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
    is_verified: boolean;
  };
}

function normalizeProfile(data: any): Profile {
  return {
    id: data.id,
    name: data.name,
    username: data.username,
    bio: data.bio ?? null,
    avatar: data.avatar ?? null,
    cover_photo: data.cover_photo ?? null,
    location: data.location ?? null,
    is_verified: data.is_verified ?? false,
    is_admin: data.is_admin ?? false,
    created_at: data.created_at ?? "",
    updated_at: data.updated_at ?? "",
    is_banned: data.is_banned ?? false,
    admin_notes: data.admin_notes ?? null,
  };
}

const Profile = () => {
  const { user } = useAuthUser();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setProfile(normalizeProfile(data));
        setEditForm({
          name: data.name,
          username: data.username,
          bio: data.bio || "",
          location: data.location || "",
        });

        // Fetch user's posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData as Post[] || []);

        // Fetch user's approved events
        const { data: eventsData, error: eventsError } = await supabase
          .from('event_registrations')
          .select(`
            event:events (
              id,
              title,
              description,
              date,
              location,
              image_url
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'confirmed');

        if (eventsError) throw eventsError;
        const mappedEvents = (eventsData || []).map((item: any) => ({
          id: item.event.id,
          title: item.event.title,
          description: item.event.description,
          date: item.event.date,
          location: item.event.location,
          image_url: item.event.image_url
        }));
        setEvents(mappedEvents);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          username: editForm.username,
          bio: editForm.bio,
          location: editForm.location,
          cover_photo: profile?.cover_photo,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) throw error;

      setProfile(normalizeProfile(data));
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleAvatarSelect = () => avatarInputRef.current?.click();
  const handleCoverSelect = () => coverInputRef.current?.click();

  const handleAvatarUpload = async (file?: File) => {
    const avatarFileToUse = file || avatarFile;
    if (!avatarFileToUse || !user) {
      console.error('No file or user found:', { hasFile: !!avatarFileToUse, hasUser: !!user });
      return;
    }

    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Authentication error:', sessionError);
      toast({
        title: "Error",
        description: "You must be logged in to upload images",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (avatarFileToUse.size > 5 * 1024 * 1024) {
      console.error('File too large:', { size: avatarFileToUse.size, maxSize: 5 * 1024 * 1024 });
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!avatarFileToUse.type.startsWith('image/')) {
      console.error('Invalid file type:', { type: avatarFileToUse.type });
      toast({
        title: "Error",
        description: "File must be an image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      console.log('Starting avatar upload process...', { 
        file: avatarFileToUse.name, 
        size: avatarFileToUse.size,
        type: avatarFileToUse.type,
        userId: user.id,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasSession: !!session
      });

      const fileExt = avatarFileToUse.name.split(".").pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      console.log('Generated file path:', fileName);

      // Upload the file
      console.log('Attempting file upload...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFileToUse, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload failed:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);
      
      console.log('Generated public URL:', publicUrl);

      // Update the profile
      console.log('Updating profile with new avatar URL...');
      const { data: profileData, error: updateError } = await supabase
        .from("profiles")
        .update({ 
          avatar: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update failed:', updateError);
        throw new Error(`Profile update failed: ${updateError.message}`);
      }
      console.log('Profile updated successfully:', profileData);

      // Force a profile refresh
      console.log('Refreshing profile data...');
      const { data: refreshedProfile, error: refreshError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (refreshError) {
        console.error('Profile refresh failed:', refreshError);
        throw new Error(`Profile refresh failed: ${refreshError.message}`);
      }

      console.log('Profile refresh successful:', refreshedProfile);
      setProfile(normalizeProfile(refreshedProfile));
      setAvatarFile(null);
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error("Avatar upload process failed:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
      console.error('No file or user found:', { hasFile: !!file, hasUser: !!user });
      return;
    }

    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Authentication error:', sessionError);
      toast({
        title: "Error",
        description: "You must be logged in to upload images",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', { size: file.size, maxSize: 5 * 1024 * 1024 });
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', { type: file.type });
      toast({
        title: "Error",
        description: "File must be an image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      console.log('Starting cover photo upload process...', {
        file: file.name,
        size: file.size,
        type: file.type,
        userId: user.id,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasSession: !!session
      });

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      console.log('Generated file path:', fileName);

      // Upload the file
      console.log('Attempting file upload...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cover_photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload failed:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      console.log('Upload successful:', uploadData);

      // Get the public URL
      console.log('Getting public URL...');
      const { data: { publicUrl } } = supabase.storage
        .from('cover_photos')
        .getPublicUrl(fileName);
      
      console.log('Generated public URL:', publicUrl);

      // Update the profile
      console.log('Updating profile with new cover photo URL...');
      const { data: profileData, error: updateError } = await supabase
        .from('profiles')
        .update({
          cover_photo: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Profile update failed:', updateError);
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      // Force a profile refresh
      console.log('Refreshing profile data...');
      const { data: refreshedProfile, error: refreshError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (refreshError) {
        console.error('Profile refresh failed:', refreshError);
        throw new Error(`Profile refresh failed: ${refreshError.message}`);
      }

      console.log('Profile refresh successful:', refreshedProfile);
      setProfile(normalizeProfile(refreshedProfile));
      setCoverFile(null);
      toast({
        title: "Success",
        description: "Cover photo updated successfully",
      });
    } catch (error) {
      console.error('Cover photo upload process failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload cover photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = () => fileInputRef.current?.click();

  const handleUpload = async () => {
    if (!imageFile) return null;
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${user?.email ?? "user"}/${crypto.randomUUID()}.${fileExt}`;
    const { error } = await supabase.storage.from("posts").upload(fileName, imageFile);
    if (error) {
      toast({ title: "Photo upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    return supabase.storage.from("posts").getPublicUrl(fileName).data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({ title: "Post content is required", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "You must be logged in", variant: "destructive" });
      return;
    }
    setPosting(true);
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await handleUpload();
      if (!imageUrl) {
        setPosting(false);
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          content: content.trim(),
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
        console.error('Post creation error:', error);
        toast({ 
          title: "Failed to create post", 
          description: error.message, 
          variant: "destructive" 
        });
        return;
      }

      toast({ title: "Post created!" });
      setContent("");
      setImageFile(null);
      setPosts(prev => [data as Post, ...prev]);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({ 
        title: "Error", 
        description: "An unexpected error occurred", 
        variant: "destructive" 
      });
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <Layout showHeader={false}>
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout showHeader={false}>
        <div className="flex items-center justify-center h-screen">
          Profile not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false}>
      {/* Back to Home Button */}
      <div className="absolute top-4 left-4 z-30">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full bg-white/80 hover:bg-white transition-colors"
          onClick={() => window.location.href = '/'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 mr-2"
          >
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Home
        </Button>
      </div>

      {/* Cover Photo Section */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-next12-orange to-next12-yellow rounded-b-3xl shadow-lg">
        {profile?.cover_photo ? (
          <img src={profile.cover_photo} alt="Cover" className="object-cover w-full h-full rounded-b-3xl" />
        ) : (
          <div className="w-full h-full rounded-b-3xl bg-gradient-to-r from-next12-orange to-next12-yellow" />
        )}
        <button
          onClick={handleCoverSelect}
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
          title="Change cover photo"
        >
          <Camera className="h-5 w-5 text-next12-dark" />
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverUpload}
        />
        
        {/* Avatar overlays the cover */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2 z-20">
          <div className="relative h-32 w-32 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white overflow-hidden">
            {uploading ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
              </div>
            ) : (
              <>
                {profile?.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.name} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error('Error loading avatar image');
                      e.currentTarget.src = ''; // Clear the src to show fallback
                    }}
                  />
                ) : (
                  <UserIcon className="h-20 w-20 text-next12-gray" />
                )}
                <button
                  onClick={handleAvatarSelect}
                  className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
                  title="Change profile picture"
                  disabled={uploading}
                >
                  <Camera className="h-8 w-8 text-white" />
                </button>
              </>
            )}
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                setAvatarFile(file);
                handleAvatarUpload(file);
              }
            }}
          />
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl mx-auto mt-20 mb-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full">Edit Profile</Button>
            {/* <Button variant="outline" size="sm" className="rounded-full">Message</Button> */}
          </div>
          <h1 className="text-3xl font-bold text-next12-dark mb-1">{profile.name}</h1>
          <p className="text-next12-gray text-lg mb-2">@{profile.username}</p>
          {profile.bio && <p className="text-center text-next12-dark mb-3 max-w-xl">{profile.bio}</p>}
          <div className="flex flex-wrap justify-center gap-4 text-next12-gray text-sm mb-2">
            {profile.location && (
              <span className="flex items-center gap-1"><MapPinIcon className="h-4 w-4" />{profile.location}</span>
            )}
            <span className="flex items-center gap-1"><CalendarIcon className="h-4 w-4" />Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-2xl mx-auto px-4">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="flex bg-gray-50 rounded-full p-1 mb-6 shadow-sm">
            <TabsTrigger value="posts" className="flex-1 rounded-full py-2 px-4 text-lg data-[state=active]:bg-next12-orange data-[state=active]:text-white transition">Posts</TabsTrigger>
            <TabsTrigger value="events" className="flex-1 rounded-full py-2 px-4 text-lg data-[state=active]:bg-next12-orange data-[state=active]:text-white transition">Events</TabsTrigger>
            <TabsTrigger value="connections" className="flex-1 rounded-full py-2 px-4 text-lg data-[state=active]:bg-next12-orange data-[state=active]:text-white transition">Connections</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-0">
            <div className="space-y-4">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6 space-y-4">
                <div className="flex space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover rounded-full" />
                    ) : (
                      <User className="h-5 w-5 text-next12-gray" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      rows={3}
                      placeholder="What's on your mind?"
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="bg-gray-50"
                      required
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
                        onChange={e => setImageFile(e.target.files?.[0] ?? null)}
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
                  <Button type="submit" disabled={posting}>
                    {posting ? "Posting..." : "Post"}
                  </Button>
                </div>
              </form>
              {posts.length > 0 ? (
                posts.map(post => (
                  <div key={post.id} className="rounded-xl bg-white shadow hover:shadow-lg transition p-4 mb-2 border border-gray-50">
                    <PostCard
                      id={post.id}
                      author={{
                        id: profile.id,
                        name: profile.name,
                        username: profile.username,
                        avatar: profile.avatar,
                      }}
                      content={post.content}
                      timestamp={new Date(post.created_at).toLocaleString()}
                      likes={post.likes_count || 0}
                      comments={post.comments_count || 0}
                      image={post.image_url}
                    />
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="h-8 w-8 text-next12-gray" />
                  </div>
                  <h3 className="text-lg font-semibold text-next12-dark mb-2">No Posts Yet</h3>
                  <p className="text-next12-gray mb-4">Share your first post with the community!</p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="events" className="mt-0">
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map(event => (
                  <div key={event.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden">
                    {event.image_url && (
                      <div className="h-40 w-full">
                        <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-xl text-next12-dark mb-1">{event.title}</h3>
                      <p className="text-next12-gray text-sm mb-2 line-clamp-2">{event.description}</p>
                      <div className="flex items-center text-next12-gray text-sm mb-1">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-next12-gray text-sm mb-2">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>{event.location}</span>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full mt-2">View Event</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="h-8 w-8 text-next12-gray" />
                </div>
                <h3 className="text-lg font-semibold text-next12-dark mb-2">No Events Yet</h3>
                <p className="text-next12-gray mb-4">You haven't joined any events. Explore upcoming events and get involved in your community.</p>
                <Button variant="outline" className="rounded-full">Browse Events</Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="connections" className="mt-0">
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UsersIcon className="h-8 w-8 text-next12-gray" />
              </div>
              <h3 className="text-lg font-semibold text-next12-dark mb-2">Connect with Neighbors</h3>
              <p className="text-next12-gray mb-4">Build your network with other Next12 residents.</p>
              <Button variant="outline" className="rounded-full">Find Connections</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreatePostModal
        open={isCreatingPost}
        onOpenChange={setIsCreatingPost}
        onPostCreated={(post) => {
          setPosts(prev => [post, ...prev]);
        }}
      />
    </Layout>
  );
};

export default Profile;
