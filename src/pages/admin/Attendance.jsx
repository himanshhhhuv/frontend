    import { useState, useMemo } from "react";
    import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
    import { toast } from "sonner";
    import { format } from "date-fns";
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import { Label } from "@/components/ui/label";
    import { Badge } from "@/components/ui/badge";
    import { Calendar } from "@/components/ui/calendar";
    import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    } from "@/components/ui/popover";
    import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    } from "@/components/ui/table";
    import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    } from "@/components/ui/select";
    import { CalendarIcon } from "@hugeicons/core-free-icons";
    import { HugeiconsIcon } from "@hugeicons/react";
    import { markAttendance, getStudentsList } from "@/api/warden";

    const statusColors = {
    PRESENT: "bg-green-100 text-green-800 border-green-300",
    ABSENT: "bg-red-100 text-red-800 border-red-300",
    LATE: "bg-yellow-100 text-yellow-800 border-yellow-300",
    NONE: "bg-gray-100 text-gray-600 border-gray-300",
    };

    export default function AdminAttendance() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState("");
    const [bulkStatus, setBulkStatus] = useState("PRESENT");
    const queryClient = useQueryClient();

    // Convert Date object to YYYY-MM-DD string for API
    const dateString = format(selectedDate, "yyyy-MM-dd");

    // Fetch students with attendance
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["students-attendance", dateString],
        queryFn: () => getStudentsList(dateString),
    });

    const students = useMemo(() => data?.data || [], [data?.data]);

    // Filter students based on search
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const query = searchQuery.toLowerCase();
        return students.filter(
        (student) =>
            student.profile?.name?.toLowerCase().includes(query) ||
            student.profile?.rollNo?.toLowerCase().includes(query) ||
            student.email?.toLowerCase().includes(query) ||
            student.room?.roomNo?.toLowerCase().includes(query)
        );
    }, [students, searchQuery]);

    // Mutation for marking attendance
    const mutation = useMutation({
        mutationFn: (records) => markAttendance(records),
        onSuccess: () => {
        toast.success("Attendance marked successfully!");
        queryClient.invalidateQueries({ queryKey: ["students-attendance"] });
        refetch();
        },
        onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to mark attendance");
        },
    });

    const handleMarkAttendance = (studentId, status) => {
        mutation.mutate([
        {
            studentId,
            status,
            date: dateString,
        },
        ]);
    };

    const handleBulkMark = () => {
        if (filteredStudents.length === 0) {
        toast.error("No students to mark");
        return;
        }

        const records = filteredStudents.map((student) => ({
        studentId: student.id,
        status: bulkStatus,
        date: dateString,
        }));

        mutation.mutate(records);
    };

    const handleMarkAllPresent = () => {
        setBulkStatus("PRESENT");
        handleBulkMark();
    };

    const handleMarkAllAbsent = () => {
        setBulkStatus("ABSENT");
        handleBulkMark();
    };

    const handleMarkAllLate = () => {
        setBulkStatus("LATE");
        handleBulkMark();
    };

    const getStatusBadge = (student) => {
        if (!student.attendance) {
        return (
            <Badge className={statusColors.NONE} variant="outline">
            Not Marked
            </Badge>
        );
        }
        return (
        <Badge
            className={statusColors[student.attendance.status]}
            variant="outline"
        >
            {student.attendance.status}
        </Badge>
        );
    };

    const stats = useMemo(() => {
        const total = students.length;
        const present = students.filter(
        (s) => s.attendance?.status === "PRESENT"
        ).length;
        const absent = students.filter(
        (s) => s.attendance?.status === "ABSENT"
        ).length;
        const late = students.filter((s) => s.attendance?.status === "LATE").length;
        const notMarked = students.filter((s) => !s.attendance).length;

        return { total, present, absent, late, notMarked };
    }, [students]);

    return (
        <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Mark Attendance</h1>
            <div className="flex items-center gap-4">
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-[200px] justify-start text-left font-normal"
                >
                    <HugeiconsIcon icon={CalendarIcon} className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                    format(selectedDate, "PPP")
                    ) : (
                    <span>Pick a date</span>
                    )}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0.5">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                    if (date) {
                        setSelectedDate(date);
                    }
                    }}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
            </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
            <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Students</p>
            </CardContent>
            </Card>
            <Card>
            <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                {stats.present}
                </div>
                <p className="text-xs text-muted-foreground">Present</p>
            </CardContent>
            </Card>
            <Card>
            <CardContent className="pt-6">
                <div className="text-2xl font-bold text-red-600">
                {stats.absent}
                </div>
                <p className="text-xs text-muted-foreground">Absent</p>
            </CardContent>
            </Card>
            <Card>
            <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">
                {stats.late}
                </div>
                <p className="text-xs text-muted-foreground">Late</p>
            </CardContent>
            </Card>
            <Card>
            <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-600">
                {stats.notMarked}
                </div>
                <p className="text-xs text-muted-foreground">Not Marked</p>
            </CardContent>
            </Card>
        </div>

        {/* Controls */}
        <Card>
            <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Student List</CardTitle>
                <div className="flex items-center gap-2">
                <Input
                    placeholder="Search by name, roll no, email, or room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                />
                <div className="flex gap-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllPresent}
                    disabled={mutation.isPending || filteredStudents.length === 0}
                    >
                    Mark All Present
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAbsent}
                    disabled={mutation.isPending || filteredStudents.length === 0}
                    >
                    Mark All Absent
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllLate}
                    disabled={mutation.isPending || filteredStudents.length === 0}
                    >
                    Mark All Late
                    </Button>
                </div>
                </div>
            </div>
            </CardHeader>
            <CardContent>
            {isLoading ? (
                <div className="text-center py-8">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                No students found
                </div>
            ) : (
                <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                        <TableCell className="font-medium">
                            {student.profile?.rollNo || "N/A"}
                        </TableCell>
                        <TableCell>{student.profile?.name || "N/A"}</TableCell>
                        <TableCell>{student.profile?.course || "N/A"}</TableCell>
                        <TableCell>{student.profile?.year || "N/A"}</TableCell>
                        <TableCell>
                            {student.room?.roomNo
                            ? `${student.room.roomNo} (Floor ${student.room.floor})`
                            : "Not Assigned"}
                        </TableCell>
                        <TableCell>{getStatusBadge(student)}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                            <Select
                                value={student.attendance?.status || "NONE"}
                                onValueChange={(value) => {
                                if (value !== "NONE") {
                                    handleMarkAttendance(student.id, value);
                                }
                                }}
                                disabled={mutation.isPending}
                            >
                                <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="PRESENT">Present</SelectItem>
                                <SelectItem value="ABSENT">Absent</SelectItem>
                                <SelectItem value="LATE">Late</SelectItem>
                                </SelectContent>
                            </Select>
                            </div>
                        </TableCell>
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
