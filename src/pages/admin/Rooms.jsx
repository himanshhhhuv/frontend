import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  FilterIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  UserAdd01Icon,
  Delete02Icon,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { createRoom, getRooms, assignRoom, unassignRoom } from "@/api/admin";

const roomSchema = z.object({
  roomNo: z.string().min(1, "Room number is required"),
  floor: z.string().min(1, "Floor is required"),
  capacity: z.string().min(1, "Capacity is required"),
});

const assignSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
});

export default function Rooms() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [floorFilter, setFloorFilter] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;
  const queryClient = useQueryClient();

  // Fetch rooms with pagination and filters
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "rooms", floorFilter, availabilityFilter, page, limit],
    queryFn: () =>
      getRooms({
        floor: floorFilter === "ALL" ? undefined : parseInt(floorFilter),
        onlyAvailable: availabilityFilter === "AVAILABLE" ? true : undefined,
        page,
        limit,
      }),
  });

  const rooms = data?.data?.rooms || [];
  const pagination = data?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const createForm = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: { roomNo: "", floor: "", capacity: "" },
  });

  const assignForm = useForm({
    resolver: zodResolver(assignSchema),
    defaultValues: { studentId: "" },
  });

  // Create room mutation
  const createMutation = useMutation({
    mutationFn: (formData) =>
      createRoom({
        roomNo: formData.roomNo,
        floor: parseInt(formData.floor),
        capacity: parseInt(formData.capacity),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "rooms"]);
      setCreateDialogOpen(false);
      createForm.reset();
      toast.success("Room Created", {
        description: "The new room has been created successfully.",
      });
    },
    onError: (error) => {
      toast.error("Failed to Create Room", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  // Assign room mutation
  const assignMutation = useMutation({
    mutationFn: ({ roomId, studentId }) => assignRoom(roomId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "rooms"]);
      setAssignDialogOpen(false);
      setSelectedRoom(null);
      assignForm.reset();
      toast.success("Room Assigned", {
        description: "The student has been assigned to the room successfully.",
      });
    },
    onError: (error) => {
      toast.error("Failed to Assign Room", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  // Unassign room mutation
  const unassignMutation = useMutation({
    mutationFn: ({ roomId, studentId }) => unassignRoom(roomId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin", "rooms"]);
      toast.success("Student Removed", {
        description: "The student has been removed from the room.",
      });
    },
    onError: (error) => {
      toast.error("Failed to Remove Student", {
        description: error.response?.data?.message || "Something went wrong.",
      });
    },
  });

  const handleFloorFilterChange = (value) => {
    setFloorFilter(value);
    setPage(1);
  };

  const handleAvailabilityFilterChange = (value) => {
    setAvailabilityFilter(value);
    setPage(1);
  };

  const openAssignDialog = (room) => {
    setSelectedRoom(room);
    setAssignDialogOpen(true);
  };

  const onCreateSubmit = (data) => {
    createMutation.mutate(data);
  };

  const onAssignSubmit = (data) => {
    if (selectedRoom) {
      assignMutation.mutate({ roomId: selectedRoom.id, studentId: data.studentId });
    }
  };

  const getOccupancyBadge = (room) => {
    const available = room.capacity - room.occupied;
    if (available === 0) {
      return <Badge variant="destructive">Full</Badge>;
    } else if (available <= room.capacity / 2) {
      return <Badge variant="secondary">{available} spots left</Badge>;
    }
    return <Badge variant="outline">{available} spots left</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Rooms</h1>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 h-4 w-4" />
          Create Room
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Floor:</span>
          <Select value={floorFilter} onValueChange={handleFloorFilterChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="All floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Floors</SelectItem>
              {[0, 1, 2, 3, 4, 5].map((floor) => (
                <SelectItem key={floor} value={String(floor)}>
                  Floor {floor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Availability:</span>
          <Select value={availabilityFilter} onValueChange={handleAvailabilityFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All rooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Rooms</SelectItem>
              <SelectItem value="AVAILABLE">Available Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rooms Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Rooms {pagination.total > 0 && `(${pagination.total})`}
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
              <p className="text-muted-foreground">Loading rooms...</p>
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No rooms found.</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or create a new room.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room No</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.roomNo}</TableCell>
                      <TableCell>Floor {room.floor}</TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>
                        {room.occupied}/{room.capacity} {getOccupancyBadge(room)}
                      </TableCell>
                      <TableCell>
                        {room.students && room.students.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {room.students.map((student) => (
                              <AlertDialog key={student.id}>
                                <AlertDialogTrigger asChild>
                                  <Badge
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                  >
                                    {student.profile?.name || student.email}
                                    <HugeiconsIcon
                                      icon={Delete02Icon}
                                      className="ml-1 h-3 w-3"
                                    />
                                  </Badge>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Student</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove{" "}
                                      <strong>{student.profile?.name || student.email}</strong>{" "}
                                      from room <strong>{room.roomNo}</strong>?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      variant="destructive"
                                      onClick={() =>
                                        unassignMutation.mutate({
                                          roomId: room.id,
                                          studentId: student.id,
                                        })
                                      }
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No students</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignDialog(room)}
                          disabled={room.occupied >= room.capacity}
                        >
                          <HugeiconsIcon icon={UserAdd01Icon} className="mr-1 h-4 w-4" />
                          Assign
                        </Button>
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
                      <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-1 h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={page >= pagination.totalPages || isLoading}
                    >
                      Next
                      <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Room Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) createForm.reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Room</DialogTitle>
            <DialogDescription>
              Add a new room to the hostel management system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="roomNo">Room Number</Label>
                <Input id="roomNo" placeholder="A101" {...createForm.register("roomNo")} />
                {createForm.formState.errors.roomNo && (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.roomNo.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
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
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  placeholder="4"
                  {...createForm.register("capacity")}
                />
                {createForm.formState.errors.capacity && (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.capacity.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  createForm.reset();
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Room Dialog */}
      <Dialog
        open={assignDialogOpen}
        onOpenChange={(open) => {
          setAssignDialogOpen(open);
          if (!open) {
            setSelectedRoom(null);
            assignForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Student to Room</DialogTitle>
            <DialogDescription>
              Assign a student to room <strong>{selectedRoom?.roomNo}</strong>.
              This room has {selectedRoom?.capacity - selectedRoom?.occupied} spot(s) available.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={assignForm.handleSubmit(onAssignSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                placeholder="Enter student ID (UUID)"
                {...assignForm.register("studentId")}
              />
              {assignForm.formState.errors.studentId && (
                <p className="text-sm text-destructive">
                  {assignForm.formState.errors.studentId.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAssignDialogOpen(false);
                  setSelectedRoom(null);
                  assignForm.reset();
                }}
                disabled={assignMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={assignMutation.isPending}>
                {assignMutation.isPending ? "Assigning..." : "Assign Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
