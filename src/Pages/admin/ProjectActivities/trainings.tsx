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
  GraduationCap,
  Plus,
  Search,
  // FileText,
  // ImageIcon,
  Eye,
  Edit,
  UserRound,
  Trash2,
  Loader2,
  UploadCloud,
  ImageIcon,
  FileText
} from "lucide-react";
import { useProjectStore } from "@/stores/useProjectStore";
import { Base_Url, quarterlyData, SignedUrlResponse } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import EnhancedShimmerTableRows from "@/components/shimmer-rows";
import { getSignedUrl } from "@/services/cloudflare/getSignedUrl";
import deleteFileFromCloudflare from "@/services/cloudflare/deleteFileFromCloudflare";
import uploadFileToCloudflare from "@/services/cloudflare/uploadFileToCloudFlare";
// Base validation schema
const baseTrainingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(255, { message: "Title cannot exceed 255 characters" }),
  projectId: z.string().trim().min(2, { message: "Project must be selected" }),
  quarterId: z.string().trim().min(2, { message: "Quarter must be selected" }),
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
    .refine((val) => val === "" || val.length >= 1, {
      message: "Units must be specified "
    })
    .transform((val) => (val === "" ? null : val))
    .optional()
    .nullable(),
  remarks: z
    .string()
    .trim()
    .max(300, { message: "Remarks cannot exceed 300 characters" })
    .optional(),
  imageUrl: z
    .string()
    .trim()
    .url({ message: "Invalid image URL format" })
    .optional()
    .nullable(),
  pdfUrl: z
    .string()
    .trim()
    .url({ message: "Invalid PDF URL format" })
    .optional()
    .nullable()
});

// Create training validation with refinements
const createTrainingValidation = baseTrainingSchema.refine(
  (data) => {
    return data.achieved <= data.target;
  },
  {
    message: "Achieved count cannot exceed target count",
    path: ["achieved"]
  }
);

// Update training validation - make all fields optional except refinements
const updateTrainingValidation = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, { message: "Title must be at least 2 characters" })
      .max(255, { message: "Title cannot exceed 255 characters" })
      .optional(),
    projectId: z
      .string()
      .trim()
      .min(2, { message: "Project must be selected" })
      .optional(),
    quarterId: z
      .string()
      .trim()
      .min(2, { message: "Quarter must be selected" })
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
    units: z
      .string()
      .refine((val) => val === "" || val.length >= 1, {
        message: "Units must be specified"
      })
      .transform((val) => (val === "" ? null : val))
      .optional()
      .nullable(),
    remarks: z
      .string()
      .trim()
      .max(300, { message: "Remarks cannot exceed 300 characters" })
      .optional(),
    imageUrl: z
      .string()
      .trim()
      .url({ message: "Invalid image URL format" })
      .optional()
      .nullable(),
    pdfUrl: z
      .string()
      .trim()
      .url({ message: "Invalid PDF URL format" })
      .optional()
      .nullable()
  })
  .refine(
    (data) => {
      // Skip refinement if we don't have both target and achieved
      if (data.target === undefined || data.achieved === undefined) {
        return true;
      }
      return data.achieved <= data.target;
    },
    {
      message: "Achieved count cannot exceed target count",
      path: ["achieved"]
    }
  );

interface RawTraining {
  id: string;
  trainingId: string;
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
  beneficiaryMale: number;
  beneficiaryFemale: number;
  units: string;
  remarks: string;
  imageUrl?: string | null;
  imageKey?: string | null;
  pdfUrl?: string | null;
  pdfKey?: string | null;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: string;
    name: string;
  };
}

// TypeScript interfaces
interface Training {
  id: string;
  trainingId: string;
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
  beneficiaryMale: number;
  beneficiaryFemale: number;
  units: string;
  remarks: string;
  imageUrl?: string | null;
  imageKey?: string | null;
  pdfKey?: string | null;
  pdfUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: string;
    name: string;
  };
}

interface TrainingFormData {
  title: string;
  projectId: string;
  quarterId: string;
  target: string;
  achieved: string;
  district: string;
  village: string;
  block: string;
  beneficiaryMale: string;
  beneficiaryFemale: string;
  units: string;
  remarks: string;
  imageUrl: string | null;
  imageKey: string | null;
  pdfKey: string | null;
  pdfUrl: string | null;
  imageFile?: File | null;
  pdfFile?: File | null;
}

interface TrainingFormProps {
  training?: Training;
  onSave: (data: TrainingFormData) => Promise<boolean>; // This line was changed
  onClose: () => void;
  isEdit?: boolean;
}

interface TrainingViewProps {
  training: Training;
}

interface FormErrors {
  [key: string]: string;
}

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
  data: Training;
  code: string;
}

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const projects = useProjectStore((state) => state.projects);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const userRole = useAuthStore((state) => state.user);

  //Fetch training Data
  const fetchTrainings = async () => {
    try {
      setIsLoading(true);

      const endpoint =
        userRole?.role === "admin" // Changed from userRole?.role
          ? "get-admin-trainings"
          : "get-user-trainings";
      const response = await axios.get(`${Base_Url}/${endpoint}`, {
        withCredentials: true
      });

      const data = response.data;
      if (response.data.code === "UNAUTHORIZED") {
        toast.success("UNAUTHORIZED", {
          description: `${response.data.message}`
        });
        logout();
      } else if (response.data.code === "RESOURCE_NOT_FOUND") {
        toast.info("No Training Found", {
          description: "No Training data available. Please add new data."
        });
        return;
      } else if (!data.success || response.status !== 200) {
        throw new Error(data.message || "Failed to fetch trainings");
      }
      // console.log("data : ", data.data);
      const mappedTrainings: Training[] = (data.data || []).map(
        (item: RawTraining) => ({
          id: item.id,
          trainingId: item.trainingId,
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
          pdfUrl: item.pdfUrl ?? undefined,
          pdfKey: item.pdfKey ?? undefined,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          User: item.User
            ? { id: item.User.id, name: item.User.name }
            : undefined
        })
      );
      setTrainings(mappedTrainings || []);
    } catch (error: unknown) {
      // console.error("Error fetching trainings:", error);
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
          description: "An unexpected error occurred while fetching trainings"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  // Filter trainings based on search and filter criteria
  const filteredTrainings: Training[] = trainings.filter(
    (training: Training) => {
      const matchesSearch: boolean =
        training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        training.trainingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        training.project.title.toLowerCase().includes(searchTerm.toLowerCase());

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
        matchesYearQuarter = matchingQuarterIds.includes(training.quarter.id);
      }

      const matchesProject: boolean =
        !selectedProject ||
        selectedProject === "all" ||
        training.project.title === selectedProject;

      const matchesDistrict: boolean =
        !selectedDistrict ||
        selectedDistrict === "all" ||
        training.district === selectedDistrict;

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
    if (!trainings || trainings.length === 0) return [];
    return Array.from(new Set(trainings.map((training) => training.district)));
  }, [trainings]);

  const handleView = (training: Training): void => {
    setSelectedTraining(training);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (training: Training): void => {
    setSelectedTraining(training);
    setIsEditDialogOpen(true);
  };
  const handleDelete = (training: Training): void => {
    setSelectedTraining(training);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (
    formData: TrainingFormData,
    operation: "create" | "update" = "create",
    trainingId?: string
  ): Promise<boolean> => {
    // Input validation

    console.log("DATA : ", formData);
    if (operation === "update" && !trainingId) {
      toast.error("Training ID is required for update operation");
      return false;
    }

    // Validate required fields
    if (!formData.title?.trim()) {
      toast.error("Training title is required");
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

    if (!formData.target || Number.parseInt(formData.target) <= 0) {
      toast.error("Valid target number is required");
      return false;
    }

    // Show loading toast
    const loadingToast = toast.loading(
      `${operation === "create" ? "Creating" : "Updating"} training...`
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
        target: Number.parseInt(formData.target),
        achieved: Number.parseInt(formData.achieved) || 0,
        district: formData.district,
        village: formData.village,
        block: formData.block,
        beneficiaryMale: Number.parseInt(formData.beneficiaryMale) || 0,
        beneficiaryFemale: Number.parseInt(formData.beneficiaryFemale) || 0,
        units: formData.units,
        remarks: formData.remarks,
        imageUrl: formData.imageUrl || null,
        imageKey: formData.imageKey || null,
        pdfUrl: formData.pdfUrl || null,
        pdfKey: formData.pdfKey || null
      };

      if (operation === "create") {
        response = await axios.post(
          `${Base_Url}/create-training`,
          requestData,
          config
        );
      } else {
        response = await axios.put(
          `${Base_Url}/update-training/${trainingId}`,
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

        console.log(`Training `, data.data);

        // Update local state
        if (operation === "create") {
          const newTraining: Training = {
            id: data.data.id,
            trainingId: data.data.trainingId,
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
            pdfUrl: data.data.pdfUrl,
            pdfKey: data.data.pdfKey,
            User:
              data.data.User?.id && data.data.User?.name
                ? {
                    id: data.data.User.id,
                    name: data.data.User.name
                  }
                : undefined,
            createdAt: data.data.createdAt,
            updatedAt: data.data.updatedAt
          };
          setTrainings((prev) => [newTraining, ...prev]);
        } else if (operation === "update" && trainingId) {
          setTrainings((prev) =>
            prev.map((t) =>
              t.id === trainingId
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
                    pdfUrl: data.data.pdfUrl,
                    pdfKey: data.data.pdfKey,
                    User:
                      data.data.User?.id && data.data.User?.name
                        ? {
                            id: data.data.User.id,
                            name: data.data.User.name
                          }
                        : undefined,
                    createdAt: data.data.createdAt,
                    updatedAt: data.data.updatedAt
                  }
                : t
            )
          );
        }

        // Close dialogs on success
        setIsDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedTraining(null);

        return true;
      } else {
        // Handle unexpected success status codes
        toast.error(`Unexpected response status: ${response?.status}`);
        return false;
      }
    } catch (error) {
      console.error(`Error ${operation}ing training:`, error);

      console.error(`Error ${operation}ing distribution:`, error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        let description = "An error occurred.";
        if (errorData) {
          description = errorData.message || description;
        } else if (axiosError.request) {
          description = "No response from server.";
        }
        toast.error(`Failed to ${operation}`, { description });
        if (axiosError.response?.status === 401 && logout) {
          logout();
          navigate("/signin");
        }
      } else {
        toast.error(`Failed to ${operation}`, {
          description: (error as Error).message || "An unexpected error."
        });
      }

      return false;
    } finally {
      // Always dismiss loading toast
      toast.dismiss(loadingToast);
    }
  };

  const handleDeleteTraining = async () => {
    if (!selectedTraining) {
      toast.error("No Training selected", {
        description: "Please select a training to delete"
      });
      return;
    }
    setIsDeleting(true);
    const loadingToast = toast.loading(
      `Deleting "${selectedTraining.title}"...`
    );

    try {
      const response = await axios.delete(
        `${Base_Url}/delete-training/${selectedTraining.id}`,
        {
          withCredentials: true,
          timeout: 30000
        }
      );

      if (response.status === 200 && response.data.success) {
        if (response.data.warning) {
          toast.warning("Training deleted with file issues", {
            description: `${selectedTraining.title} was removed from your account, but ${response.data.warning}`,
            duration: 6000
          });
        } else {
          toast.success("Training deleted successfully", {
            description: `${selectedTraining.title} and all associated files have been deleted`,
            duration: 5000
          });
        }
        setTrainings((prevTrainings) =>
          prevTrainings.filter(
            (training) => training.id !== selectedTraining.id
          )
        );
        setSelectedTraining(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Deletion failed", {
          description:
            response.data?.message || "Training deletion was not completed"
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
            title: "Training not found",
            fallback: "Training may already be deleted"
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <GraduationCap className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Training Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage training programs and track beneficiaries
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Training
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Training Program</DialogTitle>
                <DialogDescription>
                  Create a new training program entry with target and
                  achievement data
                </DialogDescription>
              </DialogHeader>
              <TrainingForm
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

        {/* Training List */}
        <Card>
          <CardHeader>
            <CardTitle>Training Programs</CardTitle>
            <CardDescription>
              List of all training programs with target vs achievement tracking
              {filteredTrainings.length !== trainings.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredTrainings.length} of {trainings.length} shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Training ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Achieved/Target</TableHead>
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
                ) : filteredTrainings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      No trainings found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrainings.map((training: Training) => (
                    <TableRow key={training.id}>
                      <TableCell className="font-medium">
                        {training.trainingId}
                      </TableCell>
                      <TableCell className="truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                        {training.title}
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                        {training.project.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {(() => {
                            const quarterInfo = quarterlyData.find(
                              (q) => q.id === training.quarter.id
                            );
                            return quarterInfo
                              ? `Q${quarterInfo.number} ${quarterInfo.year}`
                              : "Unknown Quarter";
                          })()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                        {training.district}, {training.village}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {training.achieved}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            /
                            <span className="text-gray-700">
                            {" "}  {training.target} {training.units}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      {userRole?.role === "admin" && (
                        <TableCell>{training.User?.name || "N/A"}</TableCell>
                      )}
                      <TableCell>
                        <div className="text-sm flex flex-col gap-y-1">
                          <Badge variant="outline">
                            <div className="w-16 flex gap-x-1">
                              <UserRound className="h-4 w-4 text-blue-500" />
                              M: {training.beneficiaryMale}
                            </div>
                          </Badge>
                          <Badge variant="outline">
                            <div className="w-16 flex gap-x-1">
                              <UserRound className="h-4 w-4 text-pink-500" />
                              F: {training.beneficiaryFemale}
                            </div>
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(training)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(training)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(training)}
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

        {/* View Training Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Training Details</DialogTitle>
              <DialogDescription>
                View complete training program information
              </DialogDescription>
            </DialogHeader>
            {selectedTraining && <TrainingView training={selectedTraining} />}
          </DialogContent>
        </Dialog>

        {/* Edit Training Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Training Program</DialogTitle>
              <DialogDescription>
                Update training program information
              </DialogDescription>
            </DialogHeader>
            {selectedTraining && (
              <TrainingForm
                training={selectedTraining}
                onSave={(formData) =>
                  handleSave(formData, "update", selectedTraining.id)
                }
                onClose={() => setIsEditDialogOpen(false)}
                isEdit={true}
              />
            )}
          </DialogContent>
        </Dialog>

        {/*Delete project Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-black">
                ⚠️ Confirm Training Deletion
              </DialogTitle>
              <DialogDescription>
                <br />
                <span className="block mt-2">
                  Are you sure you want to delete this training?
                </span>
                <span className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </span>
              </DialogDescription>
            </DialogHeader>

            {selectedTraining && (
              <div className="grid gap-2 py-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Title : </span>
                  {selectedTraining?.title}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Project :{" "}
                  </span>
                  {selectedTraining?.project.title}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    District :{" "}
                  </span>
                  {selectedTraining?.district}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Village :{" "}
                  </span>
                  {selectedTraining?.village}
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
                  handleDeleteTraining();
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

function TrainingView({ training }: TrainingViewProps) {
  const projects = useProjectStore((state) => state.projects);

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Training ID
          </Label>
          <p className="text-md font-semibold">{training.trainingId}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-500">
            Training Title
          </Label>
          <p className="text-md ">{training.title}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          {projects.find((p) => p.id === training.project.id)?.title ||
            "Unknown project"}
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <Badge variant="outline">
            Q
            {quarterlyData.find((q) => q.id === training.quarter.id)?.number ||
              "Unknown"}{" "}
            {quarterlyData.find((q) => q.id === training.quarter.id)?.year ||
              ""}
          </Badge>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">District</Label>
          <p>{training.district}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Village</Label>
          <p>{training.village}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Block</Label>
          <p>{training.block}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Target</Label>
          <p className="text-lg font-semibold text-gray-600">
            {training.target}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Achieved</Label>
          <p className="text-lg font-semibold text-green-600">
            {training.achieved}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Units</Label>
          <p>{training.units}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Male Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-blue-600">
            {training.beneficiaryMale}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Female Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-pink-600">
            {training.beneficiaryFemale}
          </p>
        </div>
      </div>
      <hr />
      {training.remarks && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Remarks</Label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {training.remarks}
          </p>
        </div>
      )}
      {/* Display attachments if available */}
      {training.imageUrl && (
        <>
          <hr />
          <div>
            <Label>Image</Label>
            <div className="mt-2 border rounded-md overflow-hidden max-w-sm">
              <img
                src={training.imageUrl || "/placeholder.svg"}
                alt={training.imageUrl}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </>
      )}
      {(training.imageUrl || training.pdfUrl) && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-500">
            Attachments
          </Label>
          <div className="flex gap-4">
            {training.pdfUrl && (
              <div className="flex items-center gap-2 ">
                <a
                  href={training.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-gray-100 text-blue-600 hover:bg-white text-sm border border-gray-300 px-3 py-1 rounded-sm"
                >
                  <FileText className="h-4 w-4 text-red-500" />
                  View PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
      <hr />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
        <div>
          <Label className="flex items-center">
            Created At{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>
          <p className="tracking-wider mt-2">
            {new Date(training.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <Label className="flex items-center">
            Last Updated{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>{" "}
          <p className="tracking-wider mt-2">
            {new Date(training.updatedAt).toLocaleString()}
          </p>
        </div>
        {training.User && (
          <div>
            <Label>Created/Managed By</Label>
            <p className="tracking-wider mt-2">{training.User.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TrainingForm({
  training,
  onSave,
  onClose,
  isEdit = false
}: TrainingFormProps) {
  const [formData, setFormData] = useState<TrainingFormData>({
    title: training?.title || "",
    projectId: training?.project.id || "",
    quarterId: training?.quarter.id || "",
    target: training?.target?.toString() || "",
    achieved: training?.achieved?.toString() || "",
    district: training?.district || "",
    village: training?.village || "",
    block: training?.block || "",
    beneficiaryMale: training?.beneficiaryMale?.toString() || "0",
    beneficiaryFemale: training?.beneficiaryFemale?.toString() || "0",
    units: training?.units || "",
    remarks: training?.remarks || "",
    imageUrl: training?.imageUrl || "",
    imageKey: training?.imageKey || "",
    pdfUrl: training?.pdfUrl || "",
    pdfKey: training?.pdfKey || "",
    imageFile: null,
    pdfFile: null
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<SignedUrlResponse | null>(null);
  const [pdfUrl, setPdfUrl] = useState<SignedUrlResponse | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pdfPreviewInfo, setPdfPreviewInfo] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [imageToBeRemovedKey, setImageToBeRemovedKey] = useState<string | null>(
    null
  );
  const [pdfToBeRemovedKey, setPdfToBeRemovedKey] = useState<string | null>(
    null
  );
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const projects = useProjectStore((state) => state.projects);

  useEffect(() => {
    if (isEdit && training?.imageUrl) {
      setImagePreviewUrl(training.imageUrl);
      setFormData((prev) => ({
        ...prev,
        imageUrl: training.imageUrl ?? null,
        imageKey: training.imageKey ?? null
      }));
    }
    if (isEdit && training?.pdfUrl) {
      // For existing PDFs, we'll show basic info
      setPdfPreviewInfo({
        name: training.pdfUrl || "Training.material.Pdf",
        size: 0 // We don't have size info for existing files
      });
      setFormData((prev) => ({
        ...prev,
        pdfUrl: training.pdfUrl ?? null,
        pdfKey: training.pdfKey ?? null
      }));
    }
  }, [isEdit, training]);

  const uniqueProjectTitle = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return Array.from(new Set(projects.map((project) => project.title)));
  }, [projects]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      console.log("ERRORS : ", formErrors);
    }
  };

  const handleSelectChange = (name: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!file) {
      toast.warning("File is missing", {
        description: "Please select a file to upload."
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        imageFile: "File size must be less than 5MB"
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,
        imageFile: "Please select a valid image file"
      }));
      return;
    }

    setIsProcessingFile(true);

    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localPreviewUrl);
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: "",
      imageKey: ""
    }));
    setImageToBeRemovedKey(null);
    setFormErrors((prev) => ({ ...prev, imageFile: "" }));

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
    } catch {
      toast.error("Failed to get upload URL", {
        description: "Could not prepare image for upload. Please try again."
      });
      URL.revokeObjectURL(localPreviewUrl);
      setImagePreviewUrl(
        isEdit && training?.imageUrl ? training.imageUrl : null
      );
      setFormData((prev) => ({ ...prev, imageFile: null }));
      setUrl(null);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handlePdfChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }

    if (!file) {
      toast.warning("File is missing", {
        description: "Please select a PDF file to upload."
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        pdfFile: "File size must be less than 20MB"
      }));
      return;
    }

    if (file.type !== "application/pdf") {
      setFormErrors((prev) => ({
        ...prev,
        pdfFile: "Please select a valid PDF file"
      }));
      return;
    }

    setIsProcessingPdf(true);

    setPdfPreviewInfo({
      name: file.name,
      size: file.size
    });
    setFormData((prev) => ({
      ...prev,
      pdfFile: file,
      pdfUrl: "",
      pdfKey: ""
    }));
    setPdfToBeRemovedKey(null);
    setFormErrors((prev) => ({ ...prev, pdfFile: "" }));

    try {
      const signedUrlData = await getSignedUrl({
        fileName: file.name,
        contentType: file.type
      });

      setPdfUrl(signedUrlData);
      toast.success("PDF selected", {
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB)`
      });
    } catch {
      toast.error("Failed to get upload URL", {
        description: "Could not prepare PDF for upload. Please try again."
      });
      setPdfPreviewInfo(null);
      setFormData((prev) => ({ ...prev, pdfFile: null }));
      setPdfUrl(null);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleRemoveImage = (): void => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imageUrl: "",
      imageKey: ""
    }));
    setUrl(null);

    if (isEdit && training?.imageKey) {
      setImageToBeRemovedKey(training.imageKey);
    } else {
      setImageToBeRemovedKey(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Image removed");
  };

  const handleRemovePdf = (): void => {
    setPdfPreviewInfo(null);
    setFormData((prev) => ({
      ...prev,
      pdfFile: null,
      pdfUrl: "",
      pdfKey: ""
    }));
    setPdfUrl(null);

    if (isEdit && training?.pdfKey) {
      setPdfToBeRemovedKey(training.pdfKey);
    } else {
      setPdfToBeRemovedKey(null);
    }

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
    toast.info("PDF removed");
  };

  const isSubmitDisabled = (): boolean => {
    if (isSubmitting === true) return true;
    if (isProcessingFile === true || isProcessingPdf === true) return true;
    if (formData.imageFile && (!url || !url.signedUrl)) return true;
    if (formData.pdfFile && (!pdfUrl || !pdfUrl.signedUrl)) return true;
    return false;
  };

  const validateForm = (): boolean => {
    try {
      const dataToValidate = {
        title: formData.title,
        projectId: formData.projectId,
        quarterId: formData.quarterId,
        target: Number.parseInt(formData.target) || 0,
        achieved: Number.parseInt(formData.achieved) || 0,
        district: formData.district,
        village: formData.village,
        block: formData.block,
        beneficiaryMale: Number.parseInt(formData.beneficiaryMale) || 0,
        beneficiaryFemale: Number.parseInt(formData.beneficiaryFemale) || 0,
        units: formData.units,
        remarks: formData.remarks,
        imageUrl: formData.imageUrl || undefined,
        imageKey: formData.imageKey || undefined,
        pdfUrl: formData.pdfUrl || undefined,
        pdfKey: formData.pdfKey || undefined
      };
      console.log("dv : ", dataToValidate);
      if (isEdit) {
        updateTrainingValidation.parse(dataToValidate);
      } else {
        createTrainingValidation.parse(dataToValidate);
      }
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    console.log("FE : ", formErrors);
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form before submitting."
      });
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl: string | null = training?.imageUrl || null;
    let finalImageKey: string | null = training?.imageKey || null;
    let finalPdfUrl: string | null = training?.pdfUrl || null;
    let finalPdfKey: string | null = training?.pdfKey || null;

    try {
      // Handle image removal
      if (imageToBeRemovedKey) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const deleted = await deleteFileFromCloudflare(imageToBeRemovedKey);
        if (deleted) {
          finalImageUrl = null;
          finalImageKey = null;
          toast.success("Previous image deleted from storage.");
        } else {
          toast.warning("Previous image deletion failed", {
            description:
              "The old image couldn't be removed from storage, but your changes will still be saved."
          });
        }
      }

      // Handle PDF removal
      if (pdfToBeRemovedKey) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const deleted = await deleteFileFromCloudflare(pdfToBeRemovedKey);
        if (deleted) {
          finalPdfUrl = null;
          finalPdfKey = null;
          toast.success("Previous PDF deleted from storage.");
        } else {
          toast.warning("Previous PDF deletion failed", {
            description:
              "The old PDF couldn't be removed from storage, but your changes will still be saved."
          });
        }
      }

      // Handle image upload
      if (formData.imageFile && url?.signedUrl) {
        if (
          isEdit &&
          training?.imageKey &&
          !imageToBeRemovedKey &&
          formData.imageFile
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const oldKeyDeleted = await deleteFileFromCloudflare(
            training.imageKey
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
          toast.success("Image uploaded successfully");
        } else {
          toast.error("Image Upload Failed", {
            description: uploadResult.error || "Could not upload the new image."
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Handle PDF upload
      if (formData.pdfFile && pdfUrl?.signedUrl) {
        if (
          isEdit &&
          training?.pdfKey &&
          !pdfToBeRemovedKey &&
          formData.pdfFile
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const oldKeyDeleted = await deleteFileFromCloudflare(training.pdfKey);
          if (!oldKeyDeleted) {
            toast.warning("Old PDF Deletion Issue", {
              description:
                "Could not delete the previously existing PDF from storage."
            });
          }
        }

        const uploadResult = await uploadFileToCloudflare(
          formData.pdfFile,
          pdfUrl.signedUrl
        );
        if (uploadResult.success && pdfUrl.publicUrl && pdfUrl.key) {
          finalPdfUrl = pdfUrl.publicUrl;
          finalPdfKey = pdfUrl.key;
          toast.success("PDF uploaded successfully");
        } else {
          toast.error("PDF Upload Failed", {
            description: uploadResult.error || "Could not upload the new PDF."
          });
          setIsSubmitting(false);
          return;
        }
      }

      const dataToSave: TrainingFormData = {
        ...formData,
        imageUrl: finalImageUrl || "",
        imageKey: finalImageKey || "",
        pdfUrl: finalPdfUrl || "",
        pdfKey: finalPdfKey || ""
      };

      const success = await onSave(dataToSave);
      if (!success) {
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Submission Error", {
        description: "An unexpected error occurred while saving."
      });
      setIsSubmitting(false);
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
            value={(() => {
              const projectInfo = projects.find(
                (p) => p.id === formData.projectId
              );
              return projectInfo ? projectInfo.title : "";
            })()}
            onValueChange={(value) => {
              // Find the project ID based on the selected title
              const selectedProject = projects.find((p) => p.title === value);

              if (selectedProject) {
                handleSelectChange("projectId", selectedProject.id);
              }
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
        <div>
          <Label htmlFor="title">
            Training Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter training title (max 255 characters)"
            value={formData.title}
            onChange={handleInputChange}
            maxLength={255}
            className={formErrors.title ? "border-red-500" : ""}
            required
          />
          {formErrors.title && (
            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
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
            placeholder="e.g., Participants, Sessions"
            value={formData.units}
            onChange={handleInputChange}
            className={formErrors.units ? "border-red-500" : ""}
          />
          {formErrors.units && (
            <p className="text-red-500 text-sm mt-1">{formErrors.units}</p>
          )}
        </div>
        <div>
          <Label htmlFor="target">
            Target <span className="text-red-500">*</span>
          </Label>
          <Input
            id="target"
            name="target"
            type="number"
            placeholder="Enter target number"
            value={formData.target}
            onChange={handleInputChange}
            className={formErrors.target ? "border-red-500" : ""}
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
            placeholder="Enter achieved number"
            value={formData.achieved}
            onChange={handleInputChange}
            className={formErrors.achieved ? "border-red-500" : ""}
            required
          />
          {formErrors.achieved && (
            <p className="text-red-500 text-sm mt-1">{formErrors.achieved}</p>
          )}
        </div>
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

      <div className="grid grid-cols-2 gap-4">
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
          placeholder="Additional remarks (max 300 characters)"
          value={formData.remarks}
          onChange={handleInputChange}
          maxLength={300}
          className={formErrors.remarks ? "border-red-500 mt-2" : "mt-2"}
        />
        {formErrors.remarks && (
          <p className="text-red-500 text-sm mt-1">{formErrors.remarks}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Label htmlFor="imageFile">Training Image</Label>
          <div
            className={`mt-3 p-4 border-2 ${
              formErrors.imageFile ? "border-red-500" : "border-gray-300"
            } border-dashed rounded-md`}
          >
            {imagePreviewUrl ? (
              <div className="space-y-2">
                <div className="relative group w-full h-auto max-h-60 md:max-h-80 rounded-md overflow-hidden">
                  {isImageLoading && (
                    <div className="absolute inset-0 z-10 shimmer-effect rounded-md">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-[pulse_2s_ease-in-out_infinite_alternate]"></div>
                    </div>
                  )}
                  <img
                    src={imagePreviewUrl || "/placeholder.svg"}
                    alt="Training preview"
                    onLoad={() => setIsImageLoading(false)}
                    onError={() => setIsImageLoading(false)}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                      isImageLoading ? "opacity-0" : "opacity-100"
                    }`}
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
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
            <Input
              id="imageFile"
              name="imageFile"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {formErrors.imageFile && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.imageFile}
              </p>
            )}
            {isProcessingFile && (
              <div className="text-sm text-green-600 mt-2 text-center">
                <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                Preparing image for upload...
              </div>
            )}
            {formData.imageFile && !url?.signedUrl && !isProcessingFile && (
              <div className="text-sm text-amber-600 mt-2 text-center">
                ⚠️ Image selected but not ready for upload. Please wait or try
                selecting again.
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="pdfFile">Training Materials (PDF)</Label>
          <div
            className={`mt-3 p-4 border-2 ${
              formErrors.pdfFile ? "border-red-500" : "border-gray-300"
            } border-dashed rounded-md`}
          >
            {pdfPreviewInfo ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-[10px] font-medium text-gray-900">
                        {pdfPreviewInfo.name}
                      </p>
                      {pdfPreviewInfo.size > 0 && (
                        <p className="text-xs text-gray-500">
                          {(pdfPreviewInfo.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemovePdf}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    aria-label="Remove PDF"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {formData.pdfFile && (
                  <p className="text-xs text-green-600">
                    New PDF selected: {formData.pdfFile.name} (
                    {(formData.pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => pdfInputRef.current?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" /> Change PDF
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-600">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-medium text-green-600 hover:text-green-500"
                    onClick={() => pdfInputRef.current?.click()}
                  >
                    Click to upload a PDF
                  </Button>
                </p>
                <p className="text-xs text-gray-500">PDF files up to 20MB</p>
              </div>
            )}
            <Input
              id="pdfFile"
              name="pdfFile"
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              onChange={handlePdfChange}
              className="hidden"
            />
            {formErrors.pdfFile && (
              <p className="text-red-500 text-sm mt-1">{formErrors.pdfFile}</p>
            )}
            {isProcessingPdf && (
              <div className="text-sm text-green-600 mt-2 text-center">
                <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                Preparing PDF for upload...
              </div>
            )}
            {formData.pdfFile && !pdfUrl?.signedUrl && !isProcessingPdf && (
              <div className="text-sm text-amber-600 mt-2 text-center">
                ⚠️ PDF selected but not ready for upload. Please wait or try
                selecting again.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitDisabled()}
          className={`${
            isSubmitDisabled() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className={`bg-green-600 hover:bg-green-700 ${
            isSubmitDisabled() ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitDisabled()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
              Saving...
            </>
          ) : isProcessingFile || isProcessingPdf ? (
            <>
              <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
              Processing...
            </>
          ) : isEdit ? (
            "Update Training"
          ) : (
            "Save Training"
          )}
        </Button>
      </div>
    </form>
  );
}
