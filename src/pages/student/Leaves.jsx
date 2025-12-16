import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getLeaves, createLeave } from "@/api/student";

const leaveSchema = z.object({
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export default function Leaves() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["student", "leaves"],
    queryFn: getLeaves,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaveSchema),
  });

  const mutation = useMutation({
    mutationFn: createLeave,
    onSuccess: () => {
      queryClient.invalidateQueries(["student", "leaves"]);
      setShowForm(false);
      reset();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const leaves = data?.leaves || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leave Requests</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Request"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Leave Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input type="date" id="fromDate" {...register("fromDate")} />
                  {errors.fromDate && (
                    <p className="text-sm text-destructive">
                      {errors.fromDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toDate">To Date</Label>
                  <Input type="date" id="toDate" {...register("toDate")} />
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
                  {...register("reason")}
                />
                {errors.reason && (
                  <p className="text-sm text-destructive">
                    {errors.reason.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : leaves.length === 0 ? (
            <p className="text-muted-foreground">No leave requests found.</p>
          ) : (
            <div className="space-y-3">
              {leaves.map((leave) => (
                <div key={leave.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {new Date(leave.fromDate).toLocaleDateString()} -{" "}
                        {new Date(leave.toDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {leave.reason}
                      </p>
                    </div>
                    <Badge
                      variant={
                        leave.status === "APPROVED"
                          ? "default"
                          : leave.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {leave.status}
                    </Badge>
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
