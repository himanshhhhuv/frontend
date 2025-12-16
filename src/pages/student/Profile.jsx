import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProfile, updateProfile } from "@/api/student";

export default function Profile() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["student", "profile"],
    queryFn: getProfile,
  });

  const user = data?.user || {};
  const profile = user.profile || {};

  const { register, handleSubmit } = useForm({
    values: {
      phone: profile.phone || "",
      parentPhone: profile.parentPhone || "",
      address: profile.address || "",
    },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(["student", "profile"]);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{profile.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Roll Number</Label>
              <p className="font-medium">{profile.rollNo}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Course</Label>
              <p className="font-medium">{profile.course}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Year</Label>
              <p className="font-medium">{profile.year}</p>
            </div>
            {user.room && (
              <div>
                <Label className="text-muted-foreground">Room</Label>
                <p className="font-medium">
                  Room {user.room.roomNo}, Floor {user.room.floor}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Editable Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">Parent Phone</Label>
                <Input id="parentPhone" {...register("parentPhone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
              </div>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
