
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: number;
  image?: string;
  variant?: "default" | "highlight";
  className?: string;
}

export function EventCard({
  id,
  title,
  description,
  date,
  location,
  attendees,
  image,
  variant = "default",
  className,
}: EventCardProps) {
  return (
    <div 
      className={cn(
        "rounded-xl overflow-hidden bg-white shadow",
        variant === "highlight" && "border-2 border-next12-orange",
        className
      )}
    >
      {image && (
        <div className="relative h-48 w-full">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
          {variant === "highlight" && (
            <div className="absolute top-3 right-3 bg-next12-orange text-white text-xs font-bold px-2 py-1 rounded-full">
              Featured
            </div>
          )}
        </div>
      )}
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-next12-dark mb-2">{title}</h3>
        <p className="text-next12-gray text-sm mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center text-next12-gray">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">{date}</span>
          </div>
          <div className="flex items-center text-next12-gray">
            <MapPinIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">{location}</span>
          </div>
          <div className="flex items-center text-next12-gray">
            <UsersIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">{attendees} attendees</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            className="flex-1" 
            variant={variant === "highlight" ? "default" : "outline"}
          >
            Join Event
          </Button>
          <Button 
            variant="outline" 
            className="border-next12-gray/30 text-next12-gray"
          >
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
