import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterIcon,
  UserIcon,
  Door01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getComplaints } from "@/api/caretaker";

export default function Complaints() {
  const [filter, setFilter] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["caretaker", "complaints", filter],
    queryFn: () => getComplaints(filter === "ALL" ? "" : filter),
  });

  const complaints = data?.complaints || data?.data?.complaints || [];

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "RESOLVED":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      case "PENDING":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? "Just now" : `${diffMins} minutes ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return formatDate(dateString);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">View Complaints</h1>
        <p className="text-muted-foreground">
          View and monitor student complaints and issues.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <HugeiconsIcon
          icon={FilterIcon}
          className="h-4 w-4 text-muted-foreground"
        />
        <span className="text-sm font-medium">Status:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Complaints</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Complaints Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Complaints {complaints.length > 0 && `(${complaints.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No complaints found.</p>
              <p className="text-sm text-muted-foreground">
                {filter === "ALL"
                  ? "There are no complaints to display."
                  : `No ${filter
                      .toLowerCase()
                      .replace("_", " ")} complaints found.`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">
                      {complaint.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <HugeiconsIcon
                            icon={UserIcon}
                            className="h-3 w-3 text-muted-foreground"
                          />
                          <span className="text-sm">
                            {complaint.student?.profile?.name ||
                              "Unknown Student"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {complaint.student?.profile?.rollNo || "N/A"}
                          </Badge>
                          {complaint.student?.room && (
                            <div className="flex items-center gap-1">
                              <HugeiconsIcon
                                icon={Door01Icon}
                                className="h-3 w-3 text-muted-foreground"
                              />
                              <span className="text-xs text-muted-foreground">
                                {complaint.student.room.roomNo}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-md line-clamp-2">
                        {complaint.description || "No description provided"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(complaint.status)}>
                        {complaint.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <HugeiconsIcon
                          icon={Calendar03Icon}
                          className="h-3 w-3 text-muted-foreground"
                        />
                        <span className="text-xs text-muted-foreground">
                          {getRelativeTime(complaint.createdAt)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
