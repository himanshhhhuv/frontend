import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  ShieldIcon,
  LockPasswordIcon,
  CheckmarkCircle02Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { resetPassword } from "@/api/auth";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid reset link.");
      toast.error("Invalid Link", {
        description: "This password reset link is invalid.",
      });
      return;
    }

    setStatus("loading");

    try {
      const response = await resetPassword(token, data.password);
      setStatus("success");
      setMessage(response.message);
      toast.success("Password Reset Successful!", {
        description: "Redirecting to login...",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setStatus("error");
      const errorMessage =
        err.response?.data?.message || "Failed to reset password.";
      setMessage(errorMessage);
      toast.error("Password Reset Failed", {
        description: errorMessage,
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-foreground">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <HugeiconsIcon icon={Home01Icon} className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">Invalid Link</h2>
              </div>
              <p className="text-lg text-muted-foreground">
                This password reset link is invalid or has expired
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
          <Card className="w-full max-w-md border-2 shadow-xl text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
                <HugeiconsIcon icon={Alert02Icon} className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-3xl font-bold">Invalid Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This password reset link is invalid or has expired.
              </p>
              <Button asChild className="w-full h-11">
                <Link to="/forgot-password">Request New Link</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Animated Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-foreground">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <HugeiconsIcon icon={Home01Icon} className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Reset Password</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Create a strong password to secure your account
            </p>
          </div>

          <div className="space-y-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={LockPasswordIcon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Strong Password</h3>
                <p className="text-sm text-muted-foreground">
                  Use at least 6 characters for better security
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={ShieldIcon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Account</h3>
                <p className="text-sm text-muted-foreground">
                  Your password is encrypted and protected
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Quick Access</h3>
                <p className="text-sm text-muted-foreground">
                  You'll be redirected to login after reset
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-md">
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <HugeiconsIcon 
                  icon={status === "success" ? CheckmarkCircle02Icon : LockPasswordIcon} 
                  className="h-8 w-8 text-primary" 
                />
              </div>
              <CardTitle className="text-3xl font-bold">
                {status === "success" ? "Password Reset!" : "Reset Password"}
              </CardTitle>
              <CardDescription className="text-base">
                {status === "success" 
                  ? "Your password has been successfully reset"
                  : "Enter your new password below"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status === "success" ? (
                <div className="space-y-5 text-center">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <HugeiconsIcon 
                      icon={CheckmarkCircle02Icon} 
                      className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" 
                    />
                    <p className="text-sm text-muted-foreground mb-1">
                      {message || "Your password has been successfully reset"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Redirecting to login page...
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {status === "error" && (
                    <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                      {message}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      New Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-11"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-11"
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
                    className="w-full h-11 text-base font-semibold"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
