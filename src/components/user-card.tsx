import { useState } from "react";
import { UserIcon, MapPinIcon, BadgeCheckIcon, MessageCircle, UserPlus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useChat } from "@/hooks/use-chat";
import { supabase } from "@/lib/supabaseClient";

interface UserCardProps {
  id: string;
  name: string;
  username: string;
  location?: string;
  bio?: string;
  avatar?: string;
  isVerified?: boolean;
  connectionStatus?: "none" | "pending" | "connected";
  variant?: "default" | "compact";
  className?: string;
}

export function UserCard({
  id,
  name,
  username,
  location,
  bio,
  avatar,
  isVerified = false,
  connectionStatus = "none",
  variant = "default",
  className,
}: UserCardProps) {
  const [status, setStatus] = useState(connectionStatus);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthUser();
  const { openChat } = useChat();

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to connect with other residents",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("connections").insert({
        user_id: user.id,
        friend_id: id,
        status: "pending"
      });
      
      if (error) {
        console.error("Error creating connection:", error);
        throw error;
      }
      
      setStatus("pending");
      toast({
        title: "Connection request sent",
        description: `You've sent a connection request to ${name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = () => {
    if (openChat) {
      openChat(id);
    } else {
      window.location.href = `/chat/${id}`;
    }
  };

  return (
    <div 
      className={cn(
        "rounded-xl bg-white shadow p-4",
        variant === "compact" && "flex items-center",
        className
      )}
    >
      <div className={cn(
        "flex items-center", 
        variant === "default" && "flex-col"
      )}>
        <div className={cn(
          "bg-gray-100 rounded-full flex items-center justify-center overflow-hidden",
          variant === "default" ? "h-16 w-16 mb-3" : "h-12 w-12 mr-3"
        )}>
          {avatar ? (
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-6 w-6 text-next12-gray" />
          )}
        </div>
        
        <div className={cn(
          variant === "default" && "text-center"
        )}>
          <div className="flex items-center">
            <h3 className={cn(
              "font-semibold text-next12-dark",
              variant === "default" ? "text-lg" : "text-base"
            )}>
              {name}
            </h3>
            {isVerified && (
              <BadgeCheckIcon className="h-4 w-4 ml-1 text-next12-orange" />
            )}
          </div>
          
          <p className="text-next12-gray text-sm">@{username}</p>
          
          {location && variant === "default" && (
            <div className="flex items-center justify-center mt-1 text-next12-gray">
              <MapPinIcon className="h-3 w-3 mr-1" />
              <span className="text-xs">{location}</span>
            </div>
          )}
          
          {bio && variant === "default" && (
            <p className="text-sm text-next12-gray mt-2">{bio}</p>
          )}
        </div>
      </div>
      
      {variant === "default" && (
        <div className="mt-4">
          {status === "none" && (
            <Button 
              className="w-full" 
              onClick={handleConnect} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </>
              )}
            </Button>
          )}
          {status === "pending" && (
            <Button variant="outline" className="w-full" disabled>
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </Button>
          )}
          {status === "connected" && (
            <Button variant="outline" className="w-full" onClick={handleMessage}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          )}
        </div>
      )}
      
      {variant === "compact" && (
        <div className="ml-auto">
          {status === "none" && (
            <Button size="sm" onClick={handleConnect} disabled={isLoading}>
              {isLoading ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-1" />
              )}
              Connect
            </Button>
          )}
          {status === "pending" && (
            <Button variant="outline" size="sm" disabled>
              <Clock className="h-4 w-4 mr-1" />
              Pending
            </Button>
          )}
          {status === "connected" && (
            <Button variant="outline" size="sm" onClick={handleMessage}>
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
