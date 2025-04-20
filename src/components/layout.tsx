
import { ReactNode } from "react";
import { SideNavigation } from "@/components/navigation-bar";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  title?: string;
}

// Remove header and navigation bar for a more spacious layout
export function Layout({ children, showHeader = true, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <SideNavigation />}
      <main className={showHeader ? "pt-6 md:pl-64 md:pt-6 md:pb-4" : ""}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
