
import { ReactNode } from "react";
import { NavigationBar, SideNavigation } from "@/components/navigation-bar";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  title?: string;
}

// Only render navigation/sidebar if showHeader is true (not on auth pages)
export function Layout({ children, showHeader = true, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <SideNavigation />}
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-sm border-b border-gray-200 flex items-center px-6 sm:px-10 z-10 md:pl-64">
          <div className="md:hidden">
            {/* Logo is already on auth pages */}
          </div>
          {title && (
            <h1 className="text-xl font-semibold text-next12-dark mx-auto md:mx-0">
              {title}
            </h1>
          )}
        </header>
      )}
      <main className={showHeader ? "pt-20 pb-16 md:pl-64 md:pt-6 md:pb-4" : ""}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          {children}
        </div>
      </main>
      {showHeader && <NavigationBar />}
    </div>
  );
}
