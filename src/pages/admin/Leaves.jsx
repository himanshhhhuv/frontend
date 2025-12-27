import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tick02Icon,
  Cancel01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPendingLeaves, approveLeave, rejectLeave } from "@/api/warden";

export default function AdminLeaves() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["warden", "leaves", "pending ", "admin"],
    queryFn: getPendingLeaves,
  });

  const approveMutation = useMutation({
    mutationFn: approveLeave,
    onSuccess: () => {
      queryClient.invalidateQueries(["warden", "leaves"]);
      toast.success("Leave Approved", {
        description: "The leave request has been approved successfully.",
      });
    },
    onError: (error) => {
      toast.error("Failed to Approve Leave", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectLeave,
    onSuccess: () => {
      queryClient.invalidateQueries(["warden", "leaves"]);
      toast.success("Leave Rejected", {
        description: "The leave request has been rejected.",
      });
    },
    onError: (error) => {
      toast.error("Failed to Reject Leave", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  const leaves = data?.leaves || data?.data?.leaves || [];

  // Calculate duration in days
  const getDuration = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to - from);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leave Approvals</h1>
        <p className="text-muted-foreground">
          Review and manage pending leave requests from students.
        </p>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Pending Leave Requests {leaves.length > 0 && `(${leaves.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading leave requests...</p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">
                No pending leave requests.
              </p>
              <p className="text-sm text-muted-foreground">
                All leave requests have been processed.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Leave Period</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <p className="font-medium">
                          {leave.student?.profile?.name || "Unknown Student"}
                        </p>
                        <Badge variant="outline" className="w-fit">
                          {leave.student?.profile?.rollNo || "N/A"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={Calendar03Icon}
                          className="h-4 w-4 text-muted-foreground"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {formatDate(leave.fromDate)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            to {formatDate(leave.toDate)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getDuration(leave.fromDate, leave.toDate)} day
                        {getDuration(leave.fromDate, leave.toDate) !== 1
                          ? "s"
                          : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-md line-clamp-2">
                        {leave.reason || "No reason provided"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(leave.id)}
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
                          }
                        >
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            className="mr-1 h-4 w-4"
                          />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectMutation.mutate(leave.id)}
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending
                          }
                        >
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            className="mr-1 h-4 w-4"
                          />
                          Reject
                        </Button>
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
