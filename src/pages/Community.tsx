
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { UserCard } from "@/components/user-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthUser } from "@/hooks/useAuthUser";

const Community = () => {
  const { user } = useAuthUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "connected" | "pending">("all");
  const [filteredResidents, setFilteredResidents] = useState<any[]>([]);
  
  // Mock resident data
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

  // Filter residents based on search and tab
  useEffect(() => {
    let result = [...residents];
    
    // Apply tab filter
    if (activeFilter === "connected") {
      result = result.filter(resident => resident.connectionStatus === "connected");
    } else if (activeFilter === "pending") {
      result = result.filter(resident => resident.connectionStatus === "pending");
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        resident =>
          resident.name.toLowerCase().includes(term) ||
          resident.username.toLowerCase().includes(term) ||
          (resident.bio && resident.bio.toLowerCase().includes(term))
      );
    }
    
    setFilteredResidents(result);
  }, [searchTerm, activeFilter]);

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setActiveFilter(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-2">
            <TabsTrigger value="all">All Residents</TabsTrigger>
            <TabsTrigger value="connected">My Connections</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResidents.map(resident => (
                  <UserCard key={resident.id} {...resident} />
                ))}
                {filteredResidents.length === 0 && (
                  <div className="col-span-full py-6 text-center text-next12-gray">
                    {searchTerm ? (
                      <p>No residents match your search criteria.</p>
                    ) : (
                      <p>No residents to display.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="connected" className="mt-0">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResidents.map(resident => (
                  <UserCard key={resident.id} {...resident} />
                ))}
                {filteredResidents.length === 0 && (
                  <div className="col-span-full py-6 text-center text-next12-gray">
                    <p>You haven't connected with any residents yet.</p>
                    <Button variant="outline" className="mt-2">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find Connections
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResidents.map(resident => (
                  <UserCard key={resident.id} {...resident} />
                ))}
                {filteredResidents.length === 0 && (
                  <div className="col-span-full py-6 text-center text-next12-gray">
                    <p>No pending connection requests.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Community;
