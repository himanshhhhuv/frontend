import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Mail01Icon,
  Call02Icon,
  Location01Icon,
  Book02Icon,
  Calendar03Icon,
  Door01Icon,
  Edit02Icon,
  UserAccountIcon,
  LockPasswordIcon,
} from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfile, updateProfile } from "@/api/student";
import { changePassword, logoutUser } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";

// Validation schema
const profileSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(15, "Phone must be at most 15 digits")
    .regex(/^[0-9]+$/, "Phone must contain only numbers"),
  parentPhone: z
    .string()
    .min(10, "Parent phone must be at least 10 digits")
    .max(15, "Parent phone must be at most 15 digits")
    .regex(/^[0-9]+$/, "Parent phone must contain only numbers")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .optional()
    .or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(128, "New password is too long"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function Profile() {
  const queryClient = useQueryClient();
  const { logout: logoutStore } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student", "profile"],
    queryFn: getProfile,
  });

  // API returns { profile: { ...user, profile: {...}, room: {...} } }
  const user = data?.profile || {};
  const profile = user.profile || {};
  const room = user.room;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      phone: profile.phone || "",
      parentPhone: profile.parentPhone || "",
      address: profile.address || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "profile"] });
      toast.success("Profile Updated", {
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description:
          error.response?.data?.message || "Failed to update profile",
      });
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate(formData);
  };

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password updated", {
        description: "Your password has been changed successfully.",
      });
      resetPassword();
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        "Failed to change password. Please try again.";
      toast.error("Change password failed", {
        description: message,
      });
    },
  });

  const handleChangePassword = (values) => {
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore API errors, still clear local session
    } finally {
      logoutStore();
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-5 w-40 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-destructive">Failed to load profile</p>
        <Button
          variant="outline"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["student", "profile"] })
          }
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          View and manage your personal information.
        </p>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.photo} alt={profile.name} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl font-bold">
                {profile.name || "Student"}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                <Badge variant="secondary">{user.role}</Badge>
                <Badge variant="outline">{profile.course}</Badge>
                <Badge variant="outline">Year {profile.year}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={UserAccountIcon} className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic details and academic info
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <HugeiconsIcon
                  icon={UserIcon}
                  className="h-4 w-4 text-primary"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Full Name
                </Label>
                <p className="font-medium">{profile.name || "-"}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  className="h-4 w-4 text-primary"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Email Address
                </Label>
                <p className="font-medium">{user.email || "-"}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <HugeiconsIcon
                  icon={UserAccountIcon}
                  className="h-4 w-4 text-primary"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Roll Number
                </Label>
                <p className="font-medium font-mono">{profile.rollNo || "-"}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <HugeiconsIcon
                  icon={Book02Icon}
                  className="h-4 w-4 text-primary"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Course</Label>
                <p className="font-medium">{profile.course || "-"}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  className="h-4 w-4 text-primary"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Year</Label>
                <p className="font-medium">
                  {profile.year ? `Year ${profile.year}` : "-"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <HugeiconsIcon
                  icon={Door01Icon}
                  className="h-4 w-4 text-primary"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">
                  Room Assignment
                </Label>
                <p className="font-medium">
                  {room ? (
                    <span>
                      Room {room.roomNo}, Floor {room.floor}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Edit02Icon} className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>Update your contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <HugeiconsIcon icon={Call02Icon} className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="parentPhone"
                  className="flex items-center gap-2"
                >
                  <HugeiconsIcon icon={Call02Icon} className="h-4 w-4" />
                  Parent/Guardian Phone
                </Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="Enter parent/guardian phone"
                  autoComplete="tel"
                  {...register("parentPhone")}
                />
                {errors.parentPhone && (
                  <p className="text-sm text-destructive">
                    {errors.parentPhone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <HugeiconsIcon icon={Location01Icon} className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  placeholder="Enter your address"
                  autoComplete="street-address"
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending || !isDirty}
              >
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Details about your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <Label className="text-xs text-muted-foreground">
                Account ID
              </Label>
              <p className="font-mono text-sm truncate">{user.id || "-"}</p>
            </div>
            <div className="rounded-lg border p-4">
              <Label className="text-xs text-muted-foreground">
                Account Type
              </Label>
              <p className="font-medium">{user.role || "-"}</p>
            </div>
            <div className="rounded-lg border p-4">
              <Label className="text-xs text-muted-foreground">
                Member Since
              </Label>
              <p className="font-medium">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security / Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={LockPasswordIcon} className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Update your password and manage sign-out.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="space-y-4"
            onSubmit={handleSubmitPassword(handleChangePassword)}
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder="Enter current password"
                {...registerPassword("currentPassword")}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Enter new password"
                {...registerPassword("newPassword")}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter new password"
                {...registerPassword("confirmPassword")}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={
                isPasswordSubmitting || changePasswordMutation.isPending
              }
            >
              {changePasswordMutation.isPending
                ? "Updating..."
                : "Change Password"}
            </Button>
          </form>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Sign out</p>
              <p className="text-xs text-muted-foreground">
                Log out from this browser session.
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
