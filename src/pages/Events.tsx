import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, CalendarIcon } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/lib/supabaseClient";
import { isAdmin } from "@/lib/supabaseClient";
import { CreateEventModal } from "@/components/CreateEventModal";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_attendees: number | null;
  image_url: string | null;
  created_by: string;
  status: "published" | "cancelled" | "completed";
  attendees_count: { count: number } | number;
}

const Events = () => {
  const { user } = useAuthUser();
  const { toast } = useToast();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const checkAdminStatus = async () => {
    if (!user) return;
    const adminStatus = await isAdmin(user.id);
    setIsAdminUser(adminStatus);
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          attendees_count:event_registrations(count)
        `)
        .eq("status", "published")
        .order("date", { ascending: true });

      if (error) throw error;

      setEvents(data || []);
    } catch (error) {
      toast({
        title: "Error loading events",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingEvents = filteredEvents.filter(event => new Date(event.date) >= new Date());
  const pastEvents = filteredEvents.filter(event => new Date(event.date) < new Date());
  const myEvents = filteredEvents.filter(event => event.created_by === user?.id);

  return (
    <Layout title="Events">
      <div className="py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-next12-dark mb-1">Next12 Events</h1>
            <p className="text-next12-gray">Discover and join events in your community</p>
          </div>
          
          {isAdminUser && (
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          )}
        </div>
        
        <Tabs defaultValue="upcoming" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="my-events">My Events</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-next12-gray h-4 w-4" />
                <Input 
                  placeholder="Search events" 
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="upcoming" className="mt-0">
            {loading ? (
              <div className="text-center py-8">Loading events...</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-next12-gray">No upcoming events found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    date={new Date(event.date).toLocaleDateString()}
                    location={event.location}
                    attendees={typeof event.attendees_count === 'object' && event.attendees_count !== null && 'count' in event.attendees_count ? event.attendees_count.count : (typeof event.attendees_count === 'number' ? event.attendees_count : 0)}
                    image={event.image_url || undefined}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-events" className="mt-0">
            {loading ? (
              <div className="text-center py-8">Loading events...</div>
            ) : myEvents.length === 0 ? (
              <div className="text-center py-8 text-next12-gray">You haven't created any events yet</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map(event => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    date={new Date(event.date).toLocaleDateString()}
                    location={event.location}
                    attendees={typeof event.attendees_count === 'object' && event.attendees_count !== null && 'count' in event.attendees_count ? event.attendees_count.count : (typeof event.attendees_count === 'number' ? event.attendees_count : 0)}
                    image={event.image_url || undefined}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-0">
            {loading ? (
              <div className="text-center py-8">Loading events...</div>
            ) : pastEvents.length === 0 ? (
              <div className="text-center py-8 text-next12-gray">No past events found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map(event => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description}
                    date={new Date(event.date).toLocaleDateString()}
                    location={event.location}
                    attendees={typeof event.attendees_count === 'object' && event.attendees_count !== null && 'count' in event.attendees_count ? event.attendees_count.count : (typeof event.attendees_count === 'number' ? event.attendees_count : 0)}
                    image={event.image_url || undefined}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateEventModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </Layout>
  );
};

export default Events;
