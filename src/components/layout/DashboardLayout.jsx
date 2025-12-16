import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ role }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
