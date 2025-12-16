import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

const navItems = {
  STUDENT: [
    { label: "Dashboard", path: "/student", icon: "🏠" },
    { label: "Attendance", path: "/student/attendance", icon: "📋" },
    { label: "Wallet", path: "/student/wallet", icon: "💰" },
    { label: "Leaves", path: "/student/leaves", icon: "📝" },
    { label: "Complaints", path: "/student/complaints", icon: "📢" },
    { label: "Menu", path: "/student/menu", icon: "🍽️" },
    { label: "Profile", path: "/student/profile", icon: "👤" },
  ],
  WARDEN: [
    { label: "Dashboard", path: "/warden", icon: "🏠" },
    { label: "Leave Approvals", path: "/warden/leaves", icon: "📝" },
    { label: "Attendance", path: "/warden/attendance", icon: "📋" },
    { label: "Complaints", path: "/warden/complaints", icon: "📢" },
  ],
  ADMIN: [
    { label: "Dashboard", path: "/admin", icon: "🏠" },
    { label: "Users", path: "/admin/users", icon: "👥" },
    { label: "Rooms", path: "/admin/rooms", icon: "🛏️" },
    { label: "Menu", path: "/admin/menu", icon: "🍽️" },
    { label: "Transactions", path: "/admin/transactions", icon: "💳" },
  ],
  CANTEEN_MANAGER: [
    { label: "Dashboard", path: "/canteen", icon: "🏠" },
    { label: "Billing", path: "/canteen/billing", icon: "💵" },
    { label: "Orders", path: "/canteen/orders", icon: "📦" },
    { label: "Menu", path: "/canteen/menu", icon: "🍽️" },
  ],
  CARETAKER: [
    { label: "Dashboard", path: "/caretaker", icon: "🏠" },
    { label: "Complaints", path: "/caretaker/complaints", icon: "📢" },
  ],
};

export default function Sidebar({ role }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const items = navItems[role] || [];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          Hostel HMS
        </h1>
        <p className="text-sm text-sidebar-foreground/70 mt-1">
          {role.replace("_", " ")}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground font-medium">
            {user?.profile?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.profile?.name || "User"}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}
