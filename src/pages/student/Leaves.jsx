import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Calendar03Icon,
  Search01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { getLeaves, createLeave } from "@/api/student";

const leaveSchema = z.object({
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

const statusColors = {
  PENDING:
    "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  APPROVED:
    "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  REJECTED:
    "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
};

export default function Leaves() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["student", "leaves"],
    queryFn: getLeaves,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaveSchema),
  });

  // Watch fromDate to update toDate min date
  const fromDateValue = useWatch({ control, name: "fromDate" });

  const mutation = useMutation({
    mutationFn: createLeave,
    onSuccess: () => {
      queryClient.invalidateQueries(["student", "leaves"]);
      setDialogOpen(false);
      reset();
      toast.success("Leave Request Submitted", {
        description: "Your leave request has been submitted successfully.",
      });
    },
    onError: (error) => {
      toast.error("Failed to Submit Leave Request", {
        description:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const leaves = useMemo(
    () => data?.data?.leaves || data?.leaves || [],
    [data]
  );

  // Filter leaves based on search and status
  const filteredLeaves = useMemo(() => {
    let filtered = leaves;

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((leave) => leave.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((leave) => {
        const reasonStr = leave.reason?.toLowerCase() || "";
        const statusStr = leave.status?.toLowerCase() || "";
        const fromDateStr = format(
          new Date(leave.fromDate),
          "PPP"
        ).toLowerCase();
        const toDateStr = format(new Date(leave.toDate), "PPP").toLowerCase();
        return (
          reasonStr.includes(query) ||
          statusStr.includes(query) ||
          fromDateStr.includes(query) ||
          toDateStr.includes(query)
        );
      });
    }

    return filtered;
  }, [leaves, searchQuery, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter((l) => l.status === "PENDING").length;
    const approved = leaves.filter((l) => l.status === "APPROVED").length;
    const rejected = leaves.filter((l) => l.status === "REJECTED").length;

    return { total, pending, approved, rejected };
  }, [leaves]);

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
    return format(new Date(dateString), "dd MMM yyyy");
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Leave Requests</h1>
          <p className="text-muted-foreground">
            Submit and track your leave requests.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.approved}
            </div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Leave Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Leave Request</DialogTitle>
            <DialogDescription>
              Fill in the details to submit a new leave request.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Controller
                  name="fromDate"
                  control={control}
                  render={({ field }) => {
                    const dateValue = field.value
                      ? new Date(field.value)
                      : undefined;
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <HugeiconsIcon
                              icon={Calendar03Icon}
                              className="mr-2 h-4 w-4"
                            />
                            {dateValue ? (
                              format(dateValue, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateValue}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                              }
                            }}
                            disabled={(date) =>
                              date < new Date().setHours(0, 0, 0, 0)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                {errors.fromDate && (
                  <p className="text-sm text-destructive">
                    {errors.fromDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Controller
                  name="toDate"
                  control={control}
                  render={({ field }) => {
                    const dateValue = field.value
                      ? new Date(field.value)
                      : undefined;
                    const minFromDate = fromDateValue
                      ? new Date(fromDateValue).setHours(0, 0, 0, 0)
                      : new Date().setHours(0, 0, 0, 0);
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <HugeiconsIcon
                              icon={Calendar03Icon}
                              className="mr-2 h-4 w-4"
                            />
                            {dateValue ? (
                              format(dateValue, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateValue}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                              }
                            }}
                            disabled={(date) => date < minFromDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    );
                  }}
                />
                {errors.toDate && (
                  <p className="text-sm text-destructive">
                    {errors.toDate.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for leave..."
                rows={4}
                {...register("reason")}
              />
              {errors.reason && (
                <p className="text-sm text-destructive">
                  {errors.reason.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  reset();
                }}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              Leave History{" "}
              {filteredLeaves.length > 0 && `(${filteredLeaves.length})`}
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="relative flex-1 max-w-sm">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search by reason or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={FilterIcon}
                  className="h-4 w-4 text-muted-foreground"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading leave requests...</p>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "ALL"
                  ? "No leave requests found matching your criteria."
                  : "No leave requests found."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setDialogOpen(true)}
              >
                <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
                Create Leave Request
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Period</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon
                            icon={Calendar03Icon}
                            className="h-4 w-4 text-muted-foreground"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
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
                      <TableCell>
                        {leave.createdAt
                          ? format(new Date(leave.createdAt), "dd MMM yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
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
