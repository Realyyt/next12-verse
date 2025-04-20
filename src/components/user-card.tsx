
import { UserIcon, MapPinIcon, BadgeCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
          {connectionStatus === "none" && (
            <Button className="w-full">Connect</Button>
          )}
          {connectionStatus === "pending" && (
            <Button variant="outline" className="w-full">Pending</Button>
          )}
          {connectionStatus === "connected" && (
            <Button variant="outline" className="w-full">Message</Button>
          )}
        </div>
      )}
      
      {variant === "compact" && (
        <div className="ml-auto">
          {connectionStatus === "none" && (
            <Button size="sm">Connect</Button>
          )}
          {connectionStatus === "pending" && (
            <Button variant="outline" size="sm">Pending</Button>
          )}
          {connectionStatus === "connected" && (
            <Button variant="outline" size="sm">Message</Button>
          )}
        </div>
      )}
    </div>
  );
}
