import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { markAttendance } from "@/api/warden";

export default function Attendance() {
  const [studentId, setStudentId] = useState("");
  const [status, setStatus] = useState("PRESENT");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: (records) => markAttendance(records),
    onSuccess: () => {
      setMessage("Attendance marked successfully!");
      setStudentId("");
    },
    onError: (err) => {
      setMessage(err.response?.data?.message || "Failed to mark attendance");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId) return;

    mutation.mutate([
      {
        studentId,
        status,
        date: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mark Attendance</h1>

      <Card>
        <CardHeader>
          <CardTitle>Record Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div
                className={`p-3 text-sm rounded-md ${
                  message.includes("success")
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                placeholder="Enter student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-4">
                {["PRESENT", "ABSENT", "LATE"].map((s) => (
                  <label key={s} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      checked={status === s}
                      onChange={(e) => setStatus(e.target.value)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Marking..." : "Mark Attendance"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
