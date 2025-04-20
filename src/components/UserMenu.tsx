
import { Link, useNavigate } from "react-router-dom";
import { useAuthUser } from "@/hooks/useAuthUser";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { user } = useAuthUser();
  const navigate = useNavigate();

  if (!user) return (
    <div className="flex gap-2">
      <Button asChild variant="secondary">
        <Link to="/login">Log in</Link>
      </Button>
      <Button asChild variant="default" className="bg-[#9b87f5] hover:bg-[#7E69AB]">
        <Link to="/signup">Sign up</Link>
      </Button>
    </div>
  );

  return (
    <div className="flex items-center gap-4">
      <User className="h-6 w-6 text-[#9b87f5]" />
      <span className={cn("font-medium text-next12-dark hidden md:inline")}>{user.email}</span>
      <Button asChild variant="outline" size="sm">
        <Link to="/logout">Logout</Link>
      </Button>
    </div>
  );
}
