"use client";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Sprout, Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useProjectStore } from "@/stores/useProjectStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { Base_Url, quarterlyData } from "@/lib/constants";
import axios, { type AxiosError } from "axios";
import EnhancedShimmerTableRows from "@/components/shimmer-rows";

// Validation schemas
const baseFLDSchema = z.object({
  projectId: z.string().trim().min(1, { message: "Project is required" }),
  quarterId: z.string().trim().min(1, { message: "Quarter is required" }),
  target: z
    .number({ invalid_type_error: "Target must be a number" })
    .int({ message: "Target must be an integer" })
    .positive({ message: "Target must be a positive number" }),
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

  units: z
    .string()
    .trim()
    .refine((val) => val === "" || val.length >= 1, {
      message: "Units must be specified if provided"
    })
    .transform((val) => (val === "" ? null : val))
    .optional()
    .nullable(),
  remarks: z
    .string()
    .trim()
    .max(300, { message: "Remarks cannot exceed 300 characters" })
    .optional()
});

const createFLDValidation = baseFLDSchema.refine(
  (data) => data.achieved <= data.target,
  {
    message: "Achieved count cannot exceed target count",
    path: ["achieved"]
  }
);

const updateFLDValidation = z
  .object({
    projectId: z
      .string()
      .uuid({ message: "Valid project ID is required" })
      .optional(),
    quarterId: z
      .string()
      .uuid({ message: "Valid quarter ID is required" })
      .optional(),
    remarks: z
      .string()
      .trim()
      .max(300, { message: "Remarks cannot exceed 300 characters" })
      .optional()
      .nullable(),
    district: z
      .string()
      .max(100, { message: "District must be 100 characters or less" })
      .optional(),
    village: z
      .string()
      .max(100, { message: "Village must be 100 characters or less" })
      .optional(),
    block: z
      .string()
      .max(100, { message: "Block must be 100 characters or less" })
      .optional(),
    target: z
      .number()
      .int()
      .positive({ message: "Target must be a positive integer" })
      .optional(),
    achieved: z
      .number()
      .int()
      .nonnegative({ message: "Achieved must be a non-negative integer" })
      .optional(),
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
  );

interface FLDFormData {
  projectId: string;
  quarterId: string;
  target: string;
  achieved: string;
  district: string;
  village: string;
  block: string;
  units: string;
  remarks: string;
}

type FormErrors = {
  [key: string]: string;
};

interface FLD {
  id: string;
  fldId: string;
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
  units: string;
  remarks: string;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: string;
    name: string;
  };
}

interface FLDViewProps {
  fld: FLD;
}

interface FLDFormProps {
  fld?: FLD;
  onSave: (data: FLDFormData) => void;
  onClose: () => void;
  isEdit?: boolean;
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
  data: FLD;
  code: string;
}

export default function FLDPage() {
  const [flds, setFlds] = useState<FLD[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedFLD, setSelectedFLD] = useState<FLD | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const projects = useProjectStore((state) => state.projects);
  const logOut = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const userRole = useAuthStore((state) => state.user);

  //Fetch training Data
  const fetchFlds = async () => {
    try {
      setIsLoading(true);

      const endpoint =
        userRole?.role === "admin" // Changed from userRole?.role
          ? "get-admin-fld"
          : "get-user-fld";
      const response = await axios.get(`${Base_Url}/${endpoint}`, {
        withCredentials: true
      });

      const data = response.data;

      if (!data.success || response.status !== 200) {
        throw new Error(data.message || "Failed to fetch Fld's");
      }
      // console.log("data : ", data.data);
      const mappedFld: FLD[] = (data.data || []).map((item: FLD) => ({
        id: item.id,
        fldId: item.fldId,
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
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        units: item.units,
        remarks: item.remarks,

        User: item.User ? { id: item.User.id, name: item.User.name } : undefined
      }));
      console.log("MP : ", mappedFld);
      setFlds(mappedFld || []);
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
          description: "An unexpected error occurred while fetching Fld's"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  // Filter FLDs based on search and filter criteria
  const filteredFLDs: FLD[] = flds.filter((training: FLD) => {
    const matchesSearch: boolean = training.project.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Get quarter IDs based on year and quarter selection
    let matchesYearQuarter = true;

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
            q.year === Number.parseInt(selectedYear);
          const quarterMatch =
            !selectedQuarter ||
            selectedQuarter === "all" ||
            q.number === Number.parseInt(selectedQuarter);
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
  });

  console.log("FL : ", filteredFLDs);
  const uniqueProjectTitle = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return Array.from(new Set(projects.map((project) => project.title)));
  }, [projects]);

  const uniqueDistrict = useMemo(() => {
    if (!flds || flds.length === 0) return [];
    return Array.from(new Set(flds.map((fld) => fld.district)));
  }, [flds]);

  const handleView = (fld: FLD): void => {
    setSelectedFLD(fld);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (fld: FLD): void => {
    setSelectedFLD(fld);
    setIsEditDialogOpen(true);
  };
  const handleDelete = (training: FLD): void => {
    setSelectedFLD(training);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFLD = async () => {
    if (!selectedFLD) {
      toast.error("No FLD selected", {
        description: "Please select a FLD to delete"
      });
      return;
    }

    const loadingToast = toast.loading(`Deleting FLD...`);

    try {
      const response = await axios.delete(
        `${Base_Url}/delete-fld/${selectedFLD.id}`,
        {
          withCredentials: true,
          timeout: 30000
        }
      );

      if (response.status === 200 && response.data.success) {
        toast.success("FLD deleted", {
          description: "FLD deleted successfully",
          duration: 5000
        });
        setFlds((prevTrainings) =>
          prevTrainings.filter((fld) => fld.id !== selectedFLD.id)
        );
        setSelectedFLD(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Deletion failed", {
          description:
            response.data?.message || "FLD deletion was not completed"
        });
      }
    } catch (error: unknown) {
      console.error("Delete FLD error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        const errorMap: Record<number, { title: string; fallback: string }> = {
          400: {
            title: "Invalid request",
            fallback: "The FLD ID is invalid"
          },
          401: { title: "Authentication required", fallback: "Please sign in" },
          403: { title: "Access denied", fallback: "Permission denied" },
          404: {
            title: "FLD not found",
            fallback: "FLD may already be deleted"
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
      toast.dismiss(loadingToast);
    }
  };

  const handleSave = async (
    formData: FLDFormData,
    operation: "create" | "update" = "create",
    fldId?: string
  ): Promise<boolean> => {
    // Input validation

    console.log("DATA : ", formData);
    if (operation === "update" && !fldId) {
      toast.error("Training ID is required for update operation");
      return false;
    }

    // Validate required fields

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
        target: Number.parseInt(formData.target),
        achieved: Number.parseInt(formData.achieved) || 0,
        district: formData.district,
        village: formData.village,
        block: formData.block,
        units: formData.units,
        remarks: formData.remarks
      };

      if (operation === "create") {
        response = await axios.post(
          `${Base_Url}/create-fld`,
          requestData,
          config
        );
      } else {
        response = await axios.put(
          `${Base_Url}/update-fld/${fldId}`,
          requestData,
          config
        );
      }

      // Handle successful response
      if (response?.status === 201 || response?.status === 200) {
        const data = response.data as ApiSuccessResponse;

        // Refresh trainings list
        toast.success(data.message || `FLD ${operation}d successfully`, {
          description: `FLD ${operation}d successfully`,
          duration: 6000
        });

        // Update local state
        if (operation === "create") {
          const newTraining: FLD = {
            id: data.data.id,
            fldId: data.data.fldId,
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
            createdAt: data.data.createdAt,
            updatedAt: data.data.updatedAt,
            units: data.data.units,
            remarks: data.data.remarks,
            User:
              data.data.User?.id && data.data.User?.name
                ? {
                    id: data.data.User.id,
                    name: data.data.User.name
                  }
                : undefined
          };
          setFlds((prev) => [newTraining, ...prev]);
        } else if (operation === "update" && fldId) {
          setFlds((prev) =>
            prev.map((t) =>
              t.id === fldId
                ? {
                    ...t,
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
                    createdAt: data.data.createdAt,
                    updatedAt: data.data.updatedAt,
                    units: data.data.units,
                    remarks: data.data.remarks,
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
        setSelectedFLD(null);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Sprout className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Field Level Demonstrations
              </h1>
              <p className="text-sm text-gray-600">
                Manage FLD programs and track demonstrations
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New FLD
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New FLD Program</DialogTitle>
                <DialogDescription>
                  Create a new field level demonstration entry with target and
                  achievement data
                </DialogDescription>
              </DialogHeader>
              <FLDForm
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
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
        {/* FLD List */}
        <Card>
          <CardHeader>
            <CardTitle>Field Level Demonstrations</CardTitle>
            <CardDescription>
              List of all FLD programs with target vs achievement tracking
              {filteredFLDs.length !== flds.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredFLDs.length} of {flds.length} shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>FLD ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Target/Achieved</TableHead>
                  {userRole?.role === "admin" && (
                    <TableHead>Created By</TableHead>
                  )}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <EnhancedShimmerTableRows />
                ) : filteredFLDs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-8 text-gray-500"
                    >
                      No FLD programs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFLDs.map((fld) => (
                    <TableRow key={fld.id}>
                      <TableCell className="font-medium">{fld.fldId}</TableCell>

                      <TableCell className="text-sm">
                        {fld.project.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {(() => {
                            const quarterInfo = quarterlyData.find(
                              (q) => q.id === fld.quarter.id
                            );
                            return quarterInfo
                              ? `Q${quarterInfo.number} ${quarterInfo.year}`
                              : "Unknown Quarter";
                          })()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                        {fld.district}, {fld.village}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {fld.achieved}
                          </span>
                          <span className="text-gray-400"> / {fld.target}</span>
                        </div>
                      </TableCell>
                      {userRole?.role === "admin" && (
                        <TableCell>{fld.User?.name || "N/A"}</TableCell>
                      )}

                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(fld)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(fld)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(fld)}
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
              <DialogTitle>FLD Details</DialogTitle>
              <DialogDescription>
                View complete field level demonstration information
              </DialogDescription>
            </DialogHeader>
            {selectedFLD && <FLDView fld={selectedFLD} />}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit FLD Program</DialogTitle>
              <DialogDescription>
                Update field level demonstration information
              </DialogDescription>
            </DialogHeader>
            {selectedFLD && (
              <FLDForm
                fld={selectedFLD}
                onSave={(formData) =>
                  handleSave(formData, "update", selectedFLD.id)
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
                ⚠️ Confirm FLD Deletion
              </DialogTitle>
              <DialogDescription>
                <br />
                <span className="block mt-2">
                  Are you sure you want to delete this FLD?
                </span>
                <span className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </span>
              </DialogDescription>
            </DialogHeader>

            {selectedFLD && (
              <div className="grid gap-2 py-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">
                    Project :{" "}
                  </span>
                  {selectedFLD?.project.title}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    District :{" "}
                  </span>
                  {selectedFLD?.district}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Village :{" "}
                  </span>
                  {selectedFLD?.village}
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
                  handleDeleteFLD();
                }}
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function FLDView({ fld }: FLDViewProps) {
  const projects = useProjectStore((state) => state.projects);

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">FLD ID</Label>
          <p className="text-md font-semibold">{fld.fldId}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          <p>
            {" "}
            {projects.find((p) => p.id === fld.project.id)?.title ||
              "Unknown FLD"}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <Badge variant="outline">
            Q
            {quarterlyData.find((q) => q.id === fld.quarter.id)?.number ||
              "Unknown"}{" "}
            {quarterlyData.find((q) => q.id === fld.quarter.id)?.year || ""}
          </Badge>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">District</Label>
          <p>{fld.district}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Village</Label>
          <p>{fld.village}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Block</Label>
          <p>{fld.block}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Target</Label>
          <p className="text-lg font-semibold text-gray-600">{fld.target}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Achieved</Label>
          <p className="text-lg font-semibold text-green-600">{fld.achieved}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Units</Label>
          <p>{fld.units}</p>
        </div>
      </div>
      <hr />
      {fld.remarks && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Remarks</Label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {fld.remarks}
          </p>
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
            {new Date(fld.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <Label className="flex items-center">
            Last Updated{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>
          <p className="tracking-wider mt-2">
            {new Date(fld.updatedAt).toLocaleString()}
          </p>
        </div>
        {fld.User && (
          <div>
            <Label>Created/Managed By</Label>
            <p className="tracking-wider mt-2">{fld.User.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FLDForm({ fld, onSave, onClose, isEdit = false }: FLDFormProps) {
  const [formData, setFormData] = useState<FLDFormData>({
    projectId: fld?.project.id || "",
    quarterId: fld?.quarter.id || "",
    target: fld?.target?.toString() || "",
    achieved: fld?.achieved?.toString() || "",
    district: fld?.district || "",
    village: fld?.village || "",
    block: fld?.block || "",
    units: fld?.units || "",
    remarks: fld?.remarks || ""
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

  const validateForm = (): boolean => {
    try {
      const validationData = {
        projectId: formData.projectId,
        quarterId: formData.quarterId,
        target: Number.parseInt(formData.target) || 0,
        achieved: Number.parseInt(formData.achieved) || 0,
        district: formData.district,
        village: formData.village,
        block: formData.block,
        units: formData.units,
        remarks: formData.remarks
      };

      if (isEdit) {
        updateFLDValidation.parse(validationData);
      } else {
        createFLDValidation.parse(validationData);
      }

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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    // console.log("FORMDATA : ", formData);
    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form before submitting."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      onSave(formData);
    } catch {
      toast.error("Error", {
        description: "Failed to save FLD program. Please try again."
      });
    } finally {
      const timer = setTimeout(() => {
        setIsSubmitting(false);
      }, 30000); // 30000 milliseconds = 30 seconds

      // Optional: cleanup in case the component unmounts before 15s
      clearTimeout(timer);
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
            min="1"
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
            min="0"
            required
          />
          {formErrors.achieved && (
            <p className="text-red-500 text-sm mt-1">{formErrors.achieved}</p>
          )}
        </div>
        <div>
          <Label htmlFor="units">Units</Label>
          <Input
            id="units"
            name="units"
            placeholder="e.g., Plots, Demonstrations"
            value={formData.units}
            onChange={handleInputChange}
            className={formErrors.units ? "border-red-500" : ""}
          />
          {formErrors.units && (
            <p className="text-red-500 text-sm mt-1">{formErrors.units}</p>
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
          {isSubmitting ? "Saving..." : isEdit ? "Update FLD" : "Save FLD"}
        </Button>
      </div>
    </form>
  );
}
