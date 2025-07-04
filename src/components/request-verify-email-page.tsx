import { useState } from "react";
import { z } from "zod";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import axios, { type AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { Base_Url } from "@/lib/constants";
import iimr from "@/assets/IIMR_logo.jpg";
import aicrp from "@/assets/AICRP_logo.png";
import cpgs from "@/assets/CPGS_logo.jpg";
import { useAuthStore } from "@/stores/useAuthStore";

// Form validation schema
const requestVerifyEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

interface FormErrors {
  [key: string]: string;
}

interface RequestVerifyEmailResponse {
  success: boolean;
  message: string;
  code: string;
}

interface ApiError {
  success: false;
  message: string;
  code: string;
}

export default function RequestVerifyEmailPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const user = useAuthStore((state) => state.user);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setEmail(value);

    // Clear errors when user starts typing
    if (formErrors.email) {
      setFormErrors({});
    }
    if (formError) {
      setFormError(null);
    }
  };

  const validateForm = (): boolean => {
    try {
      requestVerifyEmailSchema.parse({ email });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0].toString();
          newErrors[path] = err.message;
        });
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  const getErrorMessage = (error: AxiosError<ApiError>): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    const status = error.response?.status;
    const code = error.response?.data?.code;

    // Handle specific error codes
    if (code === "EMAIL_MISSING_FIELD") {
      return "Email address is required.";
    }
    if (code === "INVALID_EMAIL") {
      return "Please enter a valid email address.";
    }
    if (code === "EMAIL_ALREADY_VERIFIED") {
      return "This email is already verified. You can sign in now.";
    }
    if (code === "EMAIL_SEND_FAILED") {
      return "Failed to send verification code. Please try again later.";
    }
    if (code === "INTERNAL_SERVER_ERROR") {
      return "Server error. Please try again later.";
    }

    // Handle HTTP status codes
    if (status === 400) {
      return "Invalid request. Please check your email address.";
    }
    if (status === 429) {
      return "Too many requests. Please try again later.";
    }
    if (status && status >= 500) {
      return "Server error. Please try again later.";
    }
    if (error.code === "NETWORK_ERROR" || !error.response) {
      return "Network error. Please check your internet connection.";
    }

    return "An unexpected error occurred. Please try again.";
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      const response = await axios.post<RequestVerifyEmailResponse>(
        `${Base_Url}/request-verify-email`,
        {
          email: email.trim()
        },
        {
          timeout: 15000, // 15 second timeout
          withCredentials: true,
          validateStatus: (status) => status < 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      console.log("Response:", response.data);

      // Handle successful response
      if (response.data.success) {
        if (response.data.code === "VERIFICATION_CODE_SENT") {
          toast.success("Verification code sent!", {
            description: "Please check your email for the verification code."
          });

          // Navigate to verification page
          navigate("/admin/verify-email", {
            state: {
              email: email.trim()
            },
            replace: true
          });
        } else if (response.data.code === "VERIFICATION_CODE_REQUESTED") {
          // Backend returns success but user might not exist (security measure)
          toast.success("Request processed!", {
            description:
              "If your email exists in our system, a verification code has been sent."
          });

          // Still navigate to verification page
          navigate("/admin/verify-email", {
            state: {
              email: email.trim()
            },
            replace: true
          });
        }
      } else if (response.data.code === "EMAIL_ALREADY_VERIFIED") {
        toast.info("Already Verified!", {
          description: "Your email is already verified. You can sign in now."
        });
        setTimeout(() => {
          navigate("/admin/signin");
        }, 1500);
      } else {
        setFormError("Failed to send verification code. Please try again.");
      }
    } catch (error) {
      console.error("Request verify email error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = getErrorMessage(error as AxiosError<ApiError>);
        setFormError(errorMessage);

        // Handle specific error codes with toast and navigation
        const code = error.response?.data?.code;
        const status = error.response?.status;

        if (code === "EMAIL_ALREADY_VERIFIED") {
          toast.info("Email Already Verified", {
            description: "Your email is already verified. You can sign in now."
          });
          // Navigate to signin page
          setTimeout(() => {
            navigate("/admin/signin", { replace: true });
          }, 2000);
        } else if (code === "EMAIL_SEND_FAILED") {
          toast.error("Email Send Failed", {
            description:
              "Unable to send verification code. Please try again later."
          });
        } else if (code === "INVALID_EMAIL") {
          toast.error("Invalid Email", {
            description: "Please enter a valid email address."
          });
        } else if (status === 200 && code === "VERIFICATION_CODE_REQUESTED") {
          // This is actually a success case (security measure)
          toast.success("Request processed!", {
            description:
              "If your email exists in our system, a verification code has been sent."
          });
          navigate("/admin/verify-email", {
            state: {
              email: email.trim()
            },
            replace: true
          });
        }
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
              Enter your email address to receive a verification code
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 mb-5">
              {formError && (
                <Alert variant="destructive" className="border-red-500">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={formErrors.email ? "border-red-500" : ""}
                  required
                  autoComplete="email"
                  autoFocus
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If your email exists in our system and
                  is not yet verified, you'll receive a 6-digit verification
                  code to complete your account setup.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 mb-4">
              <Button
                type="submit"
                className="w-full bg-green-600 mt-5 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading
                  ? "Sending Verification Code..."
                  : "Send Verification Code"}
              </Button>

              <div className="text-center space-y-2">
                {!user && (
                  <p className="text-sm text-gray-600">
                    Already verified?{" "}
                    <Link
                      to="/admin/signin"
                      className="font-medium text-green-600 hover:text-green-700 focus:outline-none focus:underline"
                      tabIndex={isLoading ? -1 : 0}
                    >
                      Sign in here
                    </Link>
                  </p>
                )}
                {user && (
                  <Link
                    to="/admin/signup"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Sign Up
                  </Link>
                )}
              </div>
            </CardFooter>
          </form>
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
