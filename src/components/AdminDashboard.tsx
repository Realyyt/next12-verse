import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreatePostModal } from "@/components/CreatePostModal";
import { isAdmin } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function AdminDashboard() {
  const { user } = useAuthUser();
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    max_attendees: 0,
    image_url: '',
    status: 'published'
  });
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (user) {
      isAdmin(user.id).then(setIsAdminUser).finally(() => setChecked(true));
    } else {
      setChecked(true);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          attendees_count:event_registrations(count)
        `)
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;
      setEvents(eventsData);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData);

      // Fetch registrations
      const { data: regData, error: regError } = await supabase
        .from('event_registrations')
        .select(`
          *,
          profiles:user_id (name, username),
          events:event_id (title)
        `)
        .order('created_at', { ascending: false });

      if (regError) throw regError;
      setRegistrations(regData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...newEvent,
          created_by: user.id,
          status: 'published'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event created successfully',
      });

      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        max_attendees: 0,
        image_url: '',
        status: 'published'
      });
      setIsEventDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateEventStatus = async (eventId, newStatus) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Event status updated to ${newStatus}`,
      });

      fetchData();
    } catch (error) {
      console.error('Error updating event status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    }
  };

  const handleApproveRegistration = async (registrationId) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({
          status: 'confirmed',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Registration approved',
      });

      fetchData();
    } catch (error) {
      console.error('Error approving registration:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve registration',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRegistration = async (registrationId) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({
          status: 'cancelled',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Registration rejected',
      });

      fetchData();
    } catch (error) {
      console.error('Error rejecting registration:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject registration',
        variant: 'destructive',
      });
    }
  };

  const handleBanUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          admin_notes: 'Banned by admin',
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User banned successfully',
      });

      fetchData();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to ban user',
        variant: 'destructive',
      });
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          admin_notes: 'Unbanned by admin',
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User unbanned successfully',
      });

      fetchData();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unban user',
        variant: 'destructive',
      });
    }
  };

  if (!checked) return null;
  if (!isAdminUser) return <div className="p-8 text-center text-red-500">You do not have access to this page.</div>;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-next12-gray hover:text-next12-orange transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="events" className="w-full">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Posts</h2>
                <CreatePostModal open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen} />
                <Button onClick={() => setIsEventDialogOpen(true)}>Create New Post</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Management</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.is_banned ? 'Banned' : 'Active'}
                    </TableCell>
                    <TableCell>
                      {user.is_banned ? (
                        <Button
                          variant="outline"
                          onClick={() => handleUnbanUser(user.id)}
                        >
                          Unban
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => handleBanUser(user.id)}
                        >
                          Ban
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="registrations">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Event Registrations</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>{reg.profiles?.name}</TableCell>
                    <TableCell>{reg.events?.title}</TableCell>
                    <TableCell>{reg.status}</TableCell>
                    <TableCell>
                      {reg.status === 'pending' && (
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => handleApproveRegistration(reg.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleRejectRegistration(reg.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 