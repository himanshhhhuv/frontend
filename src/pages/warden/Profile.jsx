import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAccountIcon,
  Mail01Icon,
  LockPasswordIcon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";

import { useAuthStore } from "@/store/authStore";
import { changePassword, logoutUser } from "@/api/auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export default function WardenProfile() {
  const { user, logout: logoutStore } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password updated", {
        description: "Your password has been changed successfully.",
      });
      reset();
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

  const initials = useMemo(() => {
    const name = user?.profile?.name || user?.email || "";
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  const createdAt = useMemo(() => {
    if (!user?.createdAt) return "-";
    return new Date(user.createdAt).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your admin account and security settings.
        </p>
      </div> */}

      {/* Top profile card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={user?.profile?.photo}
                alt={user?.profile?.name}
              />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold">
                {user?.profile?.name || "Administrator"}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                <Badge variant="secondary">{user?.role || "ADMIN"}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={UserAccountIcon} className="h-5 w-5" />
              Account Overview
            </CardTitle>
            <CardDescription>
              Basic information about your admin account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  className="h-4 w-4 text-primary"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="font-medium break-all">{user?.email || "-"}</p>
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
                  Account ID
                </Label>
                <p className="font-mono text-sm truncate">{user?.id || "-"}</p>
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
                <Label className="text-xs text-muted-foreground">
                  Member Since
                </Label>
                <p className="font-medium">{createdAt}</p>
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
              onSubmit={handleSubmit(handleChangePassword)}
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  {...register("currentPassword")}
                />
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {errors.currentPassword.message}
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
                  {...register("newPassword")}
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {errors.newPassword.message}
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
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || changePasswordMutation.isPending}
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
    </div>
  );
}
