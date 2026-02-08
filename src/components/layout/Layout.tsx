import { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar, MobileHeader } from "./Sidebar";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleOpenChange = useCallback(
    (open: boolean) => setSidebarOpen(open),
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Skip to main content
      </a>
      <Sidebar open={sidebarOpen} onOpenChange={handleOpenChange} />
      <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
      <main
        id="main-content"
        className="min-h-screen px-4 py-4 md:ml-64 md:px-8 md:py-6"
        role="main"
      >
        <Outlet />
      </main>
    </div>
  );
}
