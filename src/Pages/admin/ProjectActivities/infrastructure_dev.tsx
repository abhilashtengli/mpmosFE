"use client";

import type React from "react";
import { useEffect, useMemo, useState, useRef } from "react";
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
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  ImageIcon,
  UploadCloud,
  Loader2,
  PlusCircle,
  X
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProjectStore } from "@/stores/useProjectStore";
import {
  Base_Url,
  quarterlyData,
  type SignedUrlResponse
} from "@/lib/constants";
import { useAuthStore } from "@/stores/useAuthStore";
import axios, { type AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import EnhancedShimmerTableRows from "@/components/shimmer-rows";
import { getSignedUrl } from "@/services/cloudflare/getSignedUrl";
import deleteFileFromCloudflare from "@/services/cloudflare/deleteFileFromCloudflare";
import uploadFileToCloudflare from "@/services/cloudflare/uploadFileToCloudFlare";
import iimr from "@/assets/IIMR_logo.jpg";
import aicrp from "@/assets/AICRP_logo.png";
import cpgs from "@/assets/CPGS_logo.jpg";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
// Updated validation schemas with new fields
const createInfrastructureValidation = z
  .object({
    projectId: z.string().uuid({ message: "Valid project ID is required" }),
    quarterId: z.string().uuid({ message: "Valid quarter ID is required" }),
    title: z
      .string()
      .trim()
      .min(2, { message: "Title must be at least 2 characters" })
      .max(100, { message: "Title cannot exceed 100 characters" }),
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
    targetSentence: z
      .array(z.string().trim())
      .max(20, { message: "Cannot have more than 20 target points" })
      .default([])
      .optional(),
    achievedSentence: z
      .array(z.string().trim())
      .max(20, { message: "Cannot have more than 20 achievements" })
      .default([])
      .optional(),
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
    remarks: z
      .string()
      .trim()
      .max(300, { message: "Remarks cannot exceed 300 characters" })
      .optional()
      .nullable(),
    imageUrl: z
      .string()
      .url({ message: "Invalid image URL format" })
      .optional()
      .nullable(),
    imageKey: z.string().trim().optional().nullable()
  })
  .refine(
    (data) => {
      const bothPresent =
        data.target !== undefined && data.achieved !== undefined;
      const bothAbsent =
        data.target === undefined && data.achieved === undefined;
      return bothPresent || bothAbsent;
    },
    {
      message: "Either both target and achieved must be provided, or neither",
      path: ["target"]
    }
  )
  .refine(
    (data) => {
      if (data.target != null && data.achieved != null) {
        return data.achieved <= data.target;
      }
      return true;
    },
    {
      message: "Achieved count cannot exceed target count",
      path: ["achieved"]
    }
  )
  .refine(
    (data) => {
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

const updateInfrastructureValidation = z
  .object({
    projectId: z
      .string()
      .uuid({ message: "Valid project ID is required" })
      .optional(),
    quarterId: z
      .string()
      .uuid({ message: "Valid quarter ID is required" })
      .optional(),
    title: z
      .string()
      .trim()
      .min(2, { message: "Title must be at least 2 characters" })
      .max(100, { message: "Title cannot exceed 100 characters" })
      .optional(),
    target: z
      .union([z.number().int().nonnegative(), z.null()])
      .optional()
      .transform((val) => {
        // If explicitly set to null or undefined, return null to clear the field
        if (val === null || val === undefined) return null;
        return val;
      }),
    achieved: z
      .union([z.number().int().nonnegative(), z.null()])
      .optional()
      .transform((val) => {
        // If explicitly set to null or undefined, return null to clear the field
        if (val === null || val === undefined) return null;
        return val;
      }),
    targetSentence: z
      .array(z.string().trim())
      .max(20, { message: "Cannot have more than 20 target points" })
      .default([])
      .optional(),
    achievedSentence: z
      .array(z.string().trim())
      .max(20, { message: "Cannot have more than 20 achievements" })
      .default([])
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
    remarks: z
      .string()
      .trim()
      .max(300, { message: "Remarks cannot exceed 300 characters" })
      .optional()
      .nullable(),
    imageUrl: z
      .string()
      .url({ message: "Invalid image URL format" })
      .optional()
      .nullable(),
    imageKey: z.string().optional().nullable()
  })
  .refine(
    (data) => {
      if (data.target != null && data.achieved != null) {
        return data.achieved <= data.target;
      }
      return true;
    },
    {
      message: "Achieved count cannot exceed target count",
      path: ["achieved"]
    }
  )
  .refine(
    (data) => {
      if (data.imageUrl === undefined) return true;
      if (data.imageUrl === null) return true;
      if (data.imageUrl && !data.imageKey) return false;
      return true;
    },
    {
      message: "Image key is required when image URL is provided",
      path: ["imageKey"]
    }
  );

// Updated interfaces
interface RawInfrastructure {
  id: string;
  InfraDevId: string;
  project: { id: string; title: string };
  quarter: { id: string; number: number; year: number };
  target?: number;
  achieved?: number;
  targetSentence?: string[];
  achievedSentence?: string[];
  district: string;
  village: string;
  block: string;
  title: string;
  remarks: string | null;
  imageUrl: string | null;
  imageKey?: string | null;
  createdAt: string;
  updatedAt: string;
  User?: { id: string; name: string };
}

interface Infrastructure {
  id: string;
  InfraDevId: string;
  project: { id: string; title: string };
  quarter: { id: string; number: number; year: number };
  target?: number;
  title: string;
  achieved?: number;
  targetSentence?: string[];
  achievedSentence?: string[];
  district: string;
  village: string;
  block: string;
  remarks: string | null;
  imageUrl?: string | null;
  imageKey?: string | null;
  createdAt: string;
  updatedAt: string;
  User?: { id: string; name: string };
}

interface InfrastructureFormData {
  projectId: string;
  quarterId: string;
  target: string;
  title: string;
  achieved: string;
  targetSentence: string[];
  achievedSentence: string[];
  district: string;
  village: string;
  block: string;
  remarks: string | null;
  imageFile?: File | null;
  imageUrl?: string | null;
  imageKey?: string | null;
}

interface InfrastructureFormProps {
  infrastructure?: Infrastructure;
  onSave: (data: InfrastructureFormData) => Promise<boolean>;
  onClose: () => void;
  isEdit?: boolean;
}

interface InfrastructureViewProps {
  infrastructure: Infrastructure;
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

interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  code: string;
}

// ArrayInputManager component
function ArrayInputManager({
  label,
  items,
  setItems,
  placeholder,
  error
}: {
  label: string;
  items: string[];
  setItems: (items: string[]) => void;
  placeholder: string;
  error?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAddItem = () => {
    if (inputValue.trim()) {
      setItems([...items, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemoveItem = (indexToRemove: number) => {
    setItems(items.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="border rounded-lg p-1 bg-zinc-50">
      <Label className="">{label}</Label>
      <div className="flex flex-col items-end space-y-2 mt-1">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddItem();
            }
          }}
          className="mt-1 max-h-72"
        />
        <Button type="button" variant="outline" onClick={handleAddItem}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <div className="mt-2 space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
          >
            <span className="text-sm flex-grow">{item}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveItem(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InfrastructurePage() {
  const [infrastructures, setInfrastructures] = useState<Infrastructure[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedInfrastructure, setSelectedInfrastructure] =
    useState<Infrastructure | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pageError, setPageError] = useState<string | null>(null);

  const projects = useProjectStore((state) => state.projects);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const handleAuthError = useAuthStore((state) => state.handleAuthError);

  const fetchInfraData = async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const endpoint =
        user?.role === "admin" ? "get-admin-infra" : "get-user-infra";
      const response = await axios.get<ApiSuccessResponse<RawInfrastructure[]>>(
        `${Base_Url}/${endpoint}`,
        {
          withCredentials: true,
          validateStatus: (status) => status < 500
        }
      );

      if (
        response.data.success &&
        response.status === 200 &&
        response.data.code === "GET_INFRADEV_SUCCESSFULL"
      ) {
        const mappedInfrastructures: Infrastructure[] = (
          response.data.data || []
        ).map((item: RawInfrastructure) => ({
          ...item,
          imageUrl: item.imageUrl ?? undefined,
          imageKey: item.imageKey ?? undefined,
          remarks: item.remarks ?? null,
          target: item.target,
          achieved: item.achieved,
          targetSentence: item.targetSentence || [],
          achievedSentence: item.achievedSentence || []
        }));

        setInfrastructures(mappedInfrastructures);
      }
      if (
        [
          "UNAUTHORIZED",
          "USER_NOT_FOUND",
          "SESSION_NOT_FOUND",
          "SESSION_EXPIRED"
        ].includes(response.data.code)
      ) {
        toast.info("You're logged out", {
          description:
            response.data?.message ||
            "Your session has expired or your account was signed in from another device. Please sign in again."
        });
        handleAuthError(response.data.message);
        return;
      } else if (response.data.code === "NO_INFRA_DEV_FOUND") {
        toast.info("No Infrastructure Found", {
          description: "No Infrastructure data available. Please add new data."
        });
        return;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch infrastructure data"
        );
      }
    } catch (error: unknown) {
      console.error("Error fetching infrastructure data:", error);
      const defaultMessage =
        "An unexpected error occurred while fetching infrastructure data.";
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<ApiErrorResponse>;
        const apiErrorMessage = err.response?.data?.message || err.message;
        setPageError(apiErrorMessage);
        toast.error("Fetch Failed", {
          description: apiErrorMessage || defaultMessage
        });
      } else {
        setPageError(defaultMessage);
        toast.error("Fetch Failed", {
          description: (error as Error).message || defaultMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchInfraData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredInfrastructures: Infrastructure[] = useMemo(
    () =>
      infrastructures.filter((infra) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch: boolean =
          infra.InfraDevId.toLowerCase().includes(searchLower) ||
          infra.project.title.toLowerCase().includes(searchLower) ||
          infra.title.toLowerCase().includes(searchLower) ||
          infra.district.toLowerCase().includes(searchLower) ||
          infra.village.toLowerCase().includes(searchLower) ||
          infra.block.toLowerCase().includes(searchLower);

        let matchesYearQuarter = true;
        if (
          (selectedYear && selectedYear !== "all") ||
          (selectedQuarter && selectedQuarter !== "all")
        ) {
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
          matchesYearQuarter = matchingQuarterIds.includes(infra.quarter.id);
        }

        const matchesProjectFilter: boolean =
          !selectedProject ||
          selectedProject === "all" ||
          infra.project.id === selectedProject;
        const matchesDistrictFilter: boolean =
          !selectedDistrict ||
          selectedDistrict === "all" ||
          infra.district === selectedDistrict;

        return (
          matchesSearch &&
          matchesYearQuarter &&
          matchesProjectFilter &&
          matchesDistrictFilter
        );
      }),
    [
      infrastructures,
      searchTerm,
      selectedYear,
      selectedQuarter,
      selectedProject,
      selectedDistrict
    ]
  );

  const uniqueProjectItems = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return projects.map((p) => ({ id: p.id, title: p.title }));
  }, [projects]);

  const uniqueDistricts = useMemo(() => {
    if (!infrastructures || infrastructures.length === 0) return [];
    return Array.from(
      new Set(infrastructures.map((infra) => infra.district))
    ).sort();
  }, [infrastructures]);

  const handleView = (infra: Infrastructure): void => {
    setSelectedInfrastructure(infra);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (infra: Infrastructure): void => {
    setSelectedInfrastructure(infra);
    setIsEditDialogOpen(true);
  };

  const handleDeletePrompt = (infra: Infrastructure): void => {
    setSelectedInfrastructure(infra);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveInfrastructure = async (
    formData: InfrastructureFormData,
    operation: "create" | "update" = "create",
    infraIdToUpdate?: string
  ): Promise<boolean> => {
    if (operation === "update" && !infraIdToUpdate) {
      toast.error("Infrastructure ID is required for update operation");
      return false;
    }
    const loadingToast = toast.loading(
      `${
        operation === "create" ? "Creating" : "Updating"
      } infrastructure entry...`
    );

    try {
      const requestData = {
        projectId: formData.projectId,
        quarterId: formData.quarterId,
        target: formData.target ? Number.parseInt(formData.target) : undefined,
        achieved: formData.achieved
          ? Number.parseInt(formData.achieved)
          : undefined,
        targetSentence: formData.targetSentence || [],
        achievedSentence: formData.achievedSentence || [],
        district: formData.district,
        village: formData.village,
        title: formData.title,
        block: formData.block,
        remarks: formData.remarks || null,
        imageUrl: formData.imageUrl || null,
        imageKey: formData.imageKey || null
      };

      let response;
      const config = {
        withCredentials: true,
        timeout: 30000,
        headers: { "Content-Type": "application/json" }
      };

      if (operation === "create") {
        response = await axios.post<ApiSuccessResponse<RawInfrastructure>>(
          `${Base_Url}/create-infrastructure`,
          requestData,
          config
        );
      } else {
        response = await axios.put<ApiSuccessResponse<RawInfrastructure>>(
          `${Base_Url}/update-infrastructure/${infraIdToUpdate}`,
          requestData,
          config
        );
      }

      const apiResponse = response.data;

      if (
        apiResponse.success &&
        ((operation === "create" &&
          response.status === 201 &&
          apiResponse.code === "INFRASTRUCTURE_CREATED") ||
          (operation === "update" &&
            response.status === 200 &&
            apiResponse.code === "RESOURCE_UPDATED"))
      ) {
        toast.success(
          apiResponse.message || `Infrastructure ${operation}d successfully`,
          {
            description: `ID: ${apiResponse.data.InfraDevId}`,
            duration: 6000
          }
        );
        const newOrUpdatedInfra: Infrastructure = {
          ...apiResponse.data,
          imageUrl: apiResponse.data.imageUrl,
          imageKey: apiResponse.data.imageKey,
          remarks: apiResponse.data.remarks,
          target: apiResponse.data.target,
          achieved: apiResponse.data.achieved,
          targetSentence: apiResponse.data.targetSentence || [],
          achievedSentence: apiResponse.data.achievedSentence || []
        };

        if (operation === "create") {
          setInfrastructures((prev) => [newOrUpdatedInfra, ...prev]);
        } else {
          setInfrastructures((prev) =>
            prev.map((infra) =>
              infra.id === infraIdToUpdate ? newOrUpdatedInfra : infra
            )
          );
        }
        setIsDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedInfrastructure(null);
        return true;
      } else {
        const message =
          apiResponse.message ||
          `Failed to ${operation} infrastructure. Unexpected response.`;
        toast.error(message);
        console.error("API Error Data:", apiResponse);
        return false;
      }
    } catch (error: unknown) {
      console.error(`Error ${operation}ing infrastructure:`, error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        let description = "An error occurred.";
        if (errorData) {
          description = errorData.message || description;
          if (errorData.code === "VALIDATION_ERROR" && errorData.errors) {
            description = "Validation failed. Check inputs.";
            console.error("Validation Errors:", errorData.errors);
          }
        } else if (axiosError.request) {
          description = "No response from server. Check network.";
        }
        toast.error(`Failed to ${operation}`, { description });

        if (axiosError.response?.status === 401 && logout) {
          logout();
          navigate("/signin");
        }
      } else {
        toast.error(`Failed to ${operation}`, {
          description:
            (error as Error).message || "An unexpected error occurred."
        });
      }
      return false;
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleDeleteInfrastructure = async () => {
    if (!selectedInfrastructure) {
      toast.error("No infrastructure entry selected for deletion.");
      return;
    }
    setIsDeleting(true);
    const loadingToast = toast.loading(
      `Deleting infrastructure ID: ${selectedInfrastructure.InfraDevId}...`
    );
    try {
      const response = await axios.delete<{
        success: boolean;
        message: string;
        code: string;
        warning: string;
      }>(`${Base_Url}/delete-infraDev/${selectedInfrastructure.id}`, {
        withCredentials: true,
        timeout: 30000
      });

      if (response.status === 200 && response.data.success) {
        if (response.data.warning) {
          toast.warning("Infrastructure deleted with warnings", {
            description: `${selectedInfrastructure.InfraDevId} was removed from database, but ${response.data.warning}`,
            duration: 8000
          });
        } else {
          toast.success(
            response.data.message ||
              "Infrastructure entry deleted successfully.",
            {
              description: `ID: ${selectedInfrastructure.InfraDevId}`
            }
          );
        }
        setInfrastructures((prev) =>
          prev.filter((infra) => infra.id !== selectedInfrastructure.id)
        );
        setSelectedInfrastructure(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Deletion Failed", {
          description: response.data?.message || "Could not delete the entry."
        });
      }
    } catch (error: unknown) {
      console.error("Delete infrastructure error:", error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        toast.error("Deletion Failed", {
          description:
            errorData?.message || "An error occurred during deletion."
        });
      } else {
        toast.error("Deletion Failed", {
          description:
            (error as Error).message || "An unexpected error occurred."
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Infrastructure Development
              </h1>
              <p className="text-sm text-gray-600">
                Manage infrastructure projects and track development
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" /> New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Infrastructure Entry</DialogTitle>
                <DialogDescription>
                  Create a new infrastructure development entry.
                </DialogDescription>
              </DialogHeader>
              <InfrastructureForm
                onSave={(formData) =>
                  handleSaveInfrastructure(formData, "create")
                }
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {pageError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{pageError}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-4.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search infrastructure..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                  {uniqueProjectItems.map((project) => (
                    <SelectItem key={project.id} value={project.title}>
                      {project.title}
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
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Districts</SelectItem>
                  {uniqueDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Entries</CardTitle>
            <CardDescription>
              List of all infrastructure development entries.
              {filteredInfrastructures.length !== infrastructures.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredInfrastructures.length} of {infrastructures.length}{" "}
                  shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Infra. ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Achieved/Target</TableHead>
                  {user?.role === "admin" && <TableHead>Created By</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <EnhancedShimmerTableRows />
                ) : filteredInfrastructures.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={user?.role === "admin" ? 7 : 6}
                      className="text-center py-8 text-gray-500"
                    >
                      No entries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInfrastructures.map((infra) => (
                    <TableRow key={infra.id}>
                      <TableCell className="font-medium">
                        {infra.InfraDevId}
                      </TableCell>
                      <TableCell className="truncate max-w-[200px]">
                        {infra.project?.title}
                      </TableCell>
                      <TableCell className="truncate max-w-[200px]">
                        {infra.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {`Q${
                            quarterlyData.find(
                              (q) => q.id === infra.quarter?.id
                            )?.number
                          } ${
                            quarterlyData.find(
                              (q) => q.id === infra.quarter?.id
                            )?.year
                          }`}
                        </Badge>
                      </TableCell>
                      <TableCell className="truncate max-w-[200px]">{`${infra.district}, ${infra.village}, ${infra.block}`}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {infra.achieved ?? "N/A"}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            /
                            <span className="text-gray-700">
                              {" "}
                              {infra.target ?? "N/A"}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      {user?.role === "admin" && (
                        <TableCell>{infra.User?.name || "N/A"}</TableCell>
                      )}
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(infra)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(infra)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePrompt(infra)}
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
          <DialogContent
            aria-describedby={undefined}
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>Infrastructure Details</DialogTitle>
            </DialogHeader>
            {selectedInfrastructure && (
              <InfrastructureView infrastructure={selectedInfrastructure} />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent
            aria-describedby={undefined}
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle>Edit Infrastructure Entry</DialogTitle>
            </DialogHeader>
            {selectedInfrastructure && (
              <InfrastructureForm
                infrastructure={selectedInfrastructure}
                onSave={(formData) =>
                  handleSaveInfrastructure(
                    formData,
                    "update",
                    selectedInfrastructure.id
                  )
                }
                onClose={() => setIsEditDialogOpen(false)}
                isEdit={true}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete infrastructure entry:{" "}
                <strong>{selectedInfrastructure?.InfraDevId}</strong>? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteInfrastructure}
                disabled={isDeleting}
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

function InfrastructureView({ infrastructure }: InfrastructureViewProps) {
  const projects = useProjectStore((state) => state.projects);
  const projectTitle =
    projects.find((p) => p.id === infrastructure.project.id)?.title ||
    "Unknown Project";
  const quarterInfo = quarterlyData.find(
    (q) => q.id === infrastructure.quarter.id
  );
  const quarterDisplay = quarterInfo
    ? `Q${quarterInfo.number} ${quarterInfo.year}`
    : "Unknown Quarter";

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Infrastructure ID</Label>
          <p className="font-semibold text-md">{infrastructure.InfraDevId}</p>
        </div>
        <div>
          <Label>Project</Label>
          <p className="text-md">{projectTitle}</p>
        </div>
        <div>
          <Label>Title</Label>
          <p>{infrastructure.title}</p>
        </div>
      </div>
      <hr />
      <div>
        <Label>Location</Label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>District</Label>
          <p>{infrastructure.district}</p>
        </div>
        <div>
          <Label>Village</Label>
          <p>{infrastructure.village}</p>
        </div>
        <div>
          <Label>Block</Label>
          <p>{infrastructure.block}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Quarter</Label>
          <p className="mt-1">
            <Badge variant="outline">{quarterDisplay}</Badge>
          </p>
        </div>
        <div>
          <Label>Target</Label>
          <p className="font-semibold">{infrastructure.target || "N/A"}</p>
        </div>
        <div>
          <Label>Achieved</Label>
          <p className="font-semibold text-green-600">
            {infrastructure.achieved || "N/A"}
          </p>
        </div>
      </div>
      <hr />

      {/* Display Target Sentences */}
      {infrastructure.targetSentence &&
        infrastructure.targetSentence.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Target Objectives
            </h3>
            <ul className="space-y-3">
              {infrastructure.targetSentence.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2.5 text-sm pt-0.5">
                    {index + 1}.
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {objective}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Display Achieved Sentences */}
      {infrastructure.achievedSentence &&
        infrastructure.achievedSentence.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Achieved Objectives
            </h3>
            <ul className="space-y-3">
              {infrastructure.achievedSentence.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 font-semibold mr-2.5 text-sm pt-0.5">
                    {index + 1}.
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {objective}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

      {infrastructure.remarks && (
        <>
          <hr />
          <div>
            <Label>Remarks</Label>
            <p className="bg-gray-50 p-2 rounded-md">
              {infrastructure.remarks}
            </p>
          </div>
        </>
      )}
      {infrastructure.imageUrl && (
        <>
          <hr />
          <div>
            <Label>Image</Label>
            <div className="mt-2 border rounded-md overflow-hidden max-w-sm">
              <img
                src={infrastructure.imageUrl || "/placeholder.svg"}
                alt={`Infrastructure ${infrastructure.InfraDevId}`}
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
            {new Date(infrastructure.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <Label className="flex items-center">
            Last Updated{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>
          <p className="tracking-wider mt-2">
            {new Date(infrastructure.updatedAt).toLocaleString()}
          </p>
        </div>
        {infrastructure.User && (
          <div>
            <Label>Created/Managed By</Label>
            <p className="tracking-wider mt-2">{infrastructure.User.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfrastructureForm({
  infrastructure,
  onSave,
  onClose,
  isEdit = false
}: InfrastructureFormProps) {
  const [formData, setFormData] = useState<InfrastructureFormData>({
    projectId: infrastructure?.project.id || "",
    quarterId: infrastructure?.quarter.id || "",
    target: infrastructure?.target?.toString() || "",
    achieved: infrastructure?.achieved?.toString() || "",
    targetSentence: infrastructure?.targetSentence || [],
    achievedSentence: infrastructure?.achievedSentence || [],
    district: infrastructure?.district || "",
    title: infrastructure?.title || "",
    village: infrastructure?.village || "",
    block: infrastructure?.block || "",
    remarks: infrastructure?.remarks || "",
    imageFile: null,
    imageUrl: infrastructure?.imageUrl,
    imageKey: infrastructure?.imageKey
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const projects = useProjectStore((state) => state.projects);
  const [url, setUrl] = useState<SignedUrlResponse | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageToBeRemovedKey, setImageToBeRemovedKey] = useState<string | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (isEdit && infrastructure?.imageUrl) {
      setImagePreviewUrl(infrastructure.imageUrl);
      setFormData((prev) => ({
        ...prev,
        imageUrl: infrastructure.imageUrl,
        imageKey: infrastructure.imageKey
      }));
    }
  }, [isEdit, infrastructure]);

  const uniqueProjectItems = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return projects.map((p) => ({ id: p.id, title: p.title }));
  }, [projects]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = async (
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

    if (file) {
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
        imageUrl: null,
        imageKey: null
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
          isEdit && infrastructure?.imageUrl ? infrastructure.imageUrl : null
        );
        setFormData((prev) => ({ ...prev, imageFile: null }));
        setUrl(null);
      } finally {
        setIsProcessingFile(false);
      }
    }
  };

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

    if (isEdit && infrastructure?.imageKey) {
      setImageToBeRemovedKey(infrastructure.imageKey);
    } else {
      setImageToBeRemovedKey(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Image removed");
  };

  const validateForm = (): boolean => {
    const dataToValidate = {
      projectId: formData.projectId,
      quarterId: formData.quarterId,
      target: formData.target ? Number.parseInt(formData.target) : undefined,
      achieved: formData.achieved
        ? Number.parseInt(formData.achieved)
        : undefined,
      targetSentence: formData.targetSentence || [],
      achievedSentence: formData.achievedSentence || [],
      district: formData.district,
      village: formData.village,
      title: formData.title,
      block: formData.block,
      remarks: formData.remarks || null,
      imageUrl: formData.imageFile ? null : formData.imageUrl,
      imageKey: formData.imageFile ? null : formData.imageKey
    };

    try {
      if (isEdit) {
        updateInfrastructureValidation.parse(dataToValidate);
      } else {
        createInfrastructureValidation.parse(dataToValidate);
      }
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0)
            newErrors[err.path[0].toString()] = err.message;
        });
        setFormErrors(newErrors);
        toast.error("Validation Error", {
          description: "Please check the form for errors."
        });
      }
      return false;
    }
  };

  const isSubmitDisabled = (): boolean => {
    if (isSubmitting === true) return true;
    if (isProcessingFile === true) return true;
    if (formData.imageFile && (!url || !url.signedUrl)) return true;
    return false;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    let finalImageUrl: string | null = infrastructure?.imageUrl || null;
    let finalImageKey: string | null = infrastructure?.imageKey || null;

    try {
      // 1. Handle removal of an existing image
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

      // 2. Handle upload of a new image
      if (formData.imageFile && url?.signedUrl) {
        if (
          isEdit &&
          infrastructure?.imageKey &&
          !imageToBeRemovedKey &&
          formData.imageFile
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const oldKeyDeleted = await deleteFileFromCloudflare(
            infrastructure.imageKey
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

      // Prepare data for onSave callback
      const dataToSave: InfrastructureFormData = {
        ...formData,
        imageUrl: finalImageUrl,
        imageKey: finalImageKey
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
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <Label htmlFor="projectId">
            Project <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.projectId}
            onValueChange={(value) => handleSelectChange("projectId", value)}
          >
            <SelectTrigger
              id="projectId"
              className={formErrors.projectId ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {uniqueProjectItems.map((proj) => (
                <TooltipProvider key={proj.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SelectItem
                        value={proj.id}
                        className="truncate w-[400px] whitespace-nowrap overflow-hidden"
                      >
                        {proj.title}
                      </SelectItem>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs break-words tracking-wide">
                      <p>{proj.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </SelectContent>
          </Select>
          {formErrors.projectId && (
            <p className="text-red-500 text-sm mt-1">{formErrors.projectId}</p>
          )}
        </div>
        <div>
          <Label htmlFor="title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Infrastructure title.."
            value={formData.title}
            onChange={handleInputChange}
            className={formErrors.title ? "border-red-500" : ""}
          />
          {formErrors.title && (
            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quarterId">
            Quarter <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.quarterId}
            onValueChange={(value) => handleSelectChange("quarterId", value)}
          >
            <SelectTrigger
              id="quarterId"
              className={formErrors.quarterId ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {quarterlyData.map((q) => (
                <SelectItem
                  key={q.id}
                  value={q.id}
                >{`Q${q.number} ${q.year}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.quarterId && (
            <p className="text-red-500 text-sm mt-1">{formErrors.quarterId}</p>
          )}
        </div>
        <div>
          <Label htmlFor="target">Target</Label>
          <Input
            id="target"
            name="target"
            type="number"
            placeholder="0"
            value={formData.target}
            onChange={handleInputChange}
            className={formErrors.target ? "border-red-500" : ""}
          />
          {formErrors.target && (
            <p className="text-red-500 text-sm mt-1">{formErrors.target}</p>
          )}
        </div>
        <div>
          <Label htmlFor="achieved">Achieved</Label>
          <Input
            id="achieved"
            name="achieved"
            type="number"
            placeholder="0"
            value={formData.achieved}
            onChange={handleInputChange}
            className={formErrors.achieved ? "border-red-500" : ""}
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
            className={formErrors.district ? "border-red-500" : ""}
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
            className={formErrors.village ? "border-red-500" : ""}
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
            className={formErrors.block ? "border-red-500" : ""}
          />
          {formErrors.block && (
            <p className="text-red-500 text-sm mt-1">{formErrors.block}</p>
          )}
        </div>
      </div>

      {/* Array Input Managers for Target and Achieved Sentences */}
      <div className="grid grid-cols-1  gap-4">
        <ArrayInputManager
          label="Target Objectives"
          items={formData.targetSentence}
          setItems={(items) =>
            setFormData((p) => ({ ...p, targetSentence: items }))
          }
          placeholder="Add a target objective"
          error={formErrors.targetSentence}
        />
        <ArrayInputManager
          label="Achieved Objectives"
          items={formData.achievedSentence}
          setItems={(items) =>
            setFormData((p) => ({ ...p, achievedSentence: items }))
          }
          placeholder="Add an achieved objective"
          error={formErrors.achievedSentence}
        />
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          name="remarks"
          placeholder="Additional remarks (max 300 characters)"
          value={formData.remarks || ""}
          onChange={handleInputChange}
          className={formErrors.remarks ? "border-red-500 mt-2" : "mt-2"}
        />
        {formErrors.remarks && (
          <p className="text-red-500 text-sm mt-1">{formErrors.remarks}</p>
        )}
      </div>

      <div>
        <Label htmlFor="imageFile">Infrastructure Image</Label>
        <div
          className={`mt-1 p-4 border-2 ${
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
                  alt="Program preview"
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
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 20MB</p>
            </div>
          )}
          <Input
            id="imageFile"
            name="imageFile"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {formErrors.imageFile && (
            <p className="text-red-500 text-sm mt-1">{formErrors.imageFile}</p>
          )}

          {formErrors.imageUrl && (
            <p className="text-red-500 text-sm mt-1">{formErrors.imageUrl}</p>
          )}
          {formErrors.imageKey && (
            <p className="text-red-500 text-sm mt-1">{formErrors.imageKey}</p>
          )}
          {isProcessingFile && (
            <div className="text-sm text-green-600 mt-2  text-center">
              <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
              Preparing file for upload...
            </div>
          )}
          {formData.imageFile && !url?.signedUrl && !isProcessingFile && (
            <div className="text-sm text-amber-600 mt-2   text-center">
              ⚠️ File selected but not ready for upload. Please wait or try
              selecting again.
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitDisabled()}
          className={`your-button-classes ${
            isSubmitDisabled() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitDisabled()}
          className={`your-button-classes bg-green-600 hover:bg-green-700 ${
            isSubmitDisabled() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
              Saving...
            </>
          ) : isProcessingFile ? (
            <>
              <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
              Processing...
            </>
          ) : isEdit ? (
            "Update Entry"
          ) : (
            "Save Entry"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
