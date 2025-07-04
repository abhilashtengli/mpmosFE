import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import {
  Loader2,
  Shield,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
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

// Validation schemas
const verifyPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    code: z
      .string()
      .length(6, "Verification code must be 6 digits")
      .regex(/^\d+$/, "Code must contain only numbers"),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            "Password must contain uppercase, lowercase, number and special character"
        }
      ),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

interface FormErrors {
  [key: string]: string;
}

interface VerifyPasswordResponse {
  success: boolean;
  message: string;
  code: string;
}

interface ApiError {
  success: false;
  message: string;
  code: string;
}

export default function VerifyPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear form error when user starts typing
    if (formError) {
      setFormError(null);
    }
  };

  const handleCodeChange = (value: string, index: number): void => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);

    const newCode = formData.code.split("");
    newCode[index] = digit;
    const updatedCode = newCode.join("");

    setFormData((prev) => ({ ...prev, code: updatedCode }));
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.code;
      return newErrors;
    });
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
    if (e.key === "Backspace" && !formData.code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent): void => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    setFormData((prev) => ({ ...prev, code: pastedData.padEnd(6, "") }));

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const validateForm = (): boolean => {
    try {
      verifyPasswordSchema.parse(formData);
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
    if (code === "EMAIL_REQUIRED") {
      return "Email address is required.";
    }
    if (code === "CODE_REQUIRED") {
      return "Verification code is required.";
    }
    if (code === "NEW_PASSWORD_REQUIRED") {
      return "New password is required.";
    }
    if (code === "INVALID_CREDENTIALS") {
      return "Invalid email address.";
    }
    if (code === "VERIFICATION_CODE_MISSING") {
      return "Verification code is missing. Please request a new one.";
    }
    if (code === "VERIFICATION_EXPIRY_MISSING") {
      return "Verification session expired. Please request a new code.";
    }
    if (code === "VERIFICATION_CODE_EXPIRED") {
      return "Verification code has expired. Please request a new one.";
    }
    if (code === "INVALID_VERIFICATION_CODE") {
      return "Invalid verification code. Please check and try again.";
    }
    if (code === "WEAK_REQUIRED") {
      return "Please enter a strong password.";
    }

    // Handle HTTP status codes
    if (status === 400) {
      return "Invalid request. Please check all fields.";
    }
    if (status === 429) {
      return "Too many attempts. Please try again later.";
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
      const response = await axios.post<VerifyPasswordResponse>(
        `${Base_Url}/forget-password-verify-code`,
        {
          email: formData.email.trim(),
          code: formData.code,
          newPassword: formData.newPassword
        },
        {
          timeout: 15000,
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        toast.success("Password updated successfully!", {
          description: "You can now sign in with your new password."
        });

        // Navigate to signin page
        navigate("/admin/signin", { replace: true });
      } else {
        setFormError("Password reset failed. Please try again.");
      }
    } catch (error) {
      console.error("Password reset error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = getErrorMessage(error as AxiosError<ApiError>);
        setFormError(errorMessage);

        // Handle specific error codes with toast
        const code = error.response?.data?.code;
        if (code === "VERIFICATION_CODE_EXPIRED") {
          toast.error("Code Expired", {
            description: "Please request a new verification code."
          });
        } else if (code === "INVALID_VERIFICATION_CODE") {
          toast.error("Invalid Code", {
            description: "Please check your verification code and try again."
          });
        } else if (code === "WEAK_REQUIRED") {
          toast.error("Weak Password", {
            description: "Please choose a stronger password."
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
    if (!formData.email) {
      toast.error("Email required", {
        description: "Please enter your email address first."
      });
      return;
    }

    setIsResending(true);
    setFormError(null);

    try {
      const response = await axios.post(
        `${Base_Url}/forgot-password`,
        { email: formData.email.trim() },
        {
          timeout: 10000,
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        toast.success("New code sent!", {
          description: "Please check your email for the new verification code."
        });
        setTimeLeft(600); // Reset timer
        setFormData((prev) => ({ ...prev, code: "" })); // Clear current code
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
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Reset Password
            </CardTitle>
            <CardDescription className="text-center">
              Enter the verification code sent to your email and choose a new
              password
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
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
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={formErrors.email ? "border-red-500" : ""}
                  required
                  autoComplete="email"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-center block">Verification Code</Label>
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
                      value={formData.code[index] || ""}
                      onChange={(e) => handleCodeChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      className={`w-12 h-12 text-center text-lg font-semibold ${
                        formErrors.code ? "border-red-500" : ""
                      }`}
                      disabled={isLoading}
                    />
                  ))}
                </div>
                {formErrors.code && (
                  <p className="text-sm text-red-500 text-center">
                    {formErrors.code}
                  </p>
                )}

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
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">
                    New Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={formErrors.newPassword ? "border-red-500" : ""}
                      required
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      tabIndex={isLoading ? -1 : 0}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                  {formErrors.newPassword && (
                    <p className="text-sm text-red-500">
                      {formErrors.newPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Re-enter New Password{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={
                        formErrors.confirmPassword ? "border-red-500" : ""
                      }
                      required
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isLoading}
                      tabIndex={isLoading ? -1 : 0}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword
                          ? "Hide password"
                          : "Show password"}
                      </span>
                    </Button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Password must contain uppercase, lowercase, number and special
                  character
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                disabled={
                  isLoading ||
                  formData.code.length !== 6 ||
                  !formData.newPassword ||
                  !formData.confirmPassword ||
                  formData.newPassword !== formData.confirmPassword
                }
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>

              <div className="text-center">
                <Link
                  to="/admin/forgot-password"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to Forgot Password
                </Link>
              </div>
            </CardContent>
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
