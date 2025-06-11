import type React from "react";
import { useEffect, useMemo, useState } from "react";
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
  Upload
} from "lucide-react";
import { useProjectStore } from "@/stores/useProjectStore";
import { Base_Url, quarterlyData } from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
// Base validation schema
const baseTrainingSchema = z.object({
  trainingId: z
    .string()
    .trim()
    .min(2, { message: "Training ID must be at least 2 characters" })
    .max(50, { message: "Training ID cannot exceed 50 characters" }),
  title: z
    .string()
    .trim()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(255, { message: "Title cannot exceed 255 characters" }),
  project: z.string().trim().min(2, { message: "Project must be selected" }),
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
  units: z.string().trim().min(1, { message: "Units must be specified" }),
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
    trainingId: z
      .string()
      .trim()
      .min(2, { message: "Training ID must be at least 2 characters" })
      .max(50, { message: "Training ID cannot exceed 50 characters" })
      .optional(),
    title: z
      .string()
      .trim()
      .min(2, { message: "Title must be at least 2 characters" })
      .max(255, { message: "Title cannot exceed 255 characters" })
      .optional(),
    project: z
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
      .trim()
      .min(1, { message: "Units must be specified" })
      .optional(),
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
  pdfKey?: string | null;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: string;
    name: string;
  };
}

interface TrainingFormData {
  trainingId: string;
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
  imageFile?: File | null;
  pdfFile?: File | null;
}

interface TrainingFormProps {
  training?: Training;
  onSave: (data: TrainingFormData) => void;
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
  data: {
    id: string;
    title: string;
    status: string;
  };
  code: string;
}

//Get project data
//Get training data
// submit new created data
// submit updated data
export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const projects = useProjectStore((state) => state.projects);
  const logOut = useAuthStore((state) => state.logout);
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

      if (!data.success || response.status !== 200) {
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
          pdfUrl: item.pdfKey ?? undefined,
          user: item.User
            ? { id: item.User.id, name: item.User.name }
            : undefined
        })
      );
      setTrainings(mappedTrainings || []);
    } catch (error: unknown) {
      // console.error("Error fetching trainings:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        toast.error("Failed", {
          description:
            message ||
            `Axios error occurred${status ? ` (Status: ${status})` : ""}`
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

  const handleSave = async (
    formData: TrainingFormData,
    operation: "create" | "update" = "create",
    trainingId?: string
  ): Promise<boolean> => {
    // Input validation
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
        remarks: formData.remarks
        // Add these later on...
        // imageUrl: formData.imageUrl || null,
        // imageKey: formData.imageKey || null,
        // pdfUrl: formData.pdfUrl || null,
        // pdfKey: formData.pdfKey || null
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

        toast.success(data.message || `Training ${operation}d successfully`, {
          description: `${data.data.title} `,
          duration: 6000
        });

        console.log(`Training ${operation}d successfully:`, data.data);

        // Update local state
        // if (operation === "create") {
        //   const newTraining: Training = {
        //     id: data.data.id,
        //     trainingId: "",
        //     title: formData.title,
        //     project: {
        //       id: formData.projectId.id, // assuming this is coming from the form
        //       title: formData.project.title // you must get this from `projects` store or from form
        //     },
        //     quarter: {
        //       id: formData.quarter.id,
        //       number: Number(formData.quarter.number),
        //       year: Number(formData.quarter.year)
        //     },
        //     target: Number.parseInt(formData.target),
        //     achieved: Number.parseInt(formData.achieved) || 0,
        //     district: formData.district,
        //     village: formData.village,
        //     block: formData.block,
        //     beneficiaryMale: Number.parseInt(formData.beneficiaryMale) || 0,
        //     beneficiaryFemale: Number.parseInt(formData.beneficiaryFemale) || 0,
        //     units: formData.units,
        //     remarks: formData.remarks,
        //     createdAt: "",
        //     updatedAt: ""
        //   };
        //   setTrainings((prev) => [newTraining, ...prev]);
        // } else if (operation === "update" && trainingId) {
        //   setTrainings((prev) =>
        //     prev.map((t) =>
        //       t.id === trainingId
        //         ? {
        //             ...t,
        //             title: formData.title,
        //             project: formData.project,
        //             quarterId: formData.quarterId,
        //             target: Number.parseInt(formData.target),
        //             achieved: Number.parseInt(formData.achieved) || 0,
        //             district: formData.district,
        //             village: formData.village,
        //             block: formData.block,
        //             beneficiaryMale:
        //               Number.parseInt(formData.beneficiaryMale) || 0,
        //             beneficiaryFemale:
        //               Number.parseInt(formData.beneficiaryFemale) || 0,
        //             units: formData.units,
        //             remarks: formData.remarks
        //           }
        //         : t
        //     )
        //   );
        // }

        // Close dialogs on success
        setIsDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedTraining(null);

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
                  description: "Please check your input and try again",
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
                onSave={handleSave}
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
                <SelectContent className="h-52">
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                  <SelectItem value="2028">2028</SelectItem>
                  <SelectItem value="2029">2029</SelectItem>
                  <SelectItem value="2030">2030</SelectItem>
                  <SelectItem value="2031">2031</SelectItem>
                  <SelectItem value="2032">2032</SelectItem>
                  <SelectItem value="2033">2033</SelectItem>
                  <SelectItem value="2034">2034</SelectItem>
                  <SelectItem value="2035">2035</SelectItem>
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
                  <TableHead>Target/Achieved</TableHead>
                  <TableHead>Beneficiaries</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="text-gray-500">Loading Trainings...</p>
                      </div>
                    </TableCell>
                  </TableRow>
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
                      <TableCell>{training.title}</TableCell>
                      <TableCell className="text-sm">
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
                      <TableCell className="text-sm">
                        {training.district}, {training.village}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {training.achieved}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            / {training.target}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>M: {training.beneficiaryMale}</div>
                          <div>F: {training.beneficiaryFemale}</div>
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
                onSave={handleSave}
                onClose={() => setIsEditDialogOpen(false)}
                isEdit={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function TrainingView({ training }: TrainingViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Training ID
          </Label>
          <p className="text-lg font-semibold">{training.trainingId}</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500">
          Training Title
        </Label>
        <p className="text-lg">{training.title}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          <p>{training.project.id}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <p>{training.quarter.id}</p>
        </div>
      </div>

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

      {training.remarks && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Remarks</Label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {training.remarks}
          </p>
        </div>
      )}

      {/* Display attachments if available */}
      {/* {(training.imageUrl || training.pdfUrl) && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-500">
            Attachments
          </Label>
          <div className="flex gap-4">
            {training.imageUrl && (
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-500" />
                <a
                  href={training.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Image
                </a>
              </div>
            )}
            {training.pdfUrl && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500" />
                <a
                  href={training.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )} */}
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
    trainingId: training?.trainingId || "",
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
    imageFile: null,
    pdfFile: null
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const projects = useProjectStore((state) => state.projects);

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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "image" | "pdf"
  ): void => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        [`${fileType}File`]: "File size must be less than 20MB"
      }));
      return;
    }

    // Validate file type
    if (fileType === "image" && !file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,
        imageFile: "Please select a valid image file"
      }));
      return;
    }

    if (fileType === "pdf" && file.type !== "application/pdf") {
      setFormErrors((prev) => ({
        ...prev,
        pdfFile: "Please select a valid PDF file"
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [`${fileType}File`]: file }));

    // Clear error for this field
    if (formErrors[`${fileType}File`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${fileType}File`];
        return newErrors;
      });
    }

    toast.success(`${fileType === "image" ? "Image" : "PDF"} selected`, {
      description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
    });
  };

  const validateForm = (): boolean => {
    try {
      const dataToValidate = {
        trainingId: formData.trainingId,
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
        imageUrl: formData.imageFile
          ? "https://example.com/image.jpg"
          : undefined,
        pdfUrl: formData.pdfFile
          ? "https://example.com/document.pdf"
          : undefined
      };

      if (isEdit) {
        updateTrainingValidation.parse(dataToValidate);
      } else {
        createTrainingValidation.parse(dataToValidate);
      }

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

    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form before submitting."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate file upload delay
      if (formData.imageFile || formData.pdfFile) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      onSave(formData);
    } catch {
      toast.error("Error", {
        description: "Failed to save training. Please try again."
      });
    } finally {
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
                handleSelectChange("project", selectedProject.id);
              }
            }}
          >
            <SelectTrigger
              className={formErrors.project ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select project" />
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
          {formErrors.project && (
            <p className="text-red-500 text-sm mt-1">{formErrors.project}</p>
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
              className={formErrors.quarter ? "border-red-500" : ""}
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
          {formErrors.quarter && (
            <p className="text-red-500 text-sm mt-1">{formErrors.quarter}</p>
          )}
        </div>
        <div>
          <Label htmlFor="units">
            Units <span className="text-red-500">*</span>
          </Label>
          <Input
            id="units"
            name="units"
            placeholder="e.g., Participants, Sessions"
            value={formData.units}
            onChange={handleInputChange}
            className={formErrors.units ? "border-red-500" : ""}
            required
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

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="imageFile">Training Image</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "image")}
                className={`cursor-pointer ${
                  formErrors.imageFile ? "border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
            {formErrors.imageFile ? (
              <p className="text-red-500 text-sm">{formErrors.imageFile}</p>
            ) : (
              <p className="text-sm text-gray-500">Max file size: 20MB</p>
            )}
            {formData.imageFile && (
              <p className="text-sm text-green-600">
                Selected: {formData.imageFile.name} (
                {(formData.imageFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="pdfFile">Training Materials (PDF)</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                id="pdfFile"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, "pdf")}
                className={`cursor-pointer ${
                  formErrors.pdfFile ? "border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
            {formErrors.pdfFile ? (
              <p className="text-red-500 text-sm">{formErrors.pdfFile}</p>
            ) : (
              <p className="text-sm text-gray-500">Max file size: 20MB</p>
            )}
            {formData.pdfFile && (
              <p className="text-sm text-green-600">
                Selected: {formData.pdfFile.name} (
                {(formData.pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>
        </div>
      </div>

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
            ? "Update Training"
            : "Save Training"}
        </Button>
      </div>
    </form>
  );
}
