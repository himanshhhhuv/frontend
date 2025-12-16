import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPendingLeaves, approveLeave, rejectLeave } from "@/api/warden";

export default function Leaves() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["warden", "leaves", "pending"],
    queryFn: getPendingLeaves,
  });

  const approveMutation = useMutation({
    mutationFn: approveLeave,
    onSuccess: () => queryClient.invalidateQueries(["warden", "leaves"]),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectLeave,
    onSuccess: () => queryClient.invalidateQueries(["warden", "leaves"]),
  });

  const leaves = data?.leaves || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Leave Approvals</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : leaves.length === 0 ? (
            <p className="text-muted-foreground">No pending leave requests.</p>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave) => (
                <div key={leave.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {leave.student?.profile?.name || "Unknown Student"}
                        </p>
                        <Badge variant="outline">
                          {leave.student?.profile?.rollNo}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(leave.fromDate).toLocaleDateString()} -{" "}
                        {new Date(leave.toDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-2">{leave.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(leave.id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(leave.id)}
                        disabled={rejectMutation.isPending}
                      >
                        Reject
                      </Button>
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
