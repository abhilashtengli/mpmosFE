"use client";

import type React from "react";

import { useState } from "react";
import { z } from "zod";
import { User, Edit3, Lock, Eye, EyeOff, Loader2, Save, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Base_Url } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";
import iimr from "@/assets/IIMR_logo.jpg";
import aicrp from "@/assets/AICRP_logo.png";
import cpgs from "@/assets/CPGS_logo.jpg";
// Validation schema matching backend
const updateUserValidation = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    name: z.string().min(1, { message: "Name is required" }).optional(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
          message:
            "Password must contain uppercase, lowercase, number and special character"
        }
      )
      .optional()
  })
  .refine((data) => data.name || data.password, {
    message: "At least one field (name or password) must be provided"
  });

interface FormErrors {
  [key: string]: string;
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ApiError {
  success: false;
  message: string;
  code: string;
  errors?: unknown;
}

export default function UserProfile() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [isEditingPassword, setIsEditingPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    currentPassword: "",
    password: ""
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

  const validateForm = (updateType: "name" | "password"): boolean => {
    try {
      interface ValidationData {
        currentPassword: string;
        name?: string;
        password?: string;
      }
      const dataToValidate: ValidationData = {
        currentPassword: formData.currentPassword
      };

      if (updateType === "name") {
        dataToValidate.name = formData.name;
      } else if (updateType === "password") {
        dataToValidate.password = formData.password;
      }

      updateUserValidation.parse(dataToValidate);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0]?.toString();
          if (path) {
            newErrors[path] = err.message;
          }
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
    if (code === "VALIDATION_ERROR") {
      return "Please check all fields and try again.";
    }
    if (code === "UNAUTHORIZED") {
      return "You are not authorized to perform this action.";
    }
    if (code === "USER_NOT_FOUND") {
      return "User account not found.";
    }
    if (code === "INVALID_PASSWORD") {
      return "Current password is incorrect.";
    }
    if (code === "UPDATE_FAILED") {
      return "Failed to update profile. Please try again.";
    }

    // Handle HTTP status codes
    if (status === 400) {
      return "Invalid request. Please check your input.";
    }
    if (status === 401) {
      return "Current password is incorrect.";
    }
    if (status === 404) {
      return "User account not found.";
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

  const handleUpdateProfile = async (
    updateType: "name" | "password"
  ): Promise<void> => {
    if (!validateForm(updateType)) {
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      interface RequestData {
        currentPassword: string;
        name?: string;
        password?: string;
      }
      const requestData: RequestData = {
        currentPassword: formData.currentPassword
      };

      if (updateType === "name") {
        requestData.name = formData.name.trim();
      } else if (updateType === "password") {
        requestData.password = formData.password;
      }

      const response = await axios.put<UpdateProfileResponse>(
        `${Base_Url}/update-profile`,
        requestData,
        {
          timeout: 15000,
          withCredentials: true,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success && response.data.data) {
        // Update user in store
        setUser({
          ...user!,
          name: response.data.data.name
        });

        toast.success("Profile updated successfully!", {
          description:
            updateType === "name"
              ? "Your name has been updated."
              : "Your password has been updated."
        });

        // Reset form and close editing mode
        setFormData({
          name: response.data.data.name,
          currentPassword: "",
          password: ""
        });
        setIsEditingName(false);
        setIsEditingPassword(false);
      } else {
        setFormError("Profile update failed. Please try again.");
      }
    } catch (error) {
      console.error("Profile update error:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage = getErrorMessage(error as AxiosError<ApiError>);
        setFormError(errorMessage);

        // Handle specific error codes with toast
        const code = error.response?.data?.code;
        if (code === "INVALID_PASSWORD") {
          toast.error("Incorrect Password", {
            description: "Please check your current password and try again."
          });
        } else if (code === "VALIDATION_ERROR") {
          toast.error("Validation Error", {
            description: "Please check all fields and try again."
          });
        }
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = (): void => {
    setFormData({
      name: user?.name || "",
      currentPassword: "",
      password: ""
    });
    setFormErrors({});
    setFormError(null);
    setIsEditingName(false);
    setIsEditingPassword(false);
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-gray-500">Please sign in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className=" border-blue-700 w-full h-full">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
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
              <h1 className="text-2xl font-bold text-zinc-700">
                Account Details
              </h1>
            </div>
          </div>
        </div>
      </header>
      <div className="w-full  gap-6 p-4 mx-auto space-y-6  border-red-600">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Profile Information</CardTitle>
                <CardDescription>
                  View and manage your account details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Name
                </Label>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Role
                </Label>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">
                Email Address
              </Label>
              <p className="text-lg font-medium">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Update Name Section */}
        <div className="grid grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">Update Name</CardTitle>
                    <CardDescription>Change your display name</CardDescription>
                  </div>
                </div>
                {!isEditingName && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingName ? (
                <div className="space-y-4">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">
                      New Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your new name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      Current Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter your current password"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={
                          formErrors.currentPassword ? "border-red-500" : ""
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        disabled={isLoading}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    {formErrors.currentPassword && (
                      <p className="text-sm text-red-500">
                        {formErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateProfile("name")}
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? "Updating..." : "Update Name"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  Click "Edit" to change your name
                </p>
              )}
            </CardContent>
          </Card>

          {/* Update Password Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-red-600" />
                  <div>
                    <CardTitle className="text-lg">Update Password</CardTitle>
                    <CardDescription>
                      Change your account password
                    </CardDescription>
                  </div>
                </div>
                {!isEditingPassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingPassword(true)}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditingPassword ? (
                <div className="space-y-4">
                  {formError && (
                    <Alert variant="destructive">
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPasswordForPassword">
                      Current Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPasswordForPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter your current password"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={
                          formErrors.currentPassword ? "border-red-500" : ""
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        disabled={isLoading}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    {formErrors.currentPassword && (
                      <p className="text-sm text-red-500">
                        {formErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      New Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={formErrors.password ? "border-red-500" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isLoading}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    {formErrors.password && (
                      <p className="text-sm text-red-500">
                        {formErrors.password}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Password must contain uppercase, lowercase, number and
                      special character
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateProfile("password")}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      <Lock className="mr-2 h-4 w-4" />
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">
                  Click "Change" to update your password
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
