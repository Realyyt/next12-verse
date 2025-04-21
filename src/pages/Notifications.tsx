import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/hooks/useAuthUser";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  type: "friend_request" | "friend_accepted";
  title: string;
  description?: string;
  time: string;
  isRead: boolean;
  profileUrl: string;
  senderId?: string;
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
      if (!user) {
        setNotifications([]);
        setLoadingNotifs(false);
        return;
      }
      setLoadingNotifs(true);

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

      const allUserIds = [
        ...(asFriend?.map(c => c.user_id) ?? []),
        ...(asUser?.map(c => c.friend_id) ?? [])
      ];
      const uniqueUserIds = Array.from(new Set(allUserIds));

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

      const notifs: Notification[] = [];
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

  const handleAccept = async (connectionId: string) => {
    setAccepting(connectionId);
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
        <div className="bg-white rounded-3xl shadow-md overflow-hidden">
          {loadingNotifs ? (
            <div className="p-8 text-center text-next12-gray">Loading...</div>
          ) : notifications.length > 0 ? (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={cn(
                  "flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 p-6 border-b last:border-b-0",
                  "bg-white transition-all duration-150",
                  !notification.isRead && "bg-[#FFF8F4] shadow-[0_4px_32px_0_rgba(255,120,61,0.05)]"
                )}
                tabIndex={0}
                aria-label={notification.title}
                style={{ borderRadius: '1.25rem' }}
              >
                <div className="flex flex-row items-center flex-1 min-w-0">
                  <div
                    className={cn(
                      "flex items-center justify-center h-14 w-14 rounded-full mr-5 flex-shrink-0",
                      notification.type === "friend_accepted"
                        ? "bg-green-100 text-green-500"
                        : "bg-blue-100 text-blue-500"
                    )}
                    aria-hidden="true"
                  >
                    {notification.type === "friend_accepted" ? (
                      <CheckIcon className="h-7 w-7" />
                    ) : (
                      <UserPlus className="h-7 w-7" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-bold text-next12-dark text-lg leading-snug break-words">
                      {notification.title}
                    </span>
                    {notification.description && (
                      <span className="text-next12-gray text-base">{notification.description}</span>
                    )}
                    <span className="text-next12-gray text-xs mt-1">{notification.time}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0 mt-4 sm:mt-0">
                  {notification.type === "friend_request" && (
                    <Button
                      onClick={() => handleAccept(notification.id)}
                      disabled={accepting === notification.id}
                      size="lg"
                      className={cn(
                        "px-8 py-3 text-base font-semibold rounded-xl shadow-none bg-next12-orange hover:bg-next12-orange/90 focus:ring-2 focus:ring-offset-2 focus:ring-orange-200 focus:outline-none transition-all",
                        accepting === notification.id && "opacity-70"
                      )}
                      aria-label={`Accept friend request from ${notification.description}`}
                    >
                      {accepting === notification.id ? (
                        <>
                          <CheckIcon className="h-5 w-5 mr-2 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-5 w-5 mr-2" />
                          Accept
                        </>
                      )}
                    </Button>
                  )}
                  <Link
                    to={notification.profileUrl}
                    className={cn(
                      "text-next12-orange font-semibold underline underline-offset-2 hover:text-next12-orange/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 px-2 py-1 -mx-2 transition",
                      "text-base"
                    )}
                    tabIndex={0}
                    aria-label="View profile"
                    style={{ minWidth: 120, textAlign: 'right' }}
                  >
                    View profile
                  </Link>
                </div>
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
