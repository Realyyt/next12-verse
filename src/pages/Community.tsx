
import { Layout } from "@/components/layout";
import { UserCard } from "@/components/user-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserPlus } from "lucide-react";

const Community = () => {
  const residents = [
    {
      id: "user1",
      name: "Jane Cooper",
      username: "janecooper",
      location: "Level 10, Apt 1003",
      bio: "Digital artist and community manager at Next12",
      isVerified: true,
      connectionStatus: "connected" as const,
    },
    {
      id: "user2",
      name: "Wade Warren",
      username: "wadewarren",
      location: "Level 5, Apt 512",
      bio: "Architect and urban design enthusiast",
      connectionStatus: "none" as const,
    },
    {
      id: "user3",
      name: "Esther Howard",
      username: "estherhoward",
      location: "Level 12, Apt 1204",
      bio: "Chef, food enthusiast, and community garden volunteer",
      isVerified: true,
      connectionStatus: "pending" as const,
    },
    {
      id: "user4",
      name: "Kristin Watson",
      username: "kristinwatson",
      location: "Level 7, Apt 721",
      bio: "Fitness instructor and wellness advocate",
      connectionStatus: "none" as const,
    },
    {
      id: "user5",
      name: "Cameron Williamson",
      username: "cameronw",
      location: "Level 8, Apt 824",
      bio: "Tech consultant and drone photography hobbyist",
      isVerified: true,
      connectionStatus: "connected" as const,
    },
    {
      id: "user6",
      name: "Brooklyn Simmons",
      username: "brooklyns",
      location: "Level 9, Apt 915",
      bio: "Interior designer and plant lover",
      connectionStatus: "none" as const,
    },
  ];

  return (
    <Layout title="Community">
      <div className="py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-next12-dark mb-1">Next12 Community</h1>
            <p className="text-next12-gray">Connect with {residents.length} residents in your building</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-next12-gray h-4 w-4" />
              <Input 
                placeholder="Search residents" 
                className="pl-9 w-full md:w-64" 
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 md:p-6 shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {residents.map(resident => (
              <UserCard key={resident.id} {...resident} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Community;
