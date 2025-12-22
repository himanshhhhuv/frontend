import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/api/warden";

export default function WardenDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["warden", "dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const stats = data?.data || {};
  const cards = stats.cards || {};

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Warden Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Leaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : cards.pendingLeaves ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : `${
                    cards.attendancePercentage?.toFixed?.(1) ??
                    cards.attendancePercentage ??
                    0
                  }%`}
            </div>
            <p className="text-xs text-muted-foreground">Present today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Open Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : cards.openComplaints ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending + In Progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : cards.totalStudents ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">In hostel</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
