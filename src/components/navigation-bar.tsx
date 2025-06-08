import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { Home, Users, Calendar, User, LogOut, Bell, Shield } from "lucide-react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useNotificationCount } from "@/hooks/useNotificationCount";
import { isAdmin } from "@/lib/supabaseClient";

// Only SideNavigation is used.
export function SideNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const notifications = useNotificationCount();
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    if (user) {
      isAdmin(user.id).then(setIsAdminUser);
    }
  }, [user]);

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
      icon: Bell, // Now using the imported Bell icon
      badge: notifications > 0 ? notifications : null,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  if (isAdminUser) {
    navItems.push({
      name: "Admin Dashboard",
      path: "/admin",
      icon: Shield,
    });
  }

  // Handle logout (redirect to /logout)
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/logout");
  };

  return (
    <div className="hidden md:flex h-screen fixed left-0 top-0 w-64 flex-col border-r border-gray-200 bg-white">
      {/* Top: Logo */}
      <div className="p-8 flex justify-center items-center">
        <Logo variant="stacked" />
      </div>
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg relative transition-colors",
                  isActive
                    ? "bg-next12-orange/10 text-next12-orange font-semibold"
                    : "text-next12-gray hover:bg-gray-50"
                )}
                style={{
                  boxShadow: isActive ? "0 2px 12px 0 rgba(245, 142, 44, 0.07)" : undefined,
                }}
                aria-current={isActive ? "page" : undefined}
                tabIndex={0}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-next12-orange" : "text-next12-gray")} />
                {item.name}
                {"badge" in item && item.badge ? (
                  <span className="absolute right-2 bg-next12-orange text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Bottom: Profile info and Logout */}
      {user && (
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-tl-xl rounded-tr-xl">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-next12-gray/20 flex items-center justify-center text-next12-dark">
              <User size={20} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-sm font-bold text-next12-dark truncate leading-5">
                {user.email}
              </p>
              <p className="text-xs text-gray-500 truncate leading-4">
                @{user.email.split("@")[0]}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-next12-orange bg-next12-orange/10 hover:bg-next12-orange/20 transition-colors"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5 text-next12-orange" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
