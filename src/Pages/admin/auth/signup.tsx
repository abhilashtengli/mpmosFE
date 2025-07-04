import { useState } from "react";
import { z } from "zod";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { Base_Url } from "@/lib/constants";
import iimr from "@/assets/IIMR_logo.jpg";
import aicrp from "@/assets/AICRP_logo.png";
import cpgs from "@/assets/CPGS_logo.jpg";

// Form validation schema (matching backend)
const signupValidation = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message:
        "Password must contain uppercase, lowercase, number and special character"
    }),
  role: z.enum(["admin", "director"], { message: "Please select a role" })
});

interface FormErrors {
  [key: string]: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SignupResponse {
  success: boolean;
  data?: User;
  message: string;
  code?: string;
}

interface ApiError {
  success: false;
  message: string;
  code: string;
  errors?: unknown;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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

  const handleRoleChange = (value: string): void => {
    setFormData((prev) => ({ ...prev, role: value }));

    // Clear role error
    if (formErrors.role) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.role;
        return newErrors;
      });
    }

    if (formError) {
      setFormError(null);
    }
  };

  const validateForm = (): boolean => {
    try {
      signupValidation.parse(formData);
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
    if (status === 409) {
      return "User already exists with this email address.";
    }
    if (status === 400) {
      return "Invalid input data. Please check all fields.";
    }
    if (status === 403) {
      return "You don't have permission to create new users.";
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
      const response = await axios.post<SignupResponse>(
        `${Base_Url}/signup`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role
        },
        {
          timeout: 15000, // 15 second timeout
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success && response.data.data) {
        toast.success("Account created successfully!", {
          description: "Please check the email provided for verification code."
        });

        // Navigate to verification page with user data
        navigate("/admin/verify-email", {
          state: {
            email: formData.email,
            name: formData.name,
            userId: response.data.data.id
          },
          replace: true
        });
      } else {
        setFormError("Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = getErrorMessage(error as AxiosError<ApiError>);
        setFormError(errorMessage);

        // Handle specific error codes
        if (error.response?.data?.code === "VALIDATION_ERROR") {
          toast.error("Validation Error", {
            description: "Please check all fields and try again."
          });
        } else if (error.response?.data?.code === "INVALID") {
          toast.error("User Already Exists", {
            description: "An account with this email already exists."
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
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Fill in the details to create a new user account
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
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={formErrors.name ? "border-red-500" : ""}
                  required
                  autoComplete="name"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
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
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={formErrors.role ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="director">Project Director</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.role && (
                  <p className="text-sm text-red-500">{formErrors.role}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={formErrors.password ? "border-red-500" : ""}
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
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
                <p className="text-xs text-gray-500">
                  Password must contain uppercase, lowercase, number and special
                  character
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
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
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
