import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Mail01Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { verifyEmail } from "@/api/auth";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      toast.error("Invalid Link", {
        description: "This verification link is invalid.",
      });
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus("success");
        setMessage(response.message);
        toast.success("Email Verified!", {
          description: "You can now log in to your account.",
        });
      } catch (err) {
        setStatus("error");
        const errorMessage =
          err.response?.data?.message || "Verification failed.";
        setMessage(errorMessage);
        toast.error("Verification Failed", {
          description: errorMessage,
        });
      }
    };

    verify();
  }, [searchParams]);

  const getStatusIcon = () => {
    if (status === "verifying") return Loading03Icon;
    if (status === "success") return CheckmarkCircle02Icon;
    return Alert02Icon;
  };

  const getStatusTitle = () => {
    if (status === "verifying") return "Verifying Email...";
    if (status === "success") return "Email Verified!";
    return "Verification Failed";
  };

  const getStatusDescription = () => {
    if (status === "verifying") return "Please wait while we verify your email address";
    if (status === "success") return "Your email has been successfully verified";
    return "We couldn't verify your email address";
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
              <h2 className="text-3xl font-bold">Email Verification</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              {status === "verifying" && "Verifying your email address..."}
              {status === "success" && "Your email has been verified successfully"}
              {status === "error" && "There was an issue verifying your email"}
            </p>
          </div>

          <div className="space-y-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={Mail01Icon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                  Verify your email to activate your account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Account Activation</h3>
                <p className="text-sm text-muted-foreground">
                  Complete verification to access all features
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={Home01Icon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Get Started</h3>
                <p className="text-sm text-muted-foreground">
                  Once verified, you can log in and start using the system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Status Card */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-md">
          <Card className="border-2 shadow-xl text-center">
            <CardHeader className="space-y-2">
              <div className={`mx-auto mb-4 p-3 rounded-full w-fit ${
                status === "success" 
                  ? "bg-green-100 dark:bg-green-950/20" 
                  : status === "error"
                  ? "bg-destructive/10"
                  : "bg-primary/10"
              }`}>
                <HugeiconsIcon 
                  icon={getStatusIcon()} 
                  className={`h-8 w-8 ${
                    status === "success" 
                      ? "text-green-600 dark:text-green-400" 
                      : status === "error"
                      ? "text-destructive"
                      : "text-primary"
                  } ${status === "verifying" ? "animate-spin" : ""}`}
                />
              </div>
              <CardTitle className="text-3xl font-bold">
                {getStatusTitle()}
              </CardTitle>
              <CardDescription className="text-base">
                {getStatusDescription()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {message && (
                <p className={`text-sm ${
                  status === "success" 
                    ? "text-green-600 dark:text-green-400" 
                    : status === "error"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}>
                  {message}
                </p>
              )}
              
              {status === "success" && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-muted-foreground">
                    Your account is now active. You can log in to access all features.
                  </p>
                </div>
              )}

              {status === "error" && (
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm text-destructive">
                    The verification link may be invalid or expired. Please try registering again.
                  </p>
                </div>
              )}

              {status !== "verifying" && (
                <Button asChild className="w-full h-11">
                  <Link to="/login">Go to Login</Link>
                </Button>
              )}

              {status === "verifying" && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Please wait...</span>
                </div>
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
