
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { UserCard } from "@/components/user-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserPlus, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

// Types for easier state
type Profile = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  location?: string;
  bio?: string;
  is_verified?: boolean;
};

type Connection = {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

const Community = () => {
  const { user } = useAuthUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "connected" | "pending">("all");
  const [residents, setResidents] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Helper function to refresh the data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Refreshing data",
      description: "Loading the latest residents and connections..."
    });
  };

  // Load all profiles except self
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Get profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*");

        if (profilesError) {
          setError("Failed to load residents");
          setLoading(false);
          return;
        }

        // Filter out the current user if in the results
        const filteredProfiles = profilesData 
          ? profilesData.filter(profile => profile.id !== user.id)
          : [];

        setResidents(filteredProfiles);

        // Get connections
        const { data: connectionsData, error: connectionsError } = await supabase
          .from("connections")
          .select("*")
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

        if (connectionsError) {
          setError("Failed to load connections");
          setLoading(false);
          return;
        }

        // Convert string status to specific union type
        const typedConnections = connectionsData?.map(conn => ({
          ...conn,
          status: conn.status as "pending" | "accepted" | "rejected"
        })) || [];

        setConnections(typedConnections);
        setLoading(false);
      } catch (err) {
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchData();
  }, [user, refreshTrigger]);

  // Compute residents with connectionStatus
  const filteredResidents = residents
    .map(resident => {
      // Find connection between current user and this resident
      let myConn = connections.find(
        c => (c.user_id === user?.id && c.friend_id === resident.id) ||
             (c.friend_id === user?.id && c.user_id === resident.id)
      );

      // Determine connection status
      let connectionStatus: "none" | "pending" | "connected" = "none";

      if (myConn) {
        if (myConn.status === "accepted") {
          connectionStatus = "connected";
        } else if (myConn.status === "pending") {
          connectionStatus = "pending";
        }
      }

      return {
        ...resident,
        isVerified: resident.is_verified || false,
        connectionStatus
      };
    })
    .filter(resident => {
      // Resident filtering by tab and search
      if (activeFilter === "connected" && resident.connectionStatus !== "connected") return false;
      if (activeFilter === "pending" && resident.connectionStatus !== "pending") return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        resident.name.toLowerCase().includes(term) ||
        resident.username.toLowerCase().includes(term) ||
        (resident.bio && resident.bio.toLowerCase().includes(term))
      );
    });

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
            <Button variant="outline" size="icon" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => setActiveFilter(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-2">
            <TabsTrigger value="all">All Residents</TabsTrigger>
            <TabsTrigger value="connected">My Connections</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
          {/* ALL RESIDENTS TAB */}
          <TabsContent value="all" className="mt-0">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow">
              {error && (
                <div className="text-red-500 p-4 mb-4 bg-red-50 rounded-lg">
                  Error: {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full py-6 text-center text-next12-gray">
                    Loading residents...
                  </div>
                ) : filteredResidents.length > 0 ? (
                  filteredResidents.map(resident => (
                    <UserCard key={resident.id} {...resident} />
                  ))
                ) : (
                  <div className="col-span-full py-6 text-center text-next12-gray">
                    {searchTerm ? (
                      <p>No residents match your search criteria.</p>
                    ) : (
                      <p>No other residents found. You might be the first one here!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          {/* CONNECTED TAB */}
          <TabsContent value="connected" className="mt-0">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full py-6 text-center text-next12-gray">
                    Loading connections...
                  </div>
                ) : filteredResidents.filter(r => r.connectionStatus === "connected").length > 0 ? (
                  filteredResidents
                    .filter(r => r.connectionStatus === "connected")
                    .map(resident => (
                      <UserCard key={resident.id} {...resident} />
                    ))
                ) : (
                  <div className="col-span-full py-6 text-center text-next12-gray">
                    <p>You haven't connected with any residents yet.</p>
                    <Button variant="outline" className="mt-2" onClick={() => setActiveFilter("all")}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find Connections
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          {/* PENDING TAB */}
          <TabsContent value="pending" className="mt-0">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full py-6 text-center text-next12-gray">
                    Loading pending requests...
                  </div>
                ) : filteredResidents.filter(r => r.connectionStatus === "pending").length > 0 ? (
                  filteredResidents
                    .filter(r => r.connectionStatus === "pending")
                    .map(resident => (
                      <UserCard key={resident.id} {...resident} />
                    ))
                ) : (
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
