import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getUsers, createUser, deleteUser } from "@/api/admin";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  rollNo: z.string().min(1),
  phone: z.string().min(10),
  course: z.string().min(1),
  year: z.string().min(1),
  role: z.string(),
});

export default function Users() {
  const [showForm, setShowForm] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", roleFilter],
    queryFn: () => getUsers({ role: roleFilter || undefined }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { role: "STUDENT" },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "users"]);
      setShowForm(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries(["admin", "users"]),
  });

  const users = data?.data?.users || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add User"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((data) =>
                createMutation.mutate({ ...data, year: parseInt(data.year) })
              )}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" {...register("email")} />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" {...register("password")} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    {...register("role")}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="WARDEN">Warden</option>
                    <option value="ADMIN">Admin</option>
                    <option value="CANTEEN_MANAGER">Canteen Manager</option>
                    <option value="CARETAKER">Caretaker</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Roll No</Label>
                  <Input {...register("rollNo")} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input {...register("phone")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Input {...register("course")} />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" min="1" max="5" {...register("year")} />
                </div>
              </div>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mb-4">
        {["", "STUDENT", "WARDEN", "ADMIN", "CANTEEN_MANAGER", "CARETAKER"].map(
          (role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(role)}
            >
              {role || "All"}
            </Button>
          )
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">No users found.</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {user.profile?.name || "No name"}
                      </p>
                      <Badge>{user.role}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Roll: {user.profile?.rollNo} | Phone:{" "}
                      {user.profile?.phone}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(user.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
