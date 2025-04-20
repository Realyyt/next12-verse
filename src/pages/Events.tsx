
import { Layout } from "@/components/layout";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus, CalendarIcon } from "lucide-react";

const Events = () => {
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
      image: "https://images.unsplash.com/photo-1599447292180-45fd84092ef4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: "event3",
      title: "Wine & Cheese Networking",
      description: "An elegant evening to network with professionals in your building.",
      date: "Next Friday at 7:00 PM",
      location: "Community Room",
      attendees: 24,
      image: "https://images.unsplash.com/photo-1528495612343-9ca9f4a4de28?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: "event4",
      title: "Tech Workshop: Smart Home Automation",
      description: "Learn how to automate your Next12 apartment with smart home technology.",
      date: "Next Saturday at 2:00 PM",
      location: "Innovation Lab",
      attendees: 16,
      image: "https://images.unsplash.com/photo-1558002038-1055e2dae2d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
  ];

  const myEvents = [
    upcomingEvents[0],
    upcomingEvents[2],
  ];

  const pastEvents = [
    {
      id: "event5",
      title: "Building Anniversary Celebration",
      description: "One year celebration of Next12 with food, music, and community activities.",
      date: "Last Saturday",
      location: "Courtyard",
      attendees: 86,
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
    {
      id: "event6",
      title: "Urban Gardening Workshop",
      description: "Learn techniques for growing your own herbs and vegetables in small spaces.",
      date: "Two weeks ago",
      location: "Community Garden",
      attendees: 21,
      image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    },
  ];

  return (
    <Layout title="Events">
      <div className="py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-next12-dark mb-1">Next12 Events</h1>
            <p className="text-next12-gray">Discover and join events in your community</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
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
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="upcoming" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="my-events" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map(event => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="past" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map(event => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Events;
