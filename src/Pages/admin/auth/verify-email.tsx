import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { Loader2, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import axios, { type AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Base_Url } from "@/lib/constants";
import iimr from "@/assets/IIMR_logo.jpg";
import aicrp from "@/assets/AICRP_logo.png";
import cpgs from "@/assets/CPGS_logo.jpg";

// Verification code validation
const verificationSchema = z.object({
  code: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers")
});

interface VerificationResponse {
  success: boolean;
  message: string;
  code: string;
}

interface ApiError {
  success: false;
  message: string;
  code: string;
}

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [codeError, setCodeError] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get user data from navigation state
  const { email } = location.state || {};

  // Redirect if no user data
  useEffect(() => {
    if (!email) {
      toast.error("Invalid verification session");
      navigate("/admin/signup", { replace: true });
    }
  }, [email, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (value: string, index: number): void => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);

    const newCode = verificationCode.split("");
    newCode[index] = digit;
    const updatedCode = newCode.join("");

    setVerificationCode(updatedCode);
    setCodeError("");
    setFormError(null);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ): void => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent): void => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    setVerificationCode(pastedData.padEnd(6, ""));

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const validateCode = (): boolean => {
    try {
      verificationSchema.parse({ code: verificationCode });
      setCodeError("");
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setCodeError(error.errors[0].message);
      }
      return false;
    }
  };

  const getErrorMessage = (error: AxiosError<ApiError>): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    const status = error.response?.status;
    if (status === 400) {
      return "Invalid verification code. Please check and try again.";
    }
    if (status === 410) {
      return "Verification code has expired. Please request a new one.";
    }
    if (status === 404) {
      return "User not found. Please sign up again.";
    }
    if (status === 429) {
      return "Too many attempts. Please try again later.";
    }
    if (status && status >= 500) {
      return "Server error. Please try again later.";
    }
    return "An unexpected error occurred. Please try again.";
  };

  const handleVerification = async (): Promise<void> => {
    if (!validateCode()) {
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      const response = await axios.post<VerificationResponse>(
        `${Base_Url}/verify-email`,
        {
          email,
          code: verificationCode
        },
        {
          timeout: 10000,
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (
        response.data.success === true &&
        response.data.code === "EMAIL_VERIFIED"
      ) {
        toast.success("Email verified successfully!", {
          description: `Account created, ${name} account is now active.`
        });

        // Navigate to dashboard
        navigate("/admin/dashboard", { replace: true });
      } else {
        setFormError("Verification failed. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = getErrorMessage(error as AxiosError<ApiError>);
        setFormError(errorMessage);

        if (error.response?.status === 410) {
          toast.error("Code Expired", {
            description: "Please request a new verification code."
          });
        }
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    setIsResending(true);
    setFormError(null);

    try {
      const response = await axios.post(
        `${Base_Url}/resend-code`,
        { email },
        {
          timeout: 10000,
          withCredentials: true,
          validateStatus: (status) => status < 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (
        response.data.success &&
        response.data.code === "VERIFICATION_CODE_SENT"
      ) {
        toast.success("Verification code sent!", {
          description: "Please check your email for the new code."
        });
        setTimeLeft(600); // Reset timer
        setVerificationCode(""); // Clear current code
      } else if (
        response.data.success === false &&
        response.data.code === "INVALID_EMAIL"
      ) {
        toast.error("Invalid Email address", {
          description:
            response.data.message || "Invalid Email address provided."
        });
      } else if (
        response.data.success === true &&
        response.data.code === "VERIFICATION_CODE_REQUESTED"
      ) {
        toast.info("Too many requests", {
          description:
            response.data.message ||
            "If your email exists in our system, a verification code has been sent."
        });
      } else if (
        response.data.success === false &&
        response.data.code === "EMAIL_ALREADY_VERIFIED"
      ) {
        toast.info("Already Verified", {
          description: response.data.message || "Account already verified."
        });
      } else if (
        response.data.success === false &&
        response.data.code === "EMAIL_SEND_FAILED"
      ) {
        toast.error("Failed to resend verification Code", {
          description:
            response.data.message ||
            "Failed to send verification code. Please try again later."
        });
      }
    } catch (error) {
      console.error("Resend error:", error);
      toast.error("Failed to resend code", {
        description: "Please try again later."
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center">
          <div className="flex items-center">
            <div className="flex flex-wrap items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                <img
                  src={aicrp || "/placeholder.svg"}
                  alt="AICRP on Sorghum and Millets"
                  className="rounded-full w-12 h-12 object-contain"
                />
              </div>
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                <img
                  src={cpgs || "/placeholder.svg"}
                  alt="CPGS Logo"
                  className="rounded-full w-20 h-20 object-contain"
                />
              </div>
              <div className="w-24 h-14 rounded- flex items-center justify-center shadow-md">
                <img
                  src={iimr || "/placeholder.svg"}
                  alt="IIMR Logo"
                  className="rounded-lg h-16 object-contain"
                />
              </div>
            </div>
            <span className="pl-5 text-xl tracking-wider text-green-900 font-">
              Millet Project Monitoring System Dashboard
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 pt-8">
            <div className="flex items-center justify-center mb-2">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-center">
              We've sent a 6-digit verification code to
              <br />
              <span className="font-medium text-gray-900">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {formError && (
              <Alert variant="destructive" className="border-red-500">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="text-center block">
                Enter Verification Code
              </Label>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={verificationCode[index] || ""}
                    onChange={(e) => handleCodeChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 text-center text-lg font-semibold ${
                      codeError ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                ))}
              </div>
              {codeError && (
                <p className="text-sm text-red-500 text-center">{codeError}</p>
              )}
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Code expires in:{" "}
                <span className="font-medium text-red-600">
                  {formatTime(timeLeft)}
                </span>
              </p>

              {timeLeft > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-green-600 hover:text-green-700"
                >
                  {isResending && (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isResending ? "Sending..." : "Resend Code"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                >
                  {isResending && (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isResending ? "Sending..." : "Get New Code"}
                </Button>
              )}
            </div>

            <Button
              onClick={handleVerification}
              className="w-full bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center">
              <Link
                to="/admin/signup"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-gray-500">
        <p>
          © 2025 College of Post Graduate Studies in Agricultural Sciences,
          Umiam. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
