import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getComplaints } from "@/api/caretaker";

export default function Complaints() {
  const [filter, setFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["caretaker", "complaints", filter],
    queryFn: () => getComplaints(filter),
  });

  const complaints = data?.complaints || [];

  const getStatusColor = (status) => {
    switch (status) {
      case "RESOLVED":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">View Complaints</h1>
        <div className="flex gap-2">
          {["", "PENDING", "IN_PROGRESS", "RESOLVED"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status || "All"}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaints List (Read Only)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="text-muted-foreground">No complaints found.</p>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{complaint.title}</p>
                        <Badge variant={getStatusColor(complaint.status)}>
                          {complaint.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        By: {complaint.student?.profile?.name} (
                        {complaint.student?.profile?.rollNo})
                        {complaint.student?.room &&
                          ` | Room: ${complaint.student.room.roomNo}`}
                      </p>
                      <p className="text-sm mt-2">{complaint.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created:{" "}
                        {new Date(complaint.createdAt).toLocaleDateString()}
                        {complaint.resolvedAt && (
                          <>
                            {" "}
                            | Resolved:{" "}
                            {new Date(
                              complaint.resolvedAt
                            ).toLocaleDateString()}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
