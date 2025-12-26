import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getAttendance } from "@/api/student";

const statusColors = {
  PRESENT:
    "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  ABSENT:
    "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  LATE: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
};

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["student", "attendance"],
    queryFn: getAttendance,
  });

  const attendance = useMemo(
    () => data?.data?.attendance || data?.attendance || [],
    [data]
  );

  // Filter attendance based on selected date and search
  const filteredAttendance = useMemo(() => {
    let filtered = attendance;

    // Filter by date if selected
    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      filtered = filtered.filter((record) => {
        const recordDate = format(new Date(record.date), "yyyy-MM-dd");
        return recordDate === dateString;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((record) => {
        const dateStr = format(new Date(record.date), "PPP").toLowerCase();
        const statusStr = record.status?.toLowerCase() || "";
        return dateStr.includes(query) || statusStr.includes(query);
      });
    }

    return filtered;
  }, [attendance, selectedDate, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter((r) => r.status === "PRESENT").length;
    const absent = attendance.filter((r) => r.status === "ABSENT").length;
    const late = attendance.filter((r) => r.status === "LATE").length;
    const percentage = total > 0 ? ((present + late) / total) * 100 : 0;

    return { total, present, absent, late, percentage };
  }, [attendance]);

  const getStatusBadge = (status) => {
    return (
      <Badge className={statusColors[status] || ""} variant="outline">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Attendance History
          </h1>
          <p className="text-muted-foreground">
            View your attendance records and statistics.
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-[200px] justify-start text-left font-normal"
            >
              <HugeiconsIcon icon={CalendarIcon} className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
            {selectedDate && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedDate(undefined)}
                >
                  Clear date filter
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.present}
            </div>
            <p className="text-xs text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.absent}
            </div>
            <p className="text-xs text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.late}
            </div>
            <p className="text-xs text-muted-foreground">Late</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {stats.percentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Attendance Records</CardTitle>
            <Input
              placeholder="Search by date or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading attendance...
            </div>
          ) : filteredAttendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {selectedDate || searchQuery
                ? "No attendance records found for the selected criteria."
                : "No attendance records found."}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>In Time</TableHead>
                    <TableHead>Out Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {format(new Date(record.date), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(record.date), "EEEE")}
                      </TableCell>
                      <TableCell>
                        {record.inTime
                          ? format(new Date(record.inTime), "hh:mm a")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {record.outTime
                          ? format(new Date(record.outTime), "hh:mm a")
                          : "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
