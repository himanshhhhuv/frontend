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
import { getComplaints, createComplaint } from "@/api/student";

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
});

export default function Complaints() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["student", "complaints"],
    queryFn: getComplaints,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(complaintSchema),
  });

  const mutation = useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries(["student", "complaints"]);
      setShowForm(false);
      reset();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

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
        <h1 className="text-3xl font-bold">Complaints</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Complaint"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief title of the issue"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail..."
                  rows={4}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting..." : "Submit Complaint"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>My Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : complaints.length === 0 ? (
            <p className="text-muted-foreground">No complaints found.</p>
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{complaint.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {complaint.description}
                      </p>
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
                    <Badge variant={getStatusColor(complaint.status)}>
                      {complaint.status}
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
