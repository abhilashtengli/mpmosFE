"use client";

import type React from "react";

import { useState } from "react";
import { z } from "zod";
import { Loader2, KeyRound, ArrowLeft } from "lucide-react";
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

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

interface FormErrors {
  [key: string]: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  code: string;
}

interface ApiError {
  success: false;
  message: string;
  code: string;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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
      forgotPasswordSchema.parse({ email });
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
    if (code === "EMAIL_NOT_VERIFIED") {
      return "Please verify your email address before resetting your password.";
    }
    if (code === "EMAIL_SEND_FAILED") {
      return "Failed to send reset code. Please try again later.";
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
      const response = await axios.post<ForgotPasswordResponse>(
        `${Base_Url}/forgot-password`,
        {
          email: email.trim()
        },
        {
          timeout: 15000, // 15 second timeout
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      // Backend always returns success for security reasons
      if (response.data.success) {
        toast.success("Reset code sent!", {
          description:
            "If your email exists in our system, a reset code has been sent."
        });

        // Navigate to verification page
        navigate("/admin/create-new-password", {
          state: {
            email: email.trim()
          },
          replace: true
        });
      } else {
        setFormError("Failed to send reset code. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = getErrorMessage(error as AxiosError<ApiError>);
        setFormError(errorMessage);

        // Handle specific error codes with toast
        const code = error.response?.data?.code;
        if (code === "EMAIL_NOT_VERIFIED") {
          toast.error("Email Not Verified", {
            description: "Please verify your email address first."
          });
        } else if (code === "EMAIL_SEND_FAILED") {
          toast.error("Email Send Failed", {
            description: "Unable to send reset code. Please try again later."
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
              <KeyRound className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you a verification code to
              reset your password
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
                  is verified, you'll receive a 6-digit verification code to
                  reset your password.
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
                {isLoading ? "Sending Reset Code..." : "Send Reset Code"}
              </Button>

              <div className="text-center space-y-2">
                <Link
                  to="/admin/signin"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Sign In
                </Link>
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
