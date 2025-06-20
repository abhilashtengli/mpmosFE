"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  ImageIcon,
  UserRound,
  Trash2,
  UploadCloud,
  Loader2
} from "lucide-react";
import axios, { AxiosError } from "axios";
import { Base_Url, quarterlyData, SignedUrlResponse } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";
import { useProjectStore } from "@/stores/useProjectStore";
import EnhancedShimmerTableRows from "@/components/shimmer-rows";
import { useNavigate } from "react-router-dom";
import { getSignedUrl } from "@/services/cloudflare/getSignedUrl";
import uploadFileToCloudflare from "@/services/cloudflare/uploadFileToCloudFlare";
import deleteFileFromCloudflare from "@/services/cloudflare/deleteFileFromCloudflare";

// Add these validation schemas (you'll need to create the validation file)
const baseAwarenessSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(100, { message: "Title cannot exceed 100 characters" }),
  projectId: z.string().trim().min(1, { message: "Project is required" }),
  quarterId: z.string().trim().min(1, { message: "Quarter is required" }),
  target: z
    .number({ invalid_type_error: "Target must be a number" })
    .int({ message: "Target must be an integer" })
    .nonnegative({ message: "Target must be zero or positive" }),
  achieved: z
    .number({ invalid_type_error: "Achieved must be a number" })
    .int({ message: "Achieved must be an integer" })
    .nonnegative({ message: "Achieved must be zero or positive" }),
  district: z
    .string()
    .trim()
    .min(2, { message: "District must be at least 2 characters" })
    .max(100, { message: "District cannot exceed 100 characters" }),
  remarks: z
    .string()
    .trim()
    .max(300, { message: "Remarks cannot exceed 300 characters" })
    .optional()
    .nullable(),
  village: z
    .string()
    .trim()
    .min(2, { message: "Village must be at least 2 characters" })
    .max(100, { message: "Village cannot exceed 100 characters" }),
  block: z
    .string()
    .trim()
    .min(2, { message: "Block must be at least 2 characters" })
    .max(100, { message: "Block cannot exceed 100 characters" }),
  beneficiaryMale: z
    .number({ invalid_type_error: "Male beneficiary count must be a number" })
    .int({ message: "Male beneficiary count must be an integer" })
    .nonnegative({
      message: "Male beneficiary count must be zero or positive"
    }),
  beneficiaryFemale: z
    .number({ invalid_type_error: "Female beneficiary count must be a number" })
    .int({ message: "Female beneficiary count must be an integer" })
    .nonnegative({
      message: "Female beneficiary count must be zero or positive"
    }),
  units: z
    .string()
    .trim()
    .refine((val) => val === "" || val.length >= 1, {
      message: "Units must be specified if provided"
    })
    .transform((val) => (val === "" ? null : val))
    .optional()
    .nullable()
});

const createAwarenessValidation = baseAwarenessSchema.refine(
  (data) => data.achieved <= data.target,
  {
    message: "Achieved count cannot exceed target count",
    path: ["achieved"]
  }
);

const updateAwarenessProgramValidation = z
  .object({
    projectId: z
      .string()
      .trim()
      .uuid({ message: "Invalid project ID format" })
      .optional(),
    quarterId: z
      .string()
      .trim()
      .uuid({ message: "Invalid quarter ID format" })
      .optional(),
    title: z
      .string()
      .trim()
      .min(2, { message: "Title must be at least 2 characters" })
      .max(100, { message: "Title cannot exceed 100 characters" })
      .optional(),
    target: z
      .number({ invalid_type_error: "Target must be a number" })
      .int({ message: "Target must be an integer" })
      .nonnegative({ message: "Target must be zero or positive" })
      .optional(),
    achieved: z
      .number({ invalid_type_error: "Achieved must be a number" })
      .int({ message: "Achieved must be an integer" })
      .nonnegative({ message: "Achieved must be zero or positive" })
      .optional(),
    district: z
      .string()
      .trim()
      .min(2, { message: "District must be at least 2 characters" })
      .max(100, { message: "District cannot exceed 100 characters" })
      .optional(),
    village: z
      .string()
      .trim()
      .min(2, { message: "Village must be at least 2 characters" })
      .max(100, { message: "Village cannot exceed 100 characters" })
      .optional(),
    remarks: z
      .string()
      .trim()
      .max(300, { message: "Remarks cannot exceed 300 characters" })
      .optional()
      .nullable(),
    block: z
      .string()
      .trim()
      .min(2, { message: "Block must be at least 2 characters" })
      .max(100, { message: "Block cannot exceed 100 characters" })
      .optional(),
    beneficiaryMale: z
      .number({ invalid_type_error: "Male beneficiary count must be a number" })
      .int({ message: "Male beneficiary count must be an integer" })
      .nonnegative({
        message: "Male beneficiary count must be zero or positive"
      })
      .optional(),
    beneficiaryFemale: z
      .number({
        invalid_type_error: "Female beneficiary count must be a number"
      })
      .int({ message: "Female beneficiary count must be an integer" })
      .nonnegative({
        message: "Female beneficiary count must be zero or positive"
      })
      .optional(),
    imageUrl: z
      .string()
      .trim()
      .url({ message: "Invalid image URL format" })
      .optional()
      .nullable(),
    imageKey: z.string().trim().optional().nullable(),
    units: z
      .string()
      .trim()
      .refine((val) => val === "" || val.length >= 1, {
        message: "Units must be specified if provided"
      })
      .transform((val) => (val === "" ? null : val))
      .optional()
      .nullable()
  })
  .refine(
    (data) => {
      // Skip refinement if we don't have both target and achieved
      if (data.target === undefined || data.achieved === undefined) {
        return true;
      }
      // For update validation, we need to compare the values only if both are provided
      return data.achieved <= data.target;
    },
    {
      message: "Achieved count cannot exceed target count",
      path: ["achieved"]
    }
  )
  .refine(
    (data) => {
      // Skip if imageUrl is not being updated
      if (data.imageUrl === undefined) {
        return true;
      }
      // If imageUrl is null, we don't need to check for imageKey
      if (data.imageUrl === null) {
        return true;
      }
      // If setting a new imageUrl, ensure imageKey is also set
      if (data.imageUrl && !data.imageKey) {
        return false;
      }
      return true;
    },
    {
      message: "Image key is required when image URL is provided",
      path: ["imageKey"]
    }
  );

interface AwarenessProgram {
  id: string;
  awarnessprogramId: string;
  title: string;
  project: {
    id: string;
    title: string;
  };
  quarter: {
    id: string;
    number: number;
    year: number;
  };
  target: number;
  achieved: number;
  district: string;
  village: string;
  block: string;
  imageUrl?: string;
  imageKey?: string;
  beneficiaryMale: number;
  beneficiaryFemale: number;
  units: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: string;
    name: string;
  };
}

interface AwarenessViewProps {
  awareness: AwarenessProgram;
}

interface AwarenessFormProps {
  awareness?: AwarenessProgram;
  onSave: (data: AwarenessFormData) => void;
  onClose: () => void;
  isEdit?: boolean;
}

interface AwarenessFormData {
  title: string;
  projectId: string;
  quarterId: string;
  target: number;
  achieved: number;
  district: string;
  village: string;
  block: string;
  beneficiaryMale: number;
  beneficiaryFemale: number;
  imageUrl?: string | null;
  imageKey?: string | null;
  units: string;
  remarks: string;
  imageFile?: File | null;
}

type FormErrors = {
  [key: string]: string;
};
interface ApiErrorResponse {
  success: boolean;
  message: string;
  code: string;
  errors?: unknown;
  path?: string[];
}

interface ApiSuccessResponse {
  success: true;
  message: string;
  data: AwarenessProgram;
  code: string;
}

export default function AwarenessPage() {
  const [awarenessPrograms, setAwarnessProgram] = useState<AwarenessProgram[]>(
    []
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedAwareness, setSelectedAwareness] =
    useState<AwarenessProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const projects = useProjectStore((state) => state.projects);
  const logOut = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const userRole = useAuthStore((state) => state.user);

  //Fetch training Data
  const fetchAwarnessPrograms = async () => {
    try {
      setIsLoading(true);

      const endpoint =
        userRole?.role === "admin" // Changed from userRole?.role
          ? "get-admin-awarness-programs"
          : "get-user-awarness-programs";
      const response = await axios.get(`${Base_Url}/${endpoint}`, {
        withCredentials: true
      });

      const data = response.data;

      if (response.data.code === "NO_PROGRAMS_FOUND") {
        toast.info("No Programs Found", {
          description: "No program data available. Please add new data."
        });
        return;
      } else if (response.data.code === "UNAUTHORIZED") {
        toast.info("UNAUTHORIZED", {
          description: `${response.data.message}`
        });
        logOut();
      } else if (!data.success || response.status !== 200) {
        throw new Error(data.message || "Failed to fetch Awarness programs");
      }
      const mappedAwarnessPrograms: AwarenessProgram[] = (data.data || []).map(
        (item: AwarenessProgram) => ({
          id: item.id,
          awarnessprogramId: item.awarnessprogramId,
          title: item.title,
          project: {
            id: item.project.id,
            title: item.project.title
          },
          quarter: {
            id: item.quarter.id,
            number: item.quarter.number,
            year: item.quarter.year
          },
          target: item.target,
          achieved: item.achieved,
          district: item.district,
          village: item.village,
          block: item.block,
          beneficiaryMale: item.beneficiaryMale,
          beneficiaryFemale: item.beneficiaryFemale,
          units: item.units,
          remarks: item.remarks,
          imageUrl: item.imageUrl ?? undefined,
          imageKey: item.imageKey ?? undefined,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          User: item.User
            ? { id: item.User.id, name: item.User.name }
            : undefined
        })
      );
      setAwarnessProgram(mappedAwarnessPrograms || []);
    } catch (error: unknown) {
      const defaultMessage =
        "An unexpected error occurred while fetching data.";
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<ApiErrorResponse>;
        const apiErrorMessage = err.response?.data?.message || err.message;

        toast.error("Fetch Failed", {
          description: apiErrorMessage || defaultMessage
        });
      } else {
        toast.error("Failed", {
          description:
            "An unexpected error occurred while fetching Awarness programm"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAwarnessPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  // Filter awareness programs based on search and filter criteria
  const filteredAwareness: AwarenessProgram[] = awarenessPrograms.filter(
    (awareness) => {
      const matchesSearch =
        awareness.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        awareness.awarnessprogramId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        awareness.project.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Get quarter IDs based on year and quarter selection
      let matchesYearQuarter: boolean = true;

      if (
        (selectedYear && selectedYear !== "all") ||
        (selectedQuarter && selectedQuarter !== "all")
      ) {
        // Find matching quarter IDs from quarterlyData
        const matchingQuarterIds = quarterlyData
          .filter((q) => {
            const yearMatch =
              !selectedYear ||
              selectedYear === "all" ||
              q.year === parseInt(selectedYear);
            const quarterMatch =
              !selectedQuarter ||
              selectedQuarter === "all" ||
              q.number === parseInt(selectedQuarter);
            return yearMatch && quarterMatch;
          })
          .map((q) => q.id);

        // Check if training's quarterId matches any of the filtered quarter IDs
        matchesYearQuarter = matchingQuarterIds.includes(awareness.quarter.id);
      }

      const matchesProject =
        !selectedProject ||
        selectedProject === "all" ||
        awareness.project.title === selectedProject;
      const matchesDistrict =
        !selectedDistrict ||
        selectedDistrict === "all" ||
        awareness.district === selectedDistrict;

      return (
        matchesSearch && matchesYearQuarter && matchesProject && matchesDistrict
      );
    }
  );

  const uniqueProjectTitle = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return Array.from(new Set(projects.map((project) => project.title)));
  }, [projects]);

  const uniqueDistrict = useMemo(() => {
    if (!awarenessPrograms || awarenessPrograms.length === 0) return [];
    return Array.from(
      new Set(awarenessPrograms.map((program) => program.district))
    );
  }, [awarenessPrograms]);

  const handleView = (awareness: AwarenessProgram): void => {
    setSelectedAwareness(awareness);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (awareness: AwarenessProgram): void => {
    setSelectedAwareness(awareness);
    setIsEditDialogOpen(true);
  };
  const handleDelete = (training: AwarenessProgram): void => {
    setSelectedAwareness(training);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (
    formData: AwarenessFormData,
    operation: "create" | "update" = "create",
    awarnessId?: string
  ): Promise<boolean> => {
    // Input validation

    // console.log("DATA : ", formData);

    if (operation === "update" && !awarnessId) {
      toast.error("Awarness program ID is required for update operation");
      return false;
    }

    // Validate required fields
    if (!formData.title?.trim()) {
      toast.error("Awarness program title is required");
      return false;
    }

    if (!formData.projectId?.trim()) {
      toast.error("Project is required");
      return false;
    }

    if (!formData.quarterId?.trim()) {
      toast.error("Quarter is required");
      return false;
    }

    if (!formData.target || formData.target <= 0) {
      toast.error("Valid target number is required");
      return false;
    }

    // Show loading toast
    const loadingToast = toast.loading(
      `${operation === "create" ? "Creating" : "Updating"} Awarness program...`
    );

    try {
      let response;
      const config = {
        withCredentials: true,
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json"
        }
      };

      // Prepare request data
      const requestData = {
        projectId: formData.projectId,
        quarterId: formData.quarterId,
        title: formData.title,
        target: formData.target || 0,
        achieved: formData.achieved || 0,
        district: formData.district,
        village: formData.village,
        block: formData.block,
        beneficiaryMale: formData.beneficiaryMale || 0,
        beneficiaryFemale: formData.beneficiaryFemale || 0,
        units: formData.units,
        remarks: formData.remarks,
        imageKey: formData.imageKey || null,
        imageUrl: formData.imageUrl || null
      };
      console.log("Request-Data : ", requestData);
      if (operation === "create") {
        response = await axios.post(
          `${Base_Url}/create-awareness-program`,
          requestData,
          config
        );
      } else {
        response = await axios.put(
          `${Base_Url}/update-awareness-program/${awarnessId}`,
          requestData,
          config
        );
      }

      // Handle successful response
      if (response?.status === 201 || response?.status === 200) {
        const data = response.data as ApiSuccessResponse;

        // Refresh trainings list
        // fetchTrainings();
        toast.success(data.message || `Training ${operation}d successfully`, {
          description: `${data.data.title} `,
          duration: 6000
        });

        // console.log(`Training `, data.data);

        // Update local state
        if (operation === "create") {
          const newTraining: AwarenessProgram = {
            id: data.data.id,
            awarnessprogramId: data.data.awarnessprogramId,
            title: data.data.title,
            project: {
              id: data.data.project.id, // assuming this is coming from the form
              title: data.data.project.title // you must get this from `projects` store or from form
            },
            quarter: {
              id: data.data.quarter.id,
              number: Number(data.data.quarter.number),
              year: Number(data.data.quarter.year)
            },
            target: data.data.target,
            achieved: data.data.achieved || 0,
            district: data.data.district,
            village: data.data.village,
            block: data.data.block,
            beneficiaryMale: data.data.beneficiaryMale || 0,
            beneficiaryFemale: data.data.beneficiaryFemale || 0,
            units: data.data.units,
            remarks: data.data.remarks,
            imageUrl: data.data.imageUrl,
            imageKey: data.data.imageKey,
            createdAt: "",
            updatedAt: "",
            User:
              data.data.User?.id && data.data.User?.name
                ? {
                    id: data.data.User.id,
                    name: data.data.User.name
                  }
                : undefined
          };
          setAwarnessProgram((prev) => [newTraining, ...prev]);
        } else if (operation === "update" && awarnessId) {
          setAwarnessProgram((prev) =>
            prev.map((t) =>
              t.id === awarnessId
                ? {
                    ...t,
                    title: data.data.title,
                    project: {
                      id: data.data.project.id, // assuming this is coming from the form
                      title: data.data.project.title // you must get this from `projects` store or from form
                    },
                    quarter: {
                      id: data.data.quarter.id,
                      number: Number(data.data.quarter.number),
                      year: Number(data.data.quarter.year)
                    },
                    target: data.data.target,
                    achieved: data.data.achieved || 0,
                    district: data.data.district,
                    village: data.data.village,
                    block: data.data.block,
                    beneficiaryMale: data.data.beneficiaryMale || 0,
                    beneficiaryFemale: data.data.beneficiaryFemale || 0,
                    units: data.data.units,
                    remarks: data.data.remarks,
                    imageUrl: data.data.imageUrl,
                    imageKey: data.data.imageKey,
                    User:
                      data.data.User?.id && data.data.User?.name
                        ? {
                            id: data.data.User.id,
                            name: data.data.User.name
                          }
                        : undefined
                  }
                : t
            )
          );
        }

        // Close dialogs on success
        setIsDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedAwareness(null);

        return true;
      }

      // Handle unexpected success status codes
      toast.error(`Unexpected response status: ${response?.status}`);
      return false;
    } catch (error) {
      console.error(`Error ${operation}ing training:`, error);

      // Comprehensive error handling for production
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        if (axiosError.response) {
          // Server responded with error status
          const { status, data } = axiosError.response;

          switch (status) {
            case 400:
              // Validation errors or invalid input
              if (data?.code === "VALIDATION_ERROR" && data.errors) {
                toast.error("Validation Error", {
                  description:
                    "There no data to update or Please check your input and try again",
                  duration: 5000
                });
                console.error("Validation errors:", data.errors);
              } else if (data?.code === "INVALID_INPUT") {
                toast.error("Invalid Input", {
                  description: data.message || "Please check your input",
                  duration: 5000
                });
              } else {
                toast.error(data?.message || "Invalid input provided");
              }
              break;

            case 401:
              toast.error("Authentication Required", {
                description: "Please sign in to continue",
                duration: 5000
              });
              // Handle logout and redirect
              if (typeof logOut === "function") {
                logOut();
              }
              if (typeof navigate === "function") {
                navigate("/signin");
              }
              break;

            case 403:
              toast.error("Access Denied", {
                description: "You don't have permission to perform this action",
                duration: 5000
              });
              break;

            case 404:
              if (data?.code === "RESOURCE_NOT_FOUND") {
                if (data.message?.toLowerCase().includes("project")) {
                  toast.error("Project Not Found", {
                    description: "The selected project doesn't exist",
                    duration: 5000
                  });
                } else if (data.message?.toLowerCase().includes("quarter")) {
                  toast.error("Quarter Not Found", {
                    description: "The selected quarter doesn't exist",
                    duration: 5000
                  });
                } else if (data.message?.toLowerCase().includes("training")) {
                  toast.error("Training Not Found", {
                    description:
                      "The training you're trying to update doesn't exist",
                    duration: 5000
                  });
                } else {
                  toast.error("Resource Not Found", {
                    description:
                      data.message || "The requested resource doesn't exist",
                    duration: 5000
                  });
                }
              } else {
                toast.error("Not Found", {
                  description: "The requested resource was not found",
                  duration: 5000
                });
              }
              break;

            case 409:
              toast.error("Duplicate Training", {
                description:
                  data?.message || "A training with this title already exists",
                duration: 5000
              });
              break;

            case 422:
              toast.error("Invalid Data", {
                description: data?.message || "The provided data is invalid",
                duration: 5000
              });
              break;

            case 429:
              toast.error("Too Many Requests", {
                description: "Please wait a moment before trying again",
                duration: 5000
              });
              break;

            case 500:
            case 502:
            case 503:
            case 504:
              toast.error("Server Error", {
                description:
                  "Something went wrong on our end. Please try again later",
                duration: 5000
              });
              break;

            default:
              toast.error("Unexpected Error", {
                description:
                  data?.message || `Error ${status}: Something went wrong`,
                duration: 5000
              });
          }
        } else if (axiosError.request) {
          // Network error - no response received
          if (axiosError.code === "ECONNABORTED") {
            toast.error("Request Timeout", {
              description: "The request took too long. Please try again",
              duration: 5000
            });
          } else if (axiosError.code === "ERR_NETWORK") {
            toast.error("Network Error", {
              description:
                "Please check your internet connection and try again",
              duration: 5000
            });
          } else {
            toast.error("Connection Error", {
              description:
                "Unable to connect to the server. Please try again later",
              duration: 5000
            });
          }
        } else {
          // Something else happened during request setup
          toast.error("Request Error", {
            description:
              "An unexpected error occurred while making the request",
            duration: 5000
          });
        }
      } else {
        // Non-Axios error (JavaScript errors, etc.)
        toast.error("Unexpected Error", {
          description: "An unexpected error occurred. Please try again",
          duration: 5000
        });
      }

      return false;
    } finally {
      // Always dismiss loading toast
      toast.dismiss(loadingToast);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteAwarness = async () => {
    if (!selectedAwareness) {
      toast.error("No Training selected", {
        description: "Please select a training to delete"
      });
      return;
    }
    setIsDeleting(true);
    const loadingToast = toast.loading(
      `Deleting "${selectedAwareness.title}"...`
    );

    try {
      const response = await axios.delete(
        `${Base_Url}/delete-awarness-program/${selectedAwareness.id}`,
        {
          withCredentials: true,
          timeout: 30000
        }
      );

      if (response.status === 200 && response.data.success) {
        if (response.data.warning) {
          // Show warning toast for partial success
          toast.warning("Training deleted with warnings", {
            description: `${selectedAwareness.title} was removed from database, but ${response.data.warning}`,
            duration: 8000 // Longer duration for warnings
          });
        } else {
          // Show success toast for complete success
          toast.success("Training deleted", {
            description: `${selectedAwareness.title} deleted successfully`,
            duration: 5000
          });
        }
        setAwarnessProgram((prevTrainings) =>
          prevTrainings.filter(
            (training) => training.id !== selectedAwareness.id
          )
        );
        setSelectedAwareness(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Deletion failed", {
          description:
            response.data?.message || "Program deletion was not completed"
        });
      }
    } catch (error: unknown) {
      console.error("Delete project error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        const errorMap: Record<number, { title: string; fallback: string }> = {
          400: {
            title: "Invalid request",
            fallback: "The project ID is invalid"
          },
          401: { title: "Authentication required", fallback: "Please sign in" },
          403: { title: "Access denied", fallback: "Permission denied" },
          404: {
            title: "Awarness program not found",
            fallback: "Awarness program may already be deleted"
          },
          409: {
            title: "Conflict",
            fallback: "Cannot delete due to dependencies"
          },
          500: {
            title: "Server error",
            fallback: "Something went wrong on our end"
          }
        };

        if (status && errorMap[status]) {
          const { title, fallback } = errorMap[status];
          toast.error(title, { description: message || fallback });
        } else if (error.code === "ECONNABORTED") {
          toast.error("Timeout", {
            description: "Request took too long. Please try again"
          });
        } else {
          toast.error("Network error", {
            description: "Check your internet connection"
          });
        }
      } else {
        toast.error("Unexpected error", {
          description: "Something went wrong. Please try again"
        });
      }
    } finally {
      setIsDeleting(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Awareness Programs
              </h1>
              <p className="text-sm text-gray-600">
                Manage awareness campaigns and track beneficiaries
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Program
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Awareness Program</DialogTitle>
                <DialogDescription>
                  Create a new awareness program entry with target and
                  achievement data
                </DialogDescription>
              </DialogHeader>
              <AwarenessForm
                onSave={(formData) => handleSave(formData, "create")}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-4.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search trainings..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedQuarter}
                onValueChange={setSelectedQuarter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  <SelectItem value="1">Q1</SelectItem>
                  <SelectItem value="2">Q2 </SelectItem>
                  <SelectItem value="3">Q3 </SelectItem>
                  <SelectItem value="4">Q4 </SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Years</SelectItem>
                  {Array.from({ length: 16 }, (_, i) => 2020 + i).map(
                    (year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {uniqueProjectTitle.map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {uniqueDistrict.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Awareness Programs List */}
        <Card>
          <CardHeader>
            <CardTitle>Awareness Programs</CardTitle>
            <CardDescription>
              List of all awareness programs with target vs achievement tracking
              {filteredAwareness.length !== awarenessPrograms.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredAwareness.length} of {awarenessPrograms.length}{" "}
                  shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Target/Achieved</TableHead>
                  {userRole?.role === "admin" && (
                    <TableHead>Creadted By</TableHead>
                  )}
                  <TableHead>Beneficiaries</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <EnhancedShimmerTableRows />
                ) : filteredAwareness.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      No awareness programs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAwareness.map((awareness) => (
                    <TableRow key={awareness.id}>
                      <TableCell className="font-medium">
                        {awareness.awarnessprogramId}
                      </TableCell>
                      <TableCell className="truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                        {awareness.title}
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                        {awareness.project.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {(() => {
                            const quarterInfo = quarterlyData.find(
                              (q) => q.id === awareness.quarter.id
                            );
                            return quarterInfo
                              ? `Q${quarterInfo.number} ${quarterInfo.year}`
                              : "Unknown Quarter";
                          })()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                        {awareness.district}, {awareness.village}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {awareness.achieved}
                          </span>
                          <span className="text-gray-700">
                            {" "}
                            / {awareness.target} {awareness.units}
                          </span>
                        </div>
                      </TableCell>
                      {userRole?.role === "admin" && (
                        <TableCell>{awareness.User?.name || "N/A"}</TableCell>
                      )}
                      <TableCell>
                        <div className="text-sm flex flex-col gap-y-1">
                          <Badge variant="outline">
                            <div className="w-16 flex gap-x-1">
                              <UserRound className="h-4 w-4 text-blue-500" />
                              M: {awareness.beneficiaryMale}
                            </div>
                          </Badge>
                          <Badge variant="outline">
                            <div className="w-16 flex gap-x-1">
                              <UserRound className="h-4 w-4 text-pink-500" />
                              F: {awareness.beneficiaryFemale}
                            </div>
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(awareness)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(awareness)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(awareness)}
                          >
                            <Trash2 className="h-3 w-3 mr-1 text-red-600" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Awareness Program Details</DialogTitle>
              <DialogDescription>
                View complete awareness program information
              </DialogDescription>
            </DialogHeader>
            {selectedAwareness && (
              <AwarenessView awareness={selectedAwareness} />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Awareness Program</DialogTitle>
              <DialogDescription>
                Update awareness program information
              </DialogDescription>
            </DialogHeader>
            {selectedAwareness && (
              <AwarenessForm
                awareness={selectedAwareness}
                onSave={(formData) =>
                  handleSave(formData, "update", selectedAwareness.id)
                }
                onClose={() => setIsEditDialogOpen(false)}
                isEdit={true}
              />
            )}
          </DialogContent>
        </Dialog>

        {/*Delete awarness Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-black">
                ⚠️ Confirm Awarness Program Deletion
              </DialogTitle>
              <DialogDescription>
                <br />
                <span className="block mt-2">
                  Are you sure you want to delete this awareness program?
                </span>
                <span className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </span>
              </DialogDescription>
            </DialogHeader>

            {selectedAwareness && (
              <div className="grid gap-2 py-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Title : </span>
                  {selectedAwareness?.title}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Project :{" "}
                  </span>
                  {selectedAwareness?.project.title}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    District :{" "}
                  </span>
                  {selectedAwareness?.district}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Village :{" "}
                  </span>
                  {selectedAwareness?.village}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteAwarness();
                }}
                disabled={isDeleting}
                className="cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function AwarenessView({ awareness }: AwarenessViewProps) {
  const projects = useProjectStore((state) => state.projects);

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Program ID
          </Label>
          <p className="text-md font-semibold">{awareness.awarnessprogramId}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Program Title
          </Label>
          <p className="text-md">{awareness.title}</p>
        </div>
      </div>

      <hr />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          {projects.find((p) => p.id === awareness.project.id)?.title ||
            "Unknown project"}
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <Badge variant="outline">
            Q
            {quarterlyData.find((q) => q.id === awareness.quarter.id)?.number ||
              "Unknown"}{" "}
            {quarterlyData.find((q) => q.id === awareness.quarter.id)?.year ||
              ""}
          </Badge>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">District</Label>
          <p>{awareness.district}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Village</Label>
          <p>{awareness.village}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Block</Label>
          <p>{awareness.block}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Target</Label>
          <p className="text-lg font-semibold text-gray-600">
            {awareness.target}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Achieved</Label>
          <p className="text-lg font-semibold text-green-600">
            {awareness.achieved}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Units</Label>
          <p>{awareness.units}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Male Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-blue-600">
            {awareness.beneficiaryMale}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Female Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-pink-600">
            {awareness.beneficiaryFemale}
          </p>
        </div>
      </div>

      {awareness.remarks && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Remarks</Label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {awareness.remarks}
          </p>
        </div>
      )}
      {awareness.imageUrl && (
        <>
          <hr />
          <div>
            <Label>Image</Label>
            <div className="mt-2 border rounded-md overflow-hidden max-w-sm">
              <img
                src={awareness.imageUrl || "/placeholder.svg"}
                alt={awareness.imageUrl}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </>
      )}
      <hr />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
        <div>
          <Label className="flex items-center">
            Created At{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>
          <p className="tracking-wider mt-2">
            {new Date(awareness.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <Label className="flex items-center">
            Last Updated{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>
          <p className="tracking-wider mt-2">
            {new Date(awareness.updatedAt).toLocaleString()}
          </p>
        </div>
        {awareness.User && (
          <div>
            <Label>Created/Managed By</Label>
            <p className="tracking-wider mt-2">{awareness.User.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AwarenessForm({
  awareness,
  onSave,
  onClose,
  isEdit = false
}: AwarenessFormProps) {
  const [formData, setFormData] = useState<AwarenessFormData>({
    title: awareness?.title || "",
    projectId: awareness?.project.id || "",
    quarterId: awareness?.quarter.id || "",
    target: awareness?.target || 0,
    achieved: awareness?.achieved || 0,
    district: awareness?.district || "",
    village: awareness?.village || "",
    block: awareness?.block || "",
    beneficiaryMale: awareness?.beneficiaryMale || 0,
    beneficiaryFemale: awareness?.beneficiaryFemale || 0,
    units: awareness?.units || "",
    remarks: awareness?.remarks || "",
    // Initialize image fields from awareness prop if editing
    imageUrl: awareness?.imageUrl, // Use null for consistency
    imageKey: awareness?.imageKey, // Use null for consistency
    imageFile: null // This is for the NEW file selection
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const projects = useProjectStore((state) => state.projects);
  const [url, setUrl] = useState<SignedUrlResponse | null>(null); // For storing fetched signed URL

  // State for image preview and tracking removal
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageToBeRemovedKey, setImageToBeRemovedKey] = useState<string | null>(
    null
  ); // Stores key of image to delete on save
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  // Effect to set initial image preview if editing and image exists
  useEffect(() => {
    if (isEdit && awareness?.imageUrl) {
      setImagePreviewUrl(awareness.imageUrl);
      // Set initial formData imageUrl and imageKey from awareness prop
      setFormData((prev) => ({
        ...prev,
        imageUrl: awareness.imageUrl,
        imageKey: awareness.imageKey
      }));
    }
  }, [isEdit, awareness]);

  const uniqueProjectTitle = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return Array.from(new Set(projects.map((project) => project.title)));
  }, [projects]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handles new file selection
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0] || null;
    // Clear previous file input value to allow re-selecting the same file after removal
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!file) {
      toast.warning("File is missing", {
        description: "Please select a file to upload."
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      // 20MB
      setFormErrors((prev) => ({ ...prev, imageFile: "Max file size: 20MB" }));
      toast.error("File too large", {
        description: "Image size must be less than 20MB."
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({ ...prev, imageFile: "Invalid file type" }));
      toast.error("Invalid File Type", {
        description: "Please select a valid image file."
      });
      return;
    }

    // Generate local URL for preview
    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localPreviewUrl); // Update preview
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: null,
      imageKey: null
    })); // Set file, clear existing cloud URL/Key
    setImageToBeRemovedKey(null); // If a new file is chosen, we are not removing an *existing* one without replacement
    setFormErrors((prev) => ({ ...prev, imageFile: "" }));

    // Fetch signed URL for the new file
    try {
      const signedUrlData = await getSignedUrl({
        fileName: file.name,
        contentType: file.type
      });
      setUrl(signedUrlData);
      toast.success("Image selected", {
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB)`
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to get upload URL", {
        description: "Could not prepare image for upload. Please try again."
      });
      // Reset if fetching signed URL fails
      setImagePreviewUrl(
        isEdit && awareness?.imageUrl ? awareness.imageUrl : null
      );
      setFormData((prev) => ({ ...prev, imageFile: null }));
      setUrl(null);
    }
  };

  // Handles removal of current image (newly selected or existing)
  const handleRemoveImage = (): void => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imageUrl: null,
      imageKey: null
    }));
    setUrl(null);

    // If it was an existing image from `awareness` prop, mark its key for deletion on save
    if (isEdit && awareness?.imageKey) {
      setImageToBeRemovedKey(awareness.imageKey);
    } else {
      setImageToBeRemovedKey(null);
    }
    // Clear file input visually
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Image removed");
  };

  const validateForm = (): boolean => {
    try {
      // Prepare data for validation, including potentially null image fields
      const validationData: Partial<AwarenessFormData> & {
        target: number;
        achieved: number;
        beneficiaryMale: number;
        beneficiaryFemale: number;
      } = {
        title: formData.title,
        projectId: formData.projectId,
        quarterId: formData.quarterId,
        target: formData.target,
        achieved: formData.achieved,
        district: formData.district,
        village: formData.village,
        block: formData.block,
        beneficiaryMale: formData.beneficiaryMale || 0,
        beneficiaryFemale: formData.beneficiaryFemale || 0,
        units: formData.units,
        remarks: formData.remarks,
        // Pass current state of imageUrl and imageKey for validation
        imageUrl: formData.imageFile ? null : formData.imageUrl, // If new file, URL is not yet set from cloud
        imageKey: formData.imageFile ? null : formData.imageKey
      };

      if (isEdit) {
        updateAwarenessProgramValidation.parse(validationData);
      } else {
        // For create, if image is mandatory, add imageFile to validationData
        // if (!formData.imageFile && MANDATORY_IMAGE_ON_CREATE) {
        //   throw new z.ZodError([{ path: ["imageFile"], message: "Image is required", code: z.ZodIssueCode.custom }]);
        // }
        createAwarenessValidation.parse(validationData);
      }
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0]?.toString();
          if (path) newErrors[path] = err.message;
        });
        setFormErrors(newErrors);
        toast.error("Validation Failed", {
          description: "Please check the form for errors."
        });
      }
      return false;
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    let finalImageUrl: string | null = awareness?.imageUrl || null;
    let finalImageKey: string | null = awareness?.imageKey || null;

    try {
      // 1. Handle removal of an existing image
      if (imageToBeRemovedKey) {
        const deleted = await deleteFileFromCloudflare(imageToBeRemovedKey);
        if (deleted) {
          finalImageUrl = null;
          finalImageKey = null;
          toast.success("Previous image deleted from storage.");
        } else {
          toast.error("Failed to delete previous image", {
            description:
              "Could not remove the old image from storage. Please check manually."
          });
          // Decide if you want to stop submission or continue
          // setIsSubmitting(false); return;
        }
      }

      // 2. Handle upload of a new image
      if (formData.imageFile && url?.signedUrl) {
        if (
          isEdit &&
          awareness?.imageKey &&
          awareness.imageKey !== imageToBeRemovedKey
        ) {
          console.log("Image-key : ", awareness.imageKey);
          const oldKeyDeleted = await deleteFileFromCloudflare(
            awareness.imageKey
          );
          if (!oldKeyDeleted) {
            toast.warning("Old Image Deletion Issue", {
              description:
                "Could not delete the previously existing image from storage."
            });
          }
        }

        const uploadResult = await uploadFileToCloudflare(
          formData.imageFile,
          url.signedUrl
        );
        if (uploadResult.success && url.publicUrl && url.key) {
          finalImageUrl = url.publicUrl;
          finalImageKey = url.key;
        } else {
          toast.error("Image Upload Failed", {
            description: uploadResult.error || "Could not upload the new image."
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare data for onSave callback
      const dataToSave: AwarenessFormData = {
        ...formData,
        imageUrl: finalImageUrl,
        imageKey: finalImageKey
      };

      onSave(dataToSave); // This now passes the correct imageUrl and imageKey
    } catch {
      toast.error("Submission Error", {
        description: "An unexpected error occurred while saving."
      });
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label>
            Project <span className="text-red-500">*</span>
          </Label>
          <Select
            value={
              projects.find((p) => p.id === formData.projectId)?.title || ""
            }
            onValueChange={(value) => {
              const selectedProject = projects.find((p) => p.title === value);
              if (selectedProject)
                handleSelectChange("projectId", selectedProject.id);
            }}
          >
            <SelectTrigger
              className={formErrors.projectId ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {uniqueProjectTitle.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.projectId && (
            <p className="text-red-500 text-sm mt-1">{formErrors.projectId}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="title">
          Program Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter program title"
          value={formData.title}
          onChange={handleInputChange}
          maxLength={100}
          className={formErrors.title ? "border-red-500" : ""}
          required
        />
        {formErrors.title && (
          <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>
            Quarter <span className="text-red-500">*</span>
          </Label>
          <Select
            value={(() => {
              const quarterInfo = quarterlyData.find(
                (q) => q.id === formData.quarterId
              );
              return quarterInfo
                ? `Q${quarterInfo.number} ${quarterInfo.year}`
                : "";
            })()}
            onValueChange={(value) => {
              // Find the quarter ID based on the selected display value
              const selectedQuarter = quarterlyData.find(
                (q) => `Q${q.number} ${q.year}` === value
              );
              if (selectedQuarter) {
                handleSelectChange("quarterId", selectedQuarter.id);
              }
            }}
          >
            <SelectTrigger
              className={formErrors.quarterId ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent className="h-52">
              {quarterlyData.map((quarter) => (
                <SelectItem
                  key={quarter.id}
                  value={`Q${quarter.number} ${quarter.year}`}
                >
                  Q{quarter.number} {quarter.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.quarterId && (
            <p className="text-red-500 text-sm mt-1">{formErrors.quarterId}</p>
          )}
        </div>
        <div>
          <Label htmlFor="units">Units</Label>
          <Input
            id="units"
            name="units"
            placeholder="e.g., Participants"
            value={formData.units}
            onChange={handleInputChange}
            className={formErrors.units ? "border-red-500" : ""}
          />
          {formErrors.units && (
            <p className="text-red-500 text-sm mt-1">{formErrors.units}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="target">
            Target <span className="text-red-500">*</span>
          </Label>
          <Input
            id="target"
            name="target"
            type="number"
            placeholder="0"
            value={formData.target}
            onChange={handleInputChange}
            className={formErrors.target ? "border-red-500" : ""}
            min="0"
            required
          />
          {formErrors.target && (
            <p className="text-red-500 text-sm mt-1">{formErrors.target}</p>
          )}
        </div>
        <div>
          <Label htmlFor="achieved">
            Achieved <span className="text-red-500">*</span>
          </Label>
          <Input
            id="achieved"
            name="achieved"
            type="number"
            placeholder="0"
            value={formData.achieved}
            onChange={handleInputChange}
            className={formErrors.achieved ? "border-red-500" : ""}
            min="0"
            required
          />
          {formErrors.achieved && (
            <p className="text-red-500 text-sm mt-1">{formErrors.achieved}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="district">
            District <span className="text-red-500">*</span>
          </Label>
          <Input
            id="district"
            name="district"
            placeholder="District name"
            value={formData.district}
            onChange={handleInputChange}
            maxLength={100}
            className={formErrors.district ? "border-red-500" : ""}
            required
          />
          {formErrors.district && (
            <p className="text-red-500 text-sm mt-1">{formErrors.district}</p>
          )}
        </div>
        <div>
          <Label htmlFor="village">
            Village <span className="text-red-500">*</span>
          </Label>
          <Input
            id="village"
            name="village"
            placeholder="Village name"
            value={formData.village}
            onChange={handleInputChange}
            maxLength={100}
            className={formErrors.village ? "border-red-500" : ""}
            required
          />
          {formErrors.village && (
            <p className="text-red-500 text-sm mt-1">{formErrors.village}</p>
          )}
        </div>
        <div>
          <Label htmlFor="block">
            Block <span className="text-red-500">*</span>
          </Label>
          <Input
            id="block"
            name="block"
            placeholder="Block name"
            value={formData.block}
            onChange={handleInputChange}
            maxLength={100}
            className={formErrors.block ? "border-red-500" : ""}
            required
          />
          {formErrors.block && (
            <p className="text-red-500 text-sm mt-1">{formErrors.block}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="beneficiaryMale">
            Male Beneficiaries <span className="text-red-500">*</span>
          </Label>
          <Input
            id="beneficiaryMale"
            name="beneficiaryMale"
            type="number"
            placeholder="0"
            value={formData.beneficiaryMale}
            onChange={handleInputChange}
            className={formErrors.beneficiaryMale ? "border-red-500" : ""}
            min="0"
            required
          />
          {formErrors.beneficiaryMale && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.beneficiaryMale}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="beneficiaryFemale">
            Female Beneficiaries <span className="text-red-500">*</span>
          </Label>
          <Input
            id="beneficiaryFemale"
            name="beneficiaryFemale"
            type="number"
            placeholder="0"
            value={formData.beneficiaryFemale}
            onChange={handleInputChange}
            className={formErrors.beneficiaryFemale ? "border-red-500" : ""}
            min="0"
            required
          />
          {formErrors.beneficiaryFemale && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.beneficiaryFemale}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          name="remarks"
          placeholder="Additional remarks (max 300 chars)"
          value={formData.remarks}
          onChange={handleInputChange}
          maxLength={300}
          className={formErrors.remarks ? "border-red-500" : ""}
        />
        {formErrors.remarks && (
          <p className="text-red-500 text-sm mt-1">{formErrors.remarks}</p>
        )}
      </div>

      {/* --- Enhanced Image Upload Section --- */}
      <div>
        <Label htmlFor="imageFile">Program Image</Label>
        <div
          className={`mt-1 p-4 border-2 ${
            formErrors.imageFile ? "border-red-500" : "border-gray-300"
          } border-dashed rounded-md`}
        >
          {imagePreviewUrl ? (
            // Image Preview and Remove Button
            <div className="space-y-2">
              <div className="relative group w-full h-auto max-h-60 md:max-h-80 rounded-md overflow-hidden">
                <img
                  src={imagePreviewUrl || "/placeholder.svg"}
                  alt="Program preview"
                  className="w-full h-full object-contain" // object-contain to see full image
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-red-600/80 text-white"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {formData.imageFile && (
                <p className="text-xs text-green-600">
                  New image selected: {formData.imageFile.name} (
                  {(formData.imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" /> Change Image
              </Button>
            </div>
          ) : (
            // Upload Placeholder
            <div className="text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-600">
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-medium text-green-600 hover:text-green-500"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Click to upload an image
                </Button>
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 20MB</p>
            </div>
          )}
          {/* Hidden file input, triggered by button/placeholder click */}
          <Input
            id="imageFile"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden" // Visually hidden, functionality triggered by ref
          />
          {formErrors.imageFile && (
            <p className="text-red-500 text-sm mt-1">{formErrors.imageFile}</p>
          )}
        </div>
      </div>
      {/* --- End of Image Upload Section --- */}

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : isEdit
            ? "Update Program"
            : "Save Program"}
        </Button>
      </div>
    </form>
  );
}
