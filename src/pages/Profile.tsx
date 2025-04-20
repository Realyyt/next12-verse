
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
  SettingsIcon,
  UsersIcon,
  ImageIcon
} from "lucide-react";

const Profile = () => {
  const user = {
    id: "current-user",
    name: "Alex Johnson",
    username: "alexjohnson",
    bio: "Next12 resident | Tech enthusiast | Community builder",
    location: "Level 10, Apt 1042",
    joinedDate: "Joined March 2023",
    followers: 142,
    following: 89,
    posts: [
      {
        id: "post1",
        author: {
          id: "current-user",
          name: "Alex Johnson",
          username: "alexjohnson",
          isVerified: true,
        },
        content: "Just attended the community gardening workshop and learned so much! Can't wait to start growing herbs on my balcony. Thanks to everyone who organized it!",
        timestamp: "2 days ago",
        likes: 24,
        comments: 7,
        image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
      {
        id: "post2",
        author: {
          id: "current-user",
          name: "Alex Johnson",
          username: "alexjohnson",
          isVerified: true,
        },
        content: "The sunrise view from the Next12 rooftop is absolutely stunning. Perfect way to start the day with the morning meditation group.",
        timestamp: "1 week ago",
        likes: 36,
        comments: 5,
        image: "https://images.unsplash.com/photo-1508479524924-8b2e1c847988?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
    ],
  };

  return (
    <Layout showHeader={false}>
      <div className="bg-next12-orange h-32 md:h-48 rounded-b-xl"></div>
      
      <div className="px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end mb-6">
          <div className="h-32 w-32 rounded-xl bg-white p-1 shadow-lg mb-4 md:mb-0">
            <div className="h-full w-full bg-gray-100 rounded-lg flex items-center justify-center">
              <UserIcon className="h-20 w-20 text-next12-gray" />
            </div>
          </div>
          
          <div className="flex-1 md:ml-6">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-next12-dark">{user.name}</h1>
                  <p className="text-next12-gray">@{user.username}</p>
                </div>
                
                <div className="flex mt-4 md:mt-0 space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Edit2Icon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
              
              <p className="mt-3 text-next12-dark">{user.bio}</p>
              
              <div className="flex flex-wrap gap-y-2 mt-3">
                <div className="flex items-center text-next12-gray mr-4">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{user.location}</span>
                </div>
                <div className="flex items-center text-next12-gray mr-4">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm">{user.joinedDate}</span>
                </div>
              </div>
              
              <div className="flex mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center mr-6">
                  <UsersIcon className="h-4 w-4 mr-1 text-next12-gray" />
                  <span className="font-medium text-next12-dark">{user.followers}</span>
                  <span className="text-next12-gray ml-1">Followers</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-next12-dark">{user.following}</span>
                  <span className="text-next12-gray ml-1">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="bg-white mb-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-0">
            <div className="space-y-4">
              {user.posts.map(post => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="mt-0">
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="h-8 w-8 text-next12-gray" />
              </div>
              <h3 className="text-lg font-semibold text-next12-dark mb-2">No Events Yet</h3>
              <p className="text-next12-gray mb-4">You haven't joined any events. Explore upcoming events and get involved in your community.</p>
              <Button>Browse Events</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="connections" className="mt-0">
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UsersIcon className="h-8 w-8 text-next12-gray" />
              </div>
              <h3 className="text-lg font-semibold text-next12-dark mb-2">Connect with Neighbors</h3>
              <p className="text-next12-gray mb-4">Build your network with other Next12 residents.</p>
              <Button>Find Connections</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
