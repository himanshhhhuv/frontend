import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Calendar03Icon,
  Wallet01Icon,
  Notebook01Icon,
  Message01Icon,
  Menu01Icon,
  UserCircleIcon,
  UserMultipleIcon,
  Door01Icon,
  CreditCardIcon,
  Invoice01Icon,
  ShoppingCart01Icon,
  Settings01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/authStore";

// Navigation items per role
const navConfig = {
  STUDENT: {
    title: "Student Portal",
    items: [
      { label: "Dashboard", path: "/student", icon: Home01Icon },
      {
        label: "Attendance",
        path: "/student/attendance",
        icon: Calendar03Icon,
      },
      { label: "Wallet", path: "/student/wallet", icon: Wallet01Icon },
      { label: "Leaves", path: "/student/leaves", icon: Notebook01Icon },
      { label: "Complaints", path: "/student/complaints", icon: Message01Icon },
      { label: "Menu", path: "/student/menu", icon: Menu01Icon },
      { label: "Profile", path: "/student/profile", icon: UserCircleIcon },
    ],
  },
  WARDEN: {
    title: "Warden Portal",
    items: [
      { label: "Dashboard", path: "/warden", icon: Home01Icon },
      {
        label: "Leave Approvals",
        path: "/warden/leaves",
        icon: Notebook01Icon,
      },
      { label: "Attendance", path: "/warden/attendance", icon: Calendar03Icon },
      { label: "Complaints", path: "/warden/complaints", icon: Message01Icon },
    ],
  },
  ADMIN: {
    title: "Admin Portal",
    items: [
      { label: "Dashboard", path: "/admin", icon: Home01Icon },
      { label: "Users", path: "/admin/users", icon: UserMultipleIcon },
      { label: "Rooms", path: "/admin/rooms", icon: Door01Icon },
      { label: "Menu", path: "/admin/menu", icon: Menu01Icon },
      {
        label: "Transactions",
        path: "/admin/transactions",
        icon: CreditCardIcon,
      },
    ],
  },
  CANTEEN_MANAGER: {
    title: "Canteen Portal",
    items: [
      { label: "Dashboard", path: "/canteen", icon: Home01Icon },
      { label: "Billing", path: "/canteen/billing", icon: Invoice01Icon },
      { label: "Orders", path: "/canteen/orders", icon: ShoppingCart01Icon },
      { label: "Menu", path: "/canteen/menu", icon: Menu01Icon },
    ],
  },
  CARETAKER: {
    title: "Caretaker Portal",
    items: [
      { label: "Dashboard", path: "/caretaker", icon: Home01Icon },
      {
        label: "Complaints",
        path: "/caretaker/complaints",
        icon: Message01Icon,
      },
    ],
  },
};

function AppSidebar({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const config = navConfig[role] || navConfig.STUDENT;

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                <HugeiconsIcon
                  icon={Home01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Hostel HMS</span>
                <span className="truncate text-xs text-muted-foreground">
                  {config.title}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {config.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={isActive}
                      onClick={() => navigate(item.path)}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user?.profile?.name?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.profile?.name || "User"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg">
                          {user?.profile?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user?.profile?.name || "User"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function SiteHeader({ title }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-2 h-4" />
      <h1 className="text-base font-medium">{title}</h1>
    </header>
  );
}

export default function DashboardLayout({ role }) {
  const config = navConfig[role] || navConfig.STUDENT;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "16rem",
        "--header-height": "3.5rem",
      }}
    >
      <AppSidebar role={role} />
      <SidebarInset>
        <SiteHeader title={config.title} />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
