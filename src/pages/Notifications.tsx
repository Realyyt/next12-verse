
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { UserPlus, Calendar, Heart, MessageSquare, Bell, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationProps {
  id: string;
  type: "connection" | "event" | "like" | "comment" | "announcement";
  title: string;
  description?: string;
  time: string;
  isRead: boolean;
  actionUrl?: string;
}

const NotificationItem = ({ notification }: { notification: NotificationProps }) => {
  const getIcon = () => {
    switch (notification.type) {
      case "connection":
        return <UserPlus className="h-5 w-5" />;
      case "event":
        return <Calendar className="h-5 w-5" />;
      case "like":
        return <Heart className="h-5 w-5" />;
      case "comment":
        return <MessageSquare className="h-5 w-5" />;
      case "announcement":
        return <Bell className="h-5 w-5" />;
    }
  };

  const getIconBackground = () => {
    switch (notification.type) {
      case "connection":
        return "bg-blue-100 text-blue-500";
      case "event":
        return "bg-green-100 text-green-500";
      case "like":
        return "bg-pink-100 text-pink-500";
      case "comment":
        return "bg-purple-100 text-purple-500";
      case "announcement":
        return "bg-orange-100 text-orange-500";
    }
  };

  return (
    <div className={cn(
      "flex items-start p-4 border-b border-gray-100",
      !notification.isRead && "bg-next12-orange/5"
    )}>
      <div className={cn(
        "h-10 w-10 rounded-full flex items-center justify-center mr-3",
        getIconBackground()
      )}>
        {getIcon()}
      </div>
      
      <div className="flex-1">
        <h3 className="font-medium text-next12-dark">{notification.title}</h3>
        {notification.description && (
          <p className="text-next12-gray text-sm mt-1">{notification.description}</p>
        )}
        <p className="text-next12-gray text-xs mt-1">{notification.time}</p>
      </div>
      
      <div className={cn(
        "h-2 w-2 rounded-full",
        notification.isRead ? "hidden" : "bg-next12-orange"
      )} />
    </div>
  );
};

const Notifications = () => {
  const notifications: NotificationProps[] = [
    {
      id: "1",
      type: "announcement",
      title: "Welcome to Next12 Zo World",
      description: "We're excited to have you join our community platform!",
      time: "Just now",
      isRead: false,
    },
    {
      id: "2",
      type: "connection",
      title: "Kristin Watson sent you a connection request",
      time: "1 hour ago",
      isRead: false,
      actionUrl: "/profile/kristin",
    },
    {
      id: "3",
      type: "event",
      title: "New event: Community Meetup",
      description: "Happening tomorrow at 6:00 PM in the Main Lobby",
      time: "2 hours ago",
      isRead: false,
      actionUrl: "/events",
    },
    {
      id: "4",
      type: "like",
      title: "Jane Cooper liked your post",
      time: "Yesterday",
      isRead: true,
      actionUrl: "/profile",
    },
    {
      id: "5",
      type: "comment",
      title: "Wade Warren commented on your post",
      description: "\"Great idea! I'd love to join the gardening initiative.\"",
      time: "2 days ago",
      isRead: true,
      actionUrl: "/profile",
    },
  ];

  return (
    <Layout title="Notifications">
      <div className="py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-next12-dark">Notifications</h1>
          <Button variant="outline" size="sm" className="flex items-center">
            <CheckIcon className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-next12-gray" />
              </div>
              <h3 className="text-lg font-semibold text-next12-dark mb-2">No Notifications</h3>
              <p className="text-next12-gray mb-4">You're all caught up! Check back later for updates.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
