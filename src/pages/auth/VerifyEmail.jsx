import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus("success");
        setMessage(response.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed.");
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">
            {status === "verifying" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{message}</p>
          {status !== "verifying" && (
            <Button asChild>
              <Link to="/login">Go to Login</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
