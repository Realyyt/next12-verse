import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { Home, Users, Calendar, Bell, User, LogOut } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";

// Mobile navigation is no longer rendered, so keep only SideNavigation
// export function NavigationBar() { ... } // Removed

export function SideNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const [notifications] = useState(3);

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Community",
      path: "/community",
      icon: Users,
    },
    {
      name: "Events",
      path: "/events",
      icon: Calendar,
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell,
      badge: notifications,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  // Handle logout (redirect to /logout)
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/logout");
  };

  return (
    <div className="hidden md:flex h-screen fixed left-0 top-0 w-64 flex-col border-r border-gray-200 bg-white">
      {/* Top: Logo only for clean look */}
      <div className="p-8 flex justify-center items-center border-b border-gray-200">
        <Logo variant="stacked" />
      </div>
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg relative transition-colors",
                location.pathname === item.path
                  ? "bg-next12-orange/10 text-next12-orange"
                  : "text-next12-gray hover:bg-gray-50"
              )}
              style={{
                boxShadow: location.pathname === item.path ? "0 2px 12px 0 rgba(245, 142, 44, 0.07)" : undefined
              }}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
              {item.badge && (
                <span className="absolute right-2 bg-next12-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
      {/* Bottom: Profile info and Logout */}
      <div className="p-8 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-next12-gray/20 flex items-center justify-center text-next12-dark">
            <User size={20} />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-base font-semibold text-next12-dark truncate">
              {user?.email ?? "Next12 User"}
            </p>
            <p className="text-xs text-next12-gray truncate">
              {user ? `@${user.email?.split("@")[0]}` : "@next12user"}
            </p>
          </div>
        </div>
        {user && (
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-next12-gray hover:bg-next12-orange/10 hover:text-next12-orange transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
