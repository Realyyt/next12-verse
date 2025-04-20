
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { Home, Users, Calendar, Bell, User } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";

export function NavigationBar() {
  const location = useLocation();
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 sm:px-6 md:hidden">
      <div className="flex justify-between items-center">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex flex-col items-center"
          >
            <div
              className={cn(
                "relative p-2 rounded-full", 
                location.pathname === item.path
                  ? "text-next12-orange"
                  : "text-next12-gray"
              )}
            >
              <item.icon size={20} />
              {item.badge && (
                <span className="absolute top-0 right-0 bg-next12-orange text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-xs",
                location.pathname === item.path
                  ? "text-next12-dark font-medium"
                  : "text-next12-gray"
              )}
            >
              {item.name}
            </span>
          </Link>
        ))}
        <div className="ml-2">
          <UserMenu />
        </div>
      </div>
    </div>
  );
}

export function SideNavigation() {
  const location = useLocation();
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

  return (
    <div className="hidden md:flex h-screen fixed left-0 top-0 w-64 flex-col border-r border-gray-200 bg-white">
      <div className="p-6 flex justify-between items-center border-b border-gray-200">
        <Logo variant="stacked" />
        <UserMenu />
      </div>
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md relative",
                location.pathname === item.path
                  ? "bg-next12-orange/10 text-next12-orange"
                  : "text-next12-gray"
              )}
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
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-next12-gray/20 flex items-center justify-center text-next12-dark">
            <User size={16} />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-next12-dark">Next12 User</p>
            <p className="text-xs text-next12-gray">@next12user</p>
          </div>
        </div>
      </div>
    </div>
  );
}

