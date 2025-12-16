import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// Student pages
import StudentDashboard from "@/pages/student/Dashboard";
import StudentAttendance from "@/pages/student/Attendance";
import StudentWallet from "@/pages/student/Wallet";
import StudentLeaves from "@/pages/student/Leaves";
import StudentComplaints from "@/pages/student/Complaints";
import StudentMenu from "@/pages/student/Menu";
import StudentProfile from "@/pages/student/Profile";

// Warden pages
import WardenDashboard from "@/pages/warden/Dashboard";
import WardenLeaves from "@/pages/warden/Leaves";
import WardenAttendance from "@/pages/warden/Attendance";
import WardenComplaints from "@/pages/warden/Complaints";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminRooms from "@/pages/admin/Rooms";
import AdminMenu from "@/pages/admin/Menu";
import AdminTransactions from "@/pages/admin/Transactions";

// Canteen pages
import CanteenDashboard from "@/pages/canteen/Dashboard";
import CanteenBilling from "@/pages/canteen/Billing";
import CanteenOrders from "@/pages/canteen/Orders";
import CanteenMenu from "@/pages/canteen/Menu";

// Caretaker pages
import CaretakerDashboard from "@/pages/caretaker/Dashboard";
import CaretakerComplaints from "@/pages/caretaker/Complaints";

// Layouts
import DashboardLayout from "@/components/layout/DashboardLayout";

// Shared components
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student Routes */}
          <Route element={<ProtectedRoute roles={["STUDENT"]} />}>
            <Route path="/student" element={<DashboardLayout role="STUDENT" />}>
              <Route index element={<StudentDashboard />} />
              <Route path="attendance" element={<StudentAttendance />} />
              <Route path="wallet" element={<StudentWallet />} />
              <Route path="leaves" element={<StudentLeaves />} />
              <Route path="complaints" element={<StudentComplaints />} />
              <Route path="menu" element={<StudentMenu />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>
          </Route>

          {/* Warden Routes */}
          <Route element={<ProtectedRoute roles={["WARDEN", "ADMIN"]} />}>
            <Route path="/warden" element={<DashboardLayout role="WARDEN" />}>
              <Route index element={<WardenDashboard />} />
              <Route path="leaves" element={<WardenLeaves />} />
              <Route path="attendance" element={<WardenAttendance />} />
              <Route path="complaints" element={<WardenComplaints />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="/admin" element={<DashboardLayout role="ADMIN" />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="rooms" element={<AdminRooms />} />
              <Route path="menu" element={<AdminMenu />} />
              <Route path="transactions" element={<AdminTransactions />} />
            </Route>
          </Route>

          {/* Canteen Manager Routes */}
          <Route
            element={<ProtectedRoute roles={["CANTEEN_MANAGER", "ADMIN"]} />}
          >
            <Route
              path="/canteen"
              element={<DashboardLayout role="CANTEEN_MANAGER" />}
            >
              <Route index element={<CanteenDashboard />} />
              <Route path="billing" element={<CanteenBilling />} />
              <Route path="orders" element={<CanteenOrders />} />
              <Route path="menu" element={<CanteenMenu />} />
            </Route>
          </Route>

          {/* Caretaker Routes */}
          <Route element={<ProtectedRoute roles={["CARETAKER"]} />}>
            <Route
              path="/caretaker"
              element={<DashboardLayout role="CARETAKER" />}
            >
              <Route index element={<CaretakerDashboard />} />
              <Route path="complaints" element={<CaretakerComplaints />} />
            </Route>
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
