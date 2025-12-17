import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAdd01Icon,
  Delete02Icon,
  FilterIcon,
  Search01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUsers, createUser, deleteUser, updateUserRole } from "@/api/admin";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rollNo: z.string().min(1, "Roll number is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  course: z.string().min(1, "Course is required"),
  year: z.string().min(1, "Year is required"),
  role: z.string().min(1, "Role is required"),
});

const roles = [
  { value: "STUDENT", label: "Student" },
  { value: "WARDEN", label: "Warden" },
  { value: "ADMIN", label: "Admin" },
  { value: "CANTEEN_MANAGER", label: "Canteen Manager" },
  { value: "CARETAKER", label: "Caretaker" },
];

const getRoleBadgeVariant = (role) => {
  switch (role) {
    case "ADMIN":
      return "destructive";
    case "WARDEN":
      return "default";
    case "CANTEEN_MANAGER":
      return "secondary";
    case "CARETAKER":
      return "outline";
    default:
      return "outline";
  }
};

export default function Users() {
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  // Role change dialog state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Handler for role filter change - also resets page
  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    setPage(1);
  };

  // Handler for search input change - also resets page
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", roleFilter, debouncedSearch, page, limit],
    queryFn: () =>
      getUsers({
        role: roleFilter === "ALL" ? undefined : roleFilter,
        search: debouncedSearch || undefined,
        page,
        limit,
      }),
  });

  const pagination = data?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { role: "STUDENT", year: "1" },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "users"]);
      setAddUserDialogOpen(false);
      reset();
      toast.success("User Created", {
        description: "The new user has been created successfully.",
      });
    },
    onError: (error) => {
      toast.error("Failed to Create User", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "users"]);
      toast.success("User Deleted", {
        description: "The user has been removed successfully.",
      });
    },
    onError: (error) => {
      toast.error("Failed to Delete User", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => updateUserRole(id, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries(["admin", "users"]);
      setRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole("");
      toast.success("Role Updated", {
        description: data.message || "User role has been updated successfully.",
      });
    },
    onError: (error) => {
      toast.error("Failed to Update Role", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  const users = data?.data?.users || [];

  // Open role change dialog
  const openRoleDialog = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  // Confirm role change
  const handleRoleChange = () => {
    if (selectedUser && newRole && newRole !== selectedUser.role) {
      updateRoleMutation.mutate({ id: selectedUser.id, role: newRole });
    }
  };

  const onSubmit = (data) => {
    createMutation.mutate({ ...data, year: parseInt(data.year) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">
            Create and manage user accounts for the hostel system.
          </p>
        </div>
        <Button onClick={() => setAddUserDialogOpen(true)}>
          <HugeiconsIcon icon={UserAdd01Icon} className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search by name, email, or roll no..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={FilterIcon}
            className="h-4 w-4 text-muted-foreground"
          />
          <span className="text-sm font-medium">Role:</span>
          <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Users {pagination.total > 0 && `(${pagination.total})`}
          </CardTitle>
          {pagination.total > 0 && (
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}-
              {Math.min(page * limit, pagination.total)} of {pagination.total}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No users found.</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filter or create a new user.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.profile?.name || "No name"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.profile?.rollNo || "-"}</TableCell>
                      <TableCell>{user.profile?.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={getRoleBadgeVariant(user.role)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openRoleDialog(user)}
                        >
                          {user.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={deleteMutation.isPending}
                              />
                            }
                          >
                            <HugeiconsIcon
                              icon={Delete02Icon}
                              className="mr-1 h-4 w-4"
                            />
                            Delete
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>
                                  {user.profile?.name || user.email}
                                </strong>
                                ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => deleteMutation.mutate(user.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {pagination.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || isLoading}
                    >
                      <HugeiconsIcon
                        icon={ArrowLeft01Icon}
                        className="mr-1 h-4 w-4"
                      />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(pagination.totalPages, p + 1))
                      }
                      disabled={page >= pagination.totalPages || isLoading}
                    >
                      Next
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className="ml-1 h-4 w-4"
                      />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for{" "}
              <strong>
                {selectedUser?.profile?.name || selectedUser?.email}
              </strong>
              . This will change their permissions in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <Badge variant={getRoleBadgeVariant(selectedUser?.role)}>
                {selectedUser?.role?.replace("_", " ")}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newRole">New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select new role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={updateRoleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={
                updateRoleMutation.isPending ||
                newRole === selectedUser?.role ||
                !newRole
              }
            >
              {updateRoleMutation.isPending ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog
        open={addUserDialogOpen}
        onOpenChange={(open) => {
          setAddUserDialogOpen(open);
          if (!open) reset();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the hostel management system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role && (
                  <p className="text-sm text-destructive">
                    {errors.role.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input
                  id="rollNo"
                  placeholder="2024001"
                  {...register("rollNo")}
                />
                {errors.rollNo && (
                  <p className="text-sm text-destructive">
                    {errors.rollNo.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="9876543210"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  placeholder="B.Tech CSE"
                  {...register("course")}
                />
                {errors.course && (
                  <p className="text-sm text-destructive">
                    {errors.course.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Controller
                  name="year"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((year) => (
                          <SelectItem key={year} value={String(year)}>
                            Year {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.year && (
                  <p className="text-sm text-destructive">
                    {errors.year.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAddUserDialogOpen(false);
                  reset();
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
