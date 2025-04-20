
import { Layout } from "@/components/layout";
import { PostCard } from "@/components/post-card";
import { UserCard } from "@/components/user-card";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, User, Image as ImageIcon, MapPin as MapPinIcon, Calendar as CalendarIcon } from "lucide-react";

const Index = () => {
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
        {/* Left sidebar - only on desktop */}
        <div className="hidden md:block">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-4">
              <h2 className="text-lg font-bold text-next12-dark mb-4">Welcome to Next12</h2>
              <p className="text-next12-gray mb-4">Your community hub for next12.org residents. Connect with neighbors, join events, and stay updated.</p>
              <Button className="w-full">Create Post</Button>
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
        
        {/* Main feed */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <div className="flex space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-next12-gray" />
              </div>
              <div className="flex-1">
                <Input placeholder="What's happening at Next12?" className="bg-gray-50" />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="ghost" size="sm" className="text-next12-gray">
                <ImageIcon className="h-5 w-5 mr-1" />
                Photo
              </Button>
              <Button variant="ghost" size="sm" className="text-next12-gray">
                <MapPinIcon className="h-5 w-5 mr-1" />
                Location
              </Button>
              <Button variant="ghost" size="sm" className="text-next12-gray">
                <CalendarIcon className="h-5 w-5 mr-1" />
                Event
              </Button>
              <Button size="sm">Post</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {featuredPosts.map(post => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
