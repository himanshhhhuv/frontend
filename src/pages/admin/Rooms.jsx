import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRoom, assignRoom } from "@/api/admin";

const roomSchema = z.object({
  roomNo: z.string().min(1, "Room number is required"),
  floor: z.string().min(1, "Floor is required"),
  capacity: z.string().min(1, "Capacity is required"),
});

const assignSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
});

export default function Rooms() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const queryClient = useQueryClient();

  const createForm = useForm({
    resolver: zodResolver(roomSchema),
  });

  const assignForm = useForm({
    resolver: zodResolver(assignSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      createRoom({
        ...data,
        floor: parseInt(data.floor),
        capacity: parseInt(data.capacity),
      }),
    onSuccess: () => {
      setMessage({ type: "success", text: "Room created successfully!" });
      createForm.reset();
      setShowCreateForm(false);
    },
    onError: (err) => {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create room",
      });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (data) => assignRoom(data.roomId, data.studentId),
    onSuccess: () => {
      setMessage({ type: "success", text: "Room assigned successfully!" });
      assignForm.reset();
      setShowAssignForm(false);
    },
    onError: (err) => {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to assign room",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Rooms</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowAssignForm(false);
            }}
          >
            {showCreateForm ? "Cancel" : "Create Room"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowAssignForm(!showAssignForm);
              setShowCreateForm(false);
            }}
          >
            {showAssignForm ? "Cancel" : "Assign Room"}
          </Button>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-3 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Room</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={createForm.handleSubmit((data) =>
                createMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input placeholder="101" {...createForm.register("roomNo")} />
                  {createForm.formState.errors.roomNo && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.roomNo.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Floor</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="1"
                    {...createForm.register("floor")}
                  />
                  {createForm.formState.errors.floor && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.floor.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="2"
                    {...createForm.register("capacity")}
                  />
                  {createForm.formState.errors.capacity && (
                    <p className="text-sm text-destructive">
                      {createForm.formState.errors.capacity.message}
                    </p>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Room"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {showAssignForm && (
        <Card>
          <CardHeader>
            <CardTitle>Assign Room to Student</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={assignForm.handleSubmit((data) =>
                assignMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room ID</Label>
                  <Input
                    placeholder="Room ID"
                    {...assignForm.register("roomId")}
                  />
                  {assignForm.formState.errors.roomId && (
                    <p className="text-sm text-destructive">
                      {assignForm.formState.errors.roomId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input
                    placeholder="Student ID"
                    {...assignForm.register("studentId")}
                  />
                  {assignForm.formState.errors.studentId && (
                    <p className="text-sm text-destructive">
                      {assignForm.formState.errors.studentId.message}
                    </p>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={assignMutation.isPending}>
                {assignMutation.isPending ? "Assigning..." : "Assign Room"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
