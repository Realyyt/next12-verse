
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

// Possible notification structure
interface Notification {
  id: string;
  type: "friend_request" | "friend_accepted";
  title: string;
  description?: string;
  time: string;
  isRead: boolean;
  profileUrl: string;
  senderId?: string; // sender of the friend request (for friend_requests)
}

interface Profile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export default function Notifications() {
  const { user, loading } = useAuthUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);
  const { toast } = useToast();
  const [accepting, setAccepting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      // Early return if auth isn't loaded yet
      if (!user) {
        setNotifications([]);
        setLoadingNotifs(false);
        return;
      }
      setLoadingNotifs(true);

      // Get all connections where this user is involved
      const [{ data: asFriend, error: error1 }, { data: asUser, error: error2 }] = await Promise.all([
        supabase
          .from("connections")
          .select("*")
          .eq("friend_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("connections")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (error1 || error2) {
        setNotifications([]);
        setLoadingNotifs(false);
        return;
      }
      // Build notifications for: new received friend requests, and accepted friends where I'm the sender
      // Get all involved user IDs
      const allUserIds = [
        ...(asFriend?.map(c => c.user_id) ?? []),
        ...(asUser?.map(c => c.friend_id) ?? [])
      ];
      const uniqueUserIds = Array.from(new Set(allUserIds));
      // Get profiles for all involved users
      let profiles: Record<string, Profile> = {};
      if (uniqueUserIds.length > 0) {
        const { data: usersData } = await supabase
          .from("profiles")
          .select("id, name, username, avatar")
          .in("id", uniqueUserIds);
        if (usersData) {
          for (const p of usersData)
            profiles[p.id] = p;
        }
      }

      // Build notifications
      const notifs: Notification[] = [];
      // 1. Friend requests sent to me and still pending
      for (const req of asFriend ?? []) {
        if (req.status === "pending") {
          const sender = profiles[req.user_id];
          if (!sender) continue;
          notifs.push({
            id: req.id,
            type: "friend_request",
            title: `${sender.name} sent you a friend request`,
            description: `@${sender.username}`,
            time: new Date(req.created_at).toLocaleString(),
            isRead: false,
            profileUrl: `/profile/${sender.username}`,
            senderId: req.user_id,
          });
        }
      }
      // 2. Friend requests I sent and that were accepted
      for (const req of asUser ?? []) {
        if (req.status === "accepted") {
          const friend = profiles[req.friend_id];
          if (!friend) continue;
          notifs.push({
            id: req.id,
            type: "friend_accepted",
            title: `${friend.name} accepted your friend request`,
            description: `@${friend.username}`,
            time: new Date(req.created_at).toLocaleString(),
            isRead: true,
            profileUrl: `/profile/${friend.username}`,
          });
        }
      }
      setNotifications(notifs);
      setLoadingNotifs(false);
    }
    fetchNotifications();
  }, [user]);

  // Accept friend request handler
  const handleAccept = async (connectionId: string) => {
    setAccepting(connectionId);
    // Patch connection.status to "accepted"
    const { error } = await supabase
      .from("connections")
      .update({ status: "accepted" })
      .eq("id", connectionId);
    if (!error) {
      setNotifications(prev =>
        prev.map(n => {
          if (n.id === connectionId)
            return {
              ...n,
              type: "friend_accepted",
              title: n.title.replace("sent you a friend request", "is now your connection!"),
              isRead: true,
            };
          return n;
        })
      );
      toast({
        title: "Connection accepted",
        description: "You are now connected!",
      });
    } else {
      toast({
        title: "Error",
        description: "Could not accept the connection. Please try again.",
        variant: "destructive",
      });
    }
    setAccepting(null);
  };

  return (
    <Layout title="Notifications">
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-next12-dark">Notifications</h1>
          <Button variant="outline" size="sm" className="flex items-center" disabled>
            <CheckIcon className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        </div>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loadingNotifs ? (
            <div className="p-8 text-center text-next12-gray">Loading...</div>
          ) : notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={cn(
                  "flex items-start p-4 border-b border-gray-100",
                  !notification.isRead && "bg-next12-orange/5"
                )}>
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center mr-3",
                  notification.type === "friend_accepted"
                    ? "bg-green-100 text-green-500"
                    : "bg-blue-100 text-blue-500"
                )}>
                  {notification.type === "friend_accepted" ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <UserPlus className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-next12-dark">{notification.title}</h3>
                      {notification.description && (
                        <p className="text-next12-gray text-sm mt-1">{notification.description}</p>
                      )}
                      <p className="text-next12-gray text-xs mt-1">{notification.time}</p>
                    </div>
                    {(notification.type === "friend_request") && (
                      <Button
                        onClick={() => handleAccept(notification.id)}
                        disabled={accepting === notification.id}
                        size="sm"
                        className="ml-4"
                      >
                        {accepting === notification.id ? (
                          <>
                            <CheckIcon className="h-4 w-4 mr-1 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <Link
                  to={notification.profileUrl}
                  className="ml-4 underline text-next12-orange text-sm hover:text-next12-orange/90"
                  tabIndex={0}
                  aria-label="View profile"
                >
                  View profile
                </Link>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="h-8 w-8 text-next12-gray" />
              </div>
              <h3 className="text-lg font-semibold text-next12-dark mb-2">No Notifications</h3>
              <p className="text-next12-gray mb-4">You're all caught up! No friend activity yet.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

