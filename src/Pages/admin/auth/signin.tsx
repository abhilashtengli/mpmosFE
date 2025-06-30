// const handleLogin = async () => {
//   try {
//     const res = await loginAPI({ email, password });
//     useAuthStore.getState().setUser(res.user);
//     // navigate to dashboard or homepage
//   } catch (err) {
//     console.error("Login failed", err);
//   }
// };

import { useEffect, useState } from "react";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios, { AxiosError } from "axios";

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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Base_Url } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";
import iimr from "@/assets/IIMR_logo.jpg";
import aicrp from "@/assets/AICRP_logo.png";
import cpgs from "@/assets/CPGS_logo.jpg";

// Form validation schema
const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

interface FormErrors {
  [key: string]: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  sessionId: string;
}

interface SigninResponse {
  success: boolean;
  data?: User;
  message: string;
  code: string;
}

interface ApiError {
  success: false;
  message: string;
  code: string;
}

export default function SigninPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const { setUser, isAuthenticated, clearError } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || "/admin/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

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
      clearError();
    }
  };

  const validateForm = (): boolean => {
    try {
      signinSchema.parse(formData);
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

    if (status === 401) {
      return "Invalid email or password. Please check your credentials.";
    }

    if (status === 403) {
      return "Please verify your email address before signing in.";
    }

    if (status === 429) {
      return "Too many login attempts. Please try again later.";
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
    clearError();

    try {
      const response = await axios.post<SigninResponse>(
        `${Base_Url}/signin`,
        {
          email: formData.email.trim(),
          password: formData.password
        },
        {
          timeout: 10000, // 10 second timeout
          withCredentials: true, // Important for cookies
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success && response.data.data) {
        // Store user data
        setUser(response.data.data);

        toast.success("Signed in successfully", {
          description: `Welcome back, ${response.data.data.name}!`
        });

        // Navigate to dashboard
        const from = location.state?.from || "/admin/dashboard";
        navigate(from, { replace: true });
      } else {
        setFormError("Signin failed. Please try again.");
      }
    } catch (error) {
      console.error("Signin error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = getErrorMessage(error as AxiosError<ApiError>);
        setFormError(errorMessage);

        // Handle specific error codes
        if (error.response?.data?.code === "USER_NOT_VERIFIED") {
          toast.error("Email verification required", {
            description: "Please check your email and verify your account."
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
                  src={aicrp}
                  alt="AICRP on Sorghum and Millets"
                  className="rounded-full w-12 h-12 object-contain"
                />
              </div>
              <div className=" w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                <img
                  src={cpgs}
                  alt="CPGS Logo"
                  className=" rounded-full w-20 h-20 object-contain"
                />
              </div>
              <div className="w-24 h-14 rounded- flex items-center justify-center shadow-md">
                <img
                  src={iimr}
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
          <CardHeader className="space-y-1 pt-10">
            <CardTitle className="text-2xl font-bold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the dashboard
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
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Link
                    to="/admin/signin"
                    className="text-xs text-green-600 hover:text-green-700"
                    tabIndex={isLoading ? -1 : 0}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={formErrors.password ? "border-red-500" : ""}
                    required
                    autoComplete="current-password"
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
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 mb-4">
              <Button
                type="submit"
                className="w-full bg-green-600 mt-5 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              {/* <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-green-600 hover:text-green-700 focus:outline-none focus:underline"
                  tabIndex={isLoading ? -1 : 0}
                >
                  Request access
                </Link>
              </p> */}
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
