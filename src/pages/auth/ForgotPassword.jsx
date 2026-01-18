import { useState } from "react";
import { Link } from "react-router-dom";
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
  Mail01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { forgotPassword } from "@/api/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function ForgotPassword() {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setStatus("loading");

    try {
      const response = await forgotPassword(data.email);
      setStatus("success");
      setMessage(response.message);
      toast.success("Email Sent!", {
        description: "Check your inbox for the password reset link.",
      });
    } catch (err) {
      setStatus("error");
      const errorMessage =
        err.response?.data?.message || "Failed to send reset email.";
      setMessage(errorMessage);
      toast.error("Failed to Send Email", {
        description: errorMessage,
      });
    }
  };

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
              Don't worry, we'll help you regain access to your account
            </p>
          </div>

          <div className="space-y-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={Mail01Icon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Verification</h3>
                <p className="text-sm text-muted-foreground">
                  We'll send a secure reset link to your registered email
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={ShieldIcon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Process</h3>
                <p className="text-sm text-muted-foreground">
                  Your account security is our top priority
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Quick Recovery</h3>
                <p className="text-sm text-muted-foreground">
                  Get back to your account in just a few steps
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
                  icon={status === "success" ? CheckmarkCircle02Icon : Mail01Icon} 
                  className="h-8 w-8 text-primary" 
                />
              </div>
              <CardTitle className="text-3xl font-bold">
                {status === "success" ? "Check Your Email" : "Forgot Password"}
              </CardTitle>
              <CardDescription className="text-base">
                {status === "success" 
                  ? "We've sent you a password reset link"
                  : "Enter your email to receive a reset link"}
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
                      {message || "Password reset link has been sent to your email"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please check your inbox and follow the instructions to reset your password.
                    </p>
                  </div>
                  <Button asChild variant="outline" className="w-full h-11">
                    <Link to="/login">Back to Login</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {status === "error" && (
                    <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                      {message}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-11"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-semibold"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Sending..." : "Send Reset Link"}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Remember your password?{" "}
                    <Link 
                      to="/login" 
                      className="text-primary hover:underline font-semibold"
                    >
                      Sign In
                    </Link>
                  </p>
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
