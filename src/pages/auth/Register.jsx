import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  UserMultipleIcon,
  Calendar03Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { registerUser } from "@/api/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rollNo: z.string().min(1, "Roll number is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  course: z.string().min(1, "Course is required"),
  year: z.string().min(1, "Year is required"),
  parentPhone: z.string().optional(),
  address: z.string().optional(),
});

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await registerUser({
        ...data,
        year: parseInt(data.year),
      });

      toast.success("Registration Successful!", {
        description: "Please check your email to verify your account.",
      });

      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      toast.error("Registration Failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-[85vh] flex">
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
              <h2 className="text-3xl font-bold">Join Our Hostel</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Create your account and start your journey with our modern hostel management system
            </p>
          </div>

          <div className="space-y-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={UserCircleIcon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Easy Registration</h3>
                <p className="text-sm text-muted-foreground">
                  Quick and simple sign-up process to get you started
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={UserMultipleIcon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Student Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with fellow students and manage your hostel life
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon icon={ShieldIcon} className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure & Protected</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is safe with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-2 bg-gradient-to-br from-background via-background to-muted/20 overflow-y-auto">
        <div className="w-full max-w-xl py-1.5">
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center space-y-1">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <HugeiconsIcon icon={UserCircleIcon} className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
              <CardDescription className="text-base">
                Register for hostel accommodation and start your journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      autoComplete="name"
                      className="h-11"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollNo" className="text-sm font-medium">
                      Roll Number
                    </Label>
                    <Input
                      id="rollNo"
                      placeholder="2024001"
                      autoComplete="off"
                      className="h-11"
                      {...register("rollNo")}
                    />
                    {errors.rollNo && (
                      <p className="text-sm text-destructive">
                        {errors.rollNo.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      placeholder="9876543210"
                      autoComplete="tel"
                      className="h-11"
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-sm font-medium">
                      Course
                    </Label>
                    <Input
                      id="course"
                      placeholder="B.Tech CSE"
                      className="h-11"
                      {...register("course")}
                    />
                    {errors.course && (
                      <p className="text-sm text-destructive">
                        {errors.course.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-medium">
                      Year
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      min="1"
                      max="5"
                      placeholder="1"
                      className="h-11"
                      {...register("year")}
                    />
                    {errors.year && (
                      <p className="text-sm text-destructive">
                        {errors.year.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone" className="text-sm font-medium">
                    Parent Phone <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="parentPhone"
                    placeholder="9876543210"
                    className="h-11"
                    {...register("parentPhone")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="Your address"
                    className="h-11"
                    {...register("address")}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-semibold" 
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-primary hover:underline font-semibold"
                  >
                    Sign In
                  </Link>
                </p>
              </form>
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
