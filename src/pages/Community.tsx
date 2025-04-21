
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { UserCard } from "@/components/user-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserPlus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/lib/supabaseClient";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "connected" | "pending">("all");
  const [residents, setResidents] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all profiles except self
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      supabase.from("profiles").select("*").neq("id", user.id),
      supabase.from("connections")
         .select("*")
         .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    ]).then(([profilesRes, connectionsRes]) => {
      setResidents(profilesRes.data || []);
      // Convert string status to the specific union type
      const typedConnections = connectionsRes.data?.map(conn => ({
        ...conn,
        status: conn.status as "pending" | "accepted" | "rejected"
      })) || [];
      setConnections(typedConnections);
      setLoading(false);
    });
  }, [user]);

  // Compute residents with connectionStatus
  const filteredResidents = residents
    .map(resident => {
      let myConn = connections.find(
        c => (c.user_id === user?.id && c.friend_id === resident.id) ||
             (c.friend_id === user?.id && c.user_id === resident.id)
      );
      let connectionStatus: "none" | "pending" | "connected" =
        !myConn
          ? "none"
          : myConn.status === "accepted"
            ? "connected"
            : myConn.status === "pending"
              ? "pending"
              : "none";
      // Pending: currentUser sent request and it's still pending
      if (connectionStatus === "pending" && myConn?.friend_id === user?.id) {
        // Incoming pending - treat as "none"/can accept? Up to you.
        connectionStatus = "pending";
      }
      return {
        ...resident,
        isVerified: resident.is_verified || false,
        connectionStatus
      };
    })
    .filter(resident => {
      // Main resident search filter
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? <div>Loading...</div> :
                  filteredResidents.map(resident => (
                    <UserCard key={resident.id} {...resident} />
                  ))}
                {!loading && filteredResidents.length === 0 && (
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
          {/* CONNECTED TAB */}
          <TabsContent value="connected" className="mt-0">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? <div>Loading...</div> :
                filteredResidents.map(resident => (
                  <UserCard key={resident.id} {...resident} />
                ))}
                {!loading && filteredResidents.length === 0 && (
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
          {/* PENDING TAB */}
          <TabsContent value="pending" className="mt-0">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? <div>Loading...</div> :
                filteredResidents.map(resident => (
                  <UserCard key={resident.id} {...resident} />
                ))}
                {!loading && filteredResidents.length === 0 && (
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
