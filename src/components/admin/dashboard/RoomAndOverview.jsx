import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultipleIcon,
  Notebook01Icon,
  Message01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function DashboardRoomAndOverview({ summary }) {
  const totalRooms = summary.totalRooms || 0;
  const occupiedRooms = summary.occupiedRooms || 0;
  const availableRooms = summary.availableRooms || 0;
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const attendance = summary.attendanceToday || {};

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Room Occupancy */}
      <Card>
        <CardHeader>
          <CardTitle>Room Occupancy</CardTitle>
          <CardDescription>Current room allocation status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Occupancy Rate
            </span>
            <span className="text-sm font-medium">{occupancyRate}%</span>
          </div>
          <Progress
            value={totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0}
            className="h-2"
          />
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalRooms}</div>
              <div className="text-xs text-muted-foreground">Total Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {occupiedRooms}
              </div>
              <div className="text-xs text-muted-foreground">Occupied</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {availableRooms}
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Overview</CardTitle>
          <CardDescription>Key metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                  <HugeiconsIcon
                    icon={UserMultipleIcon}
                    className="h-4 w-4 text-blue-600"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Students</p>
                  <p className="text-xs text-muted-foreground">
                    Total registered
                  </p>
                </div>
              </div>
              <span className="text-xl font-bold">
                {summary.totalStudents || 0}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/30">
                  <HugeiconsIcon
                    icon={Notebook01Icon}
                    className="h-4 w-4 text-orange-600"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Pending Leaves</p>
                  <p className="text-xs text-muted-foreground">
                    Awaiting review
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-orange-600">
                {summary.pendingLeaves || 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                  <HugeiconsIcon
                    icon={Message01Icon}
                    className="h-4 w-4 text-red-600"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Open Complaints</p>
                  <p className="text-xs text-muted-foreground">
                    Need attention
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-red-600">
                {summary.pendingComplaints || 0}
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    className="h-4 w-4 text-green-600"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">Attendance Today</p>
                  <p className="text-xs text-muted-foreground">
                    {attendance.percentage || 0}% present
                  </p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-600">
                {attendance.present || 0}/{attendance.total || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
