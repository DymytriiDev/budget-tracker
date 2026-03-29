import { NavLink, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Receipt,
  FolderOpen,
  Target,
  Users,
  Settings,
  DollarSign,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/categories", label: "Categories", icon: FolderOpen },
  { to: "/budgets", label: "Budgets", icon: Target },
  { to: "/owners", label: "Owners", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const location = useLocation();

  // Close on route change (mobile)
  useEffect(() => {
    onOpenChange(false);
  }, [location.pathname, onOpenChange]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  // Prevent body scroll when mobile drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const navContent = (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-border px-4 md:px-6 md:h-16">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
          aria-hidden="true"
        >
          <DollarSign className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">
          Budget
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-9 w-9 md:hidden"
          onClick={() => onOpenChange(false)}
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-3 md:p-4" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 min-h-[44px]",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )
            }
            aria-current={
              location.pathname === item.to ||
              (item.to === "/" && location.pathname === "/")
                ? "page"
                : undefined
            }
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-sidebar md:flex"
        role="navigation"
      >
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-screen w-72 flex-col border-l border-border bg-sidebar transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {navContent}
      </aside>
    </>
  );
}

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex flex-row-reverse justify-between sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Link to="/" className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md bg-primary"
          aria-hidden="true"
        >
          <DollarSign className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">Budget</span>
      </Link>
    </header>
  );
}
