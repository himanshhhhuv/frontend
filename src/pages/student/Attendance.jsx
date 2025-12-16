import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAttendance } from "@/api/student";

export default function Attendance() {
  const { data, isLoading } = useQuery({
    queryKey: ["student", "attendance"],
    queryFn: getAttendance,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading attendance...</div>;
  }

  const attendance = data?.attendance || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Attendance History</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <p className="text-muted-foreground">
              No attendance records found.
            </p>
          ) : (
            <div className="space-y-3">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(record.date).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      In:{" "}
                      {record.inTime
                        ? new Date(record.inTime).toLocaleTimeString()
                        : "N/A"}{" "}
                      | Out:{" "}
                      {record.outTime
                        ? new Date(record.outTime).toLocaleTimeString()
                        : "N/A"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      record.status === "PRESENT"
                        ? "default"
                        : record.status === "LATE"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
