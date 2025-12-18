import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultipleIcon,
  Door01Icon,
  Notebook01Icon,
  Message01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardQuickStats({ summary, isLoading }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <HugeiconsIcon
            icon={UserMultipleIcon}
            className="h-4 w-4 text-muted-foreground"
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : summary.totalStudents || 0}
          </div>
          <p className="text-xs text-muted-foreground">Registered students</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Room Status</CardTitle>
          <HugeiconsIcon
            icon={Door01Icon}
            className="h-4 w-4 text-muted-foreground"
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading
              ? "..."
              : `${summary.occupiedRooms || 0}/${summary.totalRooms || 0}`}
          </div>
          <p className="text-xs text-muted-foreground">
            {summary.availableRooms || 0} rooms available
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
          <HugeiconsIcon
            icon={Notebook01Icon}
            className="h-4 w-4 text-orange-500"
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-500">
            {isLoading ? "..." : summary.pendingLeaves || 0}
          </div>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Complaints
          </CardTitle>
          <HugeiconsIcon
            icon={Message01Icon}
            className="h-4 w-4 text-red-500"
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {isLoading ? "..." : summary.pendingComplaints || 0}
          </div>
          <p className="text-xs text-muted-foreground">Need attention</p>
        </CardContent>
      </Card>
    </div>
  );
}
