
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "stacked" | "icon";
  className?: string;
}

export function Logo({ variant = "default", className }: LogoProps) {
  if (variant === "icon") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="bg-next12-orange p-1 rounded-md">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M13 3L4 14H14L11 21L20 10H10L13 3Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  }
  
  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <div className="bg-next12-orange p-1 rounded-md">
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M13 3L4 14H14L11 21L20 10H10L13 3Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex items-center mt-2">
          <span className="font-bold text-2xl text-next12-dark">next</span>
          <span className="font-bold text-2xl text-next12-orange">12</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="bg-next12-orange p-1 rounded-md mr-2">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M13 3L4 14H14L11 21L20 10H10L13 3Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex items-center">
        <span className="font-bold text-xl text-next12-dark">next</span>
        <span className="font-bold text-xl text-next12-orange">12</span>
      </div>
    </div>
  );
}
