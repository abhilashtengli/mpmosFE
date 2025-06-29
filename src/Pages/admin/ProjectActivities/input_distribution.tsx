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
  Loader2,
  ImageIcon,
  UploadCloud,
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
// Updated Zod validation schemas based on backend requirements
const createInputDistributionValidation = z
  .object({
    projectId: z.string().uuid({ message: "Valid project ID is required" }),
    quarterId: z.string().uuid({ message: "Valid quarter ID is required" }),
    activityType: z
      .string()
      .trim()
      .min(2, { message: "Activity type must be at least 2 characters" })
      .max(100, { message: "Activity type cannot exceed 100 characters" }),
    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(200, { message: "Name cannot exceed 200 characters" }),
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
    units: z
      .string()
      .trim()
      .max(20, { message: "Units cannot exceed 20 characters" })
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

      // Either both should be present or both should be absent
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
      // If imageUrl is provided, imageKey must also be provided
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

const updateInputDistributionValidation = z
  .object({
    projectId: z
      .string()
      .uuid({ message: "Valid project ID is required" })
      .optional(),
    quarterId: z
      .string()
      .uuid({ message: "Valid quarter ID is required" })
      .optional(),
    activityType: z
      .string()
      .trim()
      .min(2, { message: "Activity type must be at least 2 characters" })
      .max(100, { message: "Activity type cannot exceed 100 characters" })
      .optional(),
    name: z
      .string()
      .trim()
      .min(2, { message: "Name must be at least 2 characters" })
      .max(200, { message: "Name cannot exceed 200 characters" })
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
    units: z
      .string()
      .trim()
      .max(20, { message: "Units cannot exceed 20 characters" })
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

// Updated interfaces
interface RawInputDistribution {
  id: string;
  inputDistId: string;
  project: { id: string; title: string };
  quarter: { id: string; number: number; year: number };
  activityType: string;
  name: string;
  target?: number;
  achieved?: number;
  targetSentence?: string[];
  achievedSentence?: string[];
  district: string;
  village: string;
  block: string;
  remarks: string | null;
  units: string | null;
  imageUrl: string | null;
  imageKey?: string | null;
  createdAt: string;
  updatedAt: string;
  User?: { id: string; name: string };
}

type InputDistribution = RawInputDistribution;

interface InputDistributionFormData {
  projectId: string;
  quarterId: string;
  activityType: string;
  customActivityType?: string;
  name: string;
  target: string;
  achieved: string;
  targetSentence: string[];
  achievedSentence: string[];
  district: string;
  village: string;
  block: string;
  remarks: string | null;
  units: string | null;
  imageFile?: File | null;
  imageUrl?: string | null;
  imageKey?: string | null;
}

interface InputDistributionFormProps {
  distribution?: InputDistribution;
  onSave: (data: InputDistributionFormData) => Promise<boolean>;
  onClose: () => void;
  isEdit?: boolean;
}

interface InputDistributionViewProps {
  distribution: InputDistribution;
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

const PREDEFINED_ACTIVITY_TYPES = [
  "Seed Distribution",
  "Planting Materials",
  "Fertilizers",
  "Pesticides",
  "Tools & Equipment",
  "Other" // Allow custom input if "Other" is selected
];

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
          <PlusCircle className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      {typeof error === "string" && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
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

export default function InputDistributionPage() {
  const [distributions, setDistributions] = useState<InputDistribution[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedDistribution, setSelectedDistribution] =
    useState<InputDistribution | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedActivityType, setSelectedActivityType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pageError, setPageError] = useState<string | null>(null);

  const projects = useProjectStore((state) => state.projects);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const fetchInputDistributions = async () => {
    setIsLoading(true);
    setPageError(null);
    try {
      const endpoint =
        user?.role === "admin" ? "get-admin-inputdist" : "get-user-inputdist";
      const response = await axios.get<
        ApiSuccessResponse<RawInputDistribution[]>
      >(`${Base_Url}/${endpoint}`, {
        withCredentials: true
      });

      if (
        response.data.success &&
        response.status === 200 &&
        response.data.code === "GET_INPUTDIST_SUCCESSFULL"
      ) {
        const mappedData: InputDistribution[] = (response.data.data || []).map(
          (item) => ({
            ...item,
            imageUrl: item.imageUrl ?? null,
            imageKey: item.imageKey ?? null,
            remarks: item.remarks ?? null,
            units: item.units ?? null,
            targetSentence: item.targetSentence || [],
            achievedSentence: item.achievedSentence || []
          })
        );
        setDistributions(mappedData);
      } else if (response.data.code === "NO_INPUT_DIST_FOUND") {
        setDistributions([]);
        toast.info("No Input Distribution Found", {
          description:
            "No Input Distribution data available. Please add new data."
        });
        return;
      } else {
        throw new Error(
          response.data.message || "Failed to fetch input distributions"
        );
      }
    } catch (error: unknown) {
      console.error("Error fetching input distributions:", error);
      const defaultMessage =
        "An unexpected error occurred while fetching data.";
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
    fetchInputDistributions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filteredDistributions: InputDistribution[] = useMemo(
    () =>
      distributions.filter((dist) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          dist.inputDistId.toLowerCase().includes(searchLower) ||
          dist.name.toLowerCase().includes(searchLower) ||
          dist.project.title.toLowerCase().includes(searchLower) ||
          dist.activityType.toLowerCase().includes(searchLower) ||
          dist.district.toLowerCase().includes(searchLower);

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
          matchesYearQuarter = matchingQuarterIds.includes(dist.quarter.id);
        }

        const matchesProjectFilter =
          !selectedProject ||
          selectedProject === "all" ||
          dist.project.id === selectedProject;
        const matchesDistrictFilter =
          !selectedDistrict ||
          selectedDistrict === "all" ||
          dist.district === selectedDistrict;
        const matchesActivityTypeFilter =
          !selectedActivityType ||
          selectedActivityType === "all" ||
          dist.activityType === selectedActivityType;

        return (
          matchesSearch &&
          matchesYearQuarter &&
          matchesProjectFilter &&
          matchesDistrictFilter &&
          matchesActivityTypeFilter
        );
      }),
    [
      distributions,
      searchTerm,
      selectedYear,
      selectedQuarter,
      selectedProject,
      selectedDistrict,
      selectedActivityType
    ]
  );

  const uniqueProjectItems = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    return projects.map((p) => ({ id: p.id, title: p.title }));
  }, [projects]);

  const uniqueDistricts = useMemo(() => {
    if (!distributions || distributions.length === 0) return [];
    return Array.from(new Set(distributions.map((d) => d.district))).sort();
  }, [distributions]);

  const uniqueActivityTypes = useMemo(() => {
    if (!distributions || distributions.length === 0)
      return PREDEFINED_ACTIVITY_TYPES; // Fallback if no data
    const typesFromData = Array.from(
      new Set(distributions.map((d) => d.activityType))
    );
    return Array.from(
      new Set([...PREDEFINED_ACTIVITY_TYPES, ...typesFromData])
    ).sort();
  }, [distributions]);

  const handleView = (dist: InputDistribution): void => {
    setSelectedDistribution(dist);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (dist: InputDistribution): void => {
    setSelectedDistribution(dist);
    setIsEditDialogOpen(true);
  };

  const handleDeletePrompt = (dist: InputDistribution): void => {
    setSelectedDistribution(dist);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveDistribution = async (
    formData: InputDistributionFormData, // This formData now includes customActivityType
    operation: "create" | "update" = "create",
    distIdToUpdate?: string
  ): Promise<boolean> => {
    if (operation === "update" && !distIdToUpdate) {
      toast.error("Distribution ID is required for update.");
      return false;
    }

    const loadingToast = toast.loading(
      `${
        operation === "create" ? "Creating" : "Updating"
      } input distribution...`
    );

    // Determine the final activity type to send to the API
    const finalActivityType =
      formData.activityType === "Other" && formData.customActivityType?.trim()
        ? formData.customActivityType.trim()
        : formData.activityType;

    try {
      const requestData = {
        projectId: formData.projectId,
        quarterId: formData.quarterId,
        activityType: finalActivityType, // Use the determined final activity type
        name: formData.name,
        target: formData.target ? Number.parseInt(formData.target) : undefined,
        achieved: formData.achieved
          ? Number.parseInt(formData.achieved)
          : undefined,
        targetSentence: formData.targetSentence || [],
        achievedSentence: formData.achievedSentence || [],
        district: formData.district,
        village: formData.village,
        block: formData.block,
        remarks: formData.remarks || null,
        units: formData.units || null,
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
        response = await axios.post<ApiSuccessResponse<RawInputDistribution>>(
          `${Base_Url}/create-input-distribution`,
          requestData,
          config
        );
      } else {
        response = await axios.put<ApiSuccessResponse<RawInputDistribution>>(
          `${Base_Url}/update-input-distribution/${distIdToUpdate}`,
          requestData,
          config
        );
      }
      const apiResponse = response.data;

      if (
        apiResponse.success &&
        ((operation === "create" &&
          response.status === 201 &&
          apiResponse.code === "INPUT_DISTRIBUTION_CREATED") ||
          (operation === "update" &&
            response.status === 200 &&
            apiResponse.code === "RESOURCE_UPDATED"))
      ) {
        toast.success(
          apiResponse.message || `Distribution ${operation}d successfully.`,
          {
            description: `ID: ${apiResponse.data.inputDistId}`
          }
        );

        const newOrUpdatedDist: InputDistribution = {
          ...apiResponse.data,
          imageUrl: apiResponse.data.imageUrl ?? null,
          imageKey: apiResponse.data.imageKey ?? null,
          remarks: apiResponse.data.remarks ?? null,
          units: apiResponse.data.units ?? null,
          targetSentence: apiResponse.data.targetSentence || [],
          achievedSentence: apiResponse.data.achievedSentence || []
        };

        if (operation === "create") {
          setDistributions((prev) => [newOrUpdatedDist, ...prev]);
        } else {
          setDistributions((prev) =>
            prev.map((d) => (d.id === distIdToUpdate ? newOrUpdatedDist : d))
          );
        }
        setIsDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedDistribution(null);
        return true;
      } else {
        const message =
          apiResponse.message || `Failed to ${operation} distribution.`;
        toast.error(message);
        return false;
      }
    } catch (error: unknown) {
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
      toast.dismiss(loadingToast);
    }
  };

  const handleDeleteDistribution = async () => {
    if (!selectedDistribution) {
      toast.error("No distribution selected.");
      return;
    }
    setIsDeleting(true);
    const loadingToast = toast.loading(
      `Deleting ID: ${selectedDistribution.inputDistId}...`
    );
    try {
      const response = await axios.delete<{
        success: boolean;
        message: string;
        code: string;
        warning: string;
      }>(`${Base_Url}/delete-input-dist/${selectedDistribution.id}`, {
        withCredentials: true,
        timeout: 30000
      });
      if (
        response.status === 200 &&
        response.data.success &&
        response.data.code === "RESOURCE_DELETED"
      ) {
        if (response.data.warning) {
          // Show warning toast for partial success
          toast.warning("Distribution deleted with warnings", {
            description: `Input Distribution was removed from database, but ${response.data.warning}`,
            duration: 8000 // Longer duration for warnings
          });
        } else {
          // Show success toast for complete success
          toast.success(response.data.message || "Distribution deleted.", {
            description: `ID: ${selectedDistribution.inputDistId}`
          });
        }
        setDistributions((prev) =>
          prev.filter((d) => d.id !== selectedDistribution.id)
        );
        setSelectedDistribution(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Deletion Failed", {
          description: response.data?.message || "Could not delete."
        });
      }
    } catch (error: unknown) {
      console.error("Delete distribution error:", error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        toast.error("Deletion Failed", {
          description: axiosError.response?.data?.message || "Server error."
        });
      } else {
        toast.error("Deletion Failed", {
          description: (error as Error).message || "Unexpected error."
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
                Input Distribution
              </h1>
              <p className="text-sm text-gray-600">
                Manage input distribution programs and track deliveries
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" /> New Distribution
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Input Distribution</DialogTitle>
                <DialogDescription>
                  Create a new input distribution entry.
                </DialogDescription>
              </DialogHeader>
              <InputDistributionForm
                onSave={(formData) =>
                  handleSaveDistribution(formData, "create")
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-6.5 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search distributions..."
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
                  {[1, 2, 3, 4].map((q) => (
                    <SelectItem key={q} value={String(q)}>{`Q${q}`}</SelectItem>
                  ))}
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
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Projects</SelectItem>
                  {uniqueProjectItems.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {" "}
                      {/* Use ID for value */}
                      {proj.title}
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
              {/* Activity Type Filter - Added as per structure */}
              <Select
                value={selectedActivityType}
                onValueChange={setSelectedActivityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All Activity Types</SelectItem>
                  {uniqueActivityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Input Distribution Entries</CardTitle>
            <CardDescription>
              List of all input distribution activities.
              {filteredDistributions.length !== distributions.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredDistributions.length} of {distributions.length}{" "}
                  shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dist. ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Project</TableHead>
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
                ) : filteredDistributions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={user?.role === "admin" ? 10 : 9}
                      className="text-center py-8 text-gray-500"
                    >
                      No distributions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDistributions.map((dist) => (
                    <TableRow key={dist.id}>
                      <TableCell className="font-medium">
                        {dist.inputDistId}
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">
                        {dist.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{dist.activityType}</Badge>
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">
                        {dist.project.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {`Q${
                            quarterlyData.find((q) => q.id === dist.quarter.id)
                              ?.number
                          } ${
                            quarterlyData.find((q) => q.id === dist.quarter.id)
                              ?.year
                          }`}
                        </Badge>
                      </TableCell>
                      <TableCell className="truncate max-w-[150px]">{`${dist.district}, ${dist.village}`}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {dist.achieved !== undefined &&
                          dist.target !== undefined ? (
                            <>
                              <span className="text-green-600 font-medium">
                                {dist.achieved || "N/A"}
                              </span>
                              <span className="text-gray-400">
                                {" "}
                                /
                                <span className="text-gray-700">
                                  {" "}
                                  {dist.target || "N/A"} {dist.units}
                                </span>
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      {user?.role === "admin" && (
                        <TableCell>{dist.User?.name || "N/A"}</TableCell>
                      )}
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(dist)}
                          >
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(dist)}
                          >
                            <Eye className="h-3 w-3 mr-1" /> View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePrompt(dist)}
                          >
                            <Trash2 className="h-3 w-3 mr-1 text-red-600" />{" "}
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

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Input Distribution Details</DialogTitle>
            </DialogHeader>
            {selectedDistribution && (
              <InputDistributionView distribution={selectedDistribution} />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Input Distribution</DialogTitle>
            </DialogHeader>
            {selectedDistribution && (
              <InputDistributionForm
                distribution={selectedDistribution}
                onSave={(formData) =>
                  handleSaveDistribution(
                    formData,
                    "update",
                    selectedDistribution.id
                  )
                }
                onClose={() => setIsEditDialogOpen(false)}
                isEdit={true}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete distribution:{" "}
                <strong>{selectedDistribution?.name}</strong> (ID:{" "}
                {selectedDistribution?.inputDistId})? This action cannot be
                undone.
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
                onClick={handleDeleteDistribution}
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

function InputDistributionView({ distribution }: InputDistributionViewProps) {
  const projects = useProjectStore((state) => state.projects);
  const projectTitle =
    projects.find((p) => p.id === distribution.project.id)?.title ||
    "Unknown Project";
  const quarterInfo = quarterlyData.find(
    (q) => q.id === distribution.quarter.id
  );
  const quarterDisplay = quarterInfo
    ? `Q${quarterInfo.number} ${quarterInfo.year}`
    : "Unknown Quarter";

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Distribution ID</Label>
          <p className="font-semibold text-md">{distribution.inputDistId}</p>
        </div>
        <div>
          <Label>Name</Label>
          <p className="text-md">{distribution.name}</p>
        </div>
        <div>
          <Label>Activity Type</Label>
          <p className="mt-1">
            <Badge variant="secondary">{distribution.activityType}</Badge>
          </p>
        </div>
        <div>
          <Label>Project</Label>
          <p>{projectTitle}</p>
        </div>
        <div>
          <Label>Quarter</Label>
          <p className="mt-1">
            <Badge variant="outline">{quarterDisplay}</Badge>
          </p>
        </div>
      </div>
      <hr />
      <div>
        <Label>Location</Label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>District</Label>
          <p>{distribution.district}</p>
        </div>
        <div>
          <Label>Village</Label>
          <p>{distribution.village}</p>
        </div>
        <div>
          <Label>Block</Label>
          <p>{distribution.block}</p>
        </div>
      </div>
      <hr />
      {(distribution.target !== undefined ||
        distribution.achieved !== undefined) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Target</Label>
              <p className="font-semibold">{distribution.target || "N/A"}</p>
            </div>
            <div>
              <Label>Achieved</Label>
              <p className="font-semibold text-green-600">
                {distribution.achieved || "N/A"}
              </p>
            </div>
            <div>
              <Label>Units</Label>
              <p>{distribution.units || "N/A"}</p>
            </div>
          </div>
          <hr />
        </>
      )}

      {/* Target Sentences */}
      {distribution.targetSentence &&
        distribution.targetSentence.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Target Points
            </h3>
            <ul className="space-y-3">
              {distribution.targetSentence.map((target, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 font-semibold mr-2.5 text-sm pt-0.5">
                    {index + 1}.
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {target}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Achieved Sentences */}
      {distribution.achievedSentence &&
        distribution.achievedSentence.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Achievements
            </h3>
            <ul className="space-y-3">
              {distribution.achievedSentence.map((achievement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-600 font-semibold mr-2.5 text-sm pt-0.5">
                    {index + 1}.
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {achievement}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

      {distribution.remarks && (
        <>
          <hr />
          <div>
            <Label>Remarks</Label>
            <p className="bg-gray-50 p-2 rounded-md">{distribution.remarks}</p>
          </div>
        </>
      )}
      {distribution.imageUrl && (
        <>
          <hr />
          <div>
            <Label>Image</Label>
            <div className="mt-2 border rounded-md overflow-hidden max-w-sm">
              <img
                src={distribution.imageUrl || "/placeholder.svg"}
                alt={distribution.name}
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
            {new Date(distribution.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <Label className="flex items-center">
            Last Updated{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>
          <p className="tracking-wider mt-2">
            {new Date(distribution.updatedAt).toLocaleString()}
          </p>
        </div>
        {distribution.User && (
          <div>
            <Label>Created/Managed By</Label>
            <p className="tracking-wider mt-2">{distribution.User.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InputDistributionForm({
  distribution,
  onSave,
  onClose,
  isEdit = false
}: InputDistributionFormProps) {
  const isInitialCustomActivity =
    distribution?.activityType &&
    !PREDEFINED_ACTIVITY_TYPES.includes(distribution.activityType);

  const [formData, setFormData] = useState<InputDistributionFormData>({
    projectId: distribution?.project.id || "",
    quarterId: distribution?.quarter.id || "",
    activityType: isInitialCustomActivity
      ? "Other"
      : distribution?.activityType || "",
    customActivityType: isInitialCustomActivity
      ? distribution.activityType
      : "", // Initialize custom field
    name: distribution?.name || "",
    target: distribution?.target?.toString() || "",
    achieved: distribution?.achieved?.toString() || "",
    targetSentence: distribution?.targetSentence || [],
    achievedSentence: distribution?.achievedSentence || [],
    district: distribution?.district || "",
    village: distribution?.village || "",
    block: distribution?.block || "",
    remarks: distribution?.remarks || "",
    units: distribution?.units || "",
    imageFile: null,
    imageUrl: distribution?.imageUrl || null,
    imageKey: distribution?.imageKey || null
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projects = useProjectStore((state) => state.projects);
  const [url, setUrl] = useState<SignedUrlResponse | null>(null); // For storing fetched signed URL
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageToBeRemovedKey, setImageToBeRemovedKey] = useState<string | null>(
    null
  );
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (isEdit && distribution?.imageUrl) {
      setImagePreviewUrl(distribution.imageUrl);
      setFormData((prev) => ({
        ...prev,
        imageUrl: distribution.imageUrl,
        imageKey: distribution.imageKey
      }));
    }
  }, [isEdit, distribution]);

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
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === "activityType" && value !== "Other") {
        newState.customActivityType = ""; // Clear custom field if "Other" is not selected
      }
      return newState;
    });
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "activityType" && formErrors.customActivityType) {
      setFormErrors((prev) => ({ ...prev, customActivityType: "" }));
    }
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
        // 5MB limit
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
      setImageToBeRemovedKey(null); // If a new file is chosen, we are not removing an *existing* one without replacement
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
        // Reset if fetching signed URL fails
        URL.revokeObjectURL(localPreviewUrl);
        setImagePreviewUrl(
          isEdit && distribution?.imageUrl ? distribution.imageUrl : null
        );
        setFormData((prev) => ({ ...prev, imageFile: null }));
        setUrl(null);
      } finally {
        // File processing complete
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

    // If it was an existing image from `distribution` prop, mark its key for deletion on save
    if (isEdit && distribution?.imageKey) {
      setImageToBeRemovedKey(distribution.imageKey);
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
    if (
      formData.activityType === "Other" &&
      !formData.customActivityType?.trim()
    ) {
      setFormErrors((prev) => ({
        ...prev,
        customActivityType:
          "Custom activity type is required when 'Other' is selected."
      }));
      toast.error("Validation Error", {
        description: "Custom activity type is required."
      });
      return false;
    }

    const finalActivityType =
      formData.activityType === "Other" && formData.customActivityType?.trim()
        ? formData.customActivityType.trim()
        : formData.activityType;

    const dataToValidate = {
      ...formData,
      activityType: finalActivityType, // Use the potentially custom activity type for validation
      target: formData.target ? Number.parseInt(formData.target) : undefined,
      achieved: formData.achieved
        ? Number.parseInt(formData.achieved)
        : undefined,
      imageUrl: formData.imageFile ? null : formData.imageUrl, // If new file, URL is not yet set from cloud
      imageKey: formData.imageFile ? null : formData.imageKey
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imageFile, customActivityType, ...restToValidate } = dataToValidate; // Exclude customActivityType from Zod schema check if it's handled separately

    try {
      if (isEdit) {
        updateInputDistributionValidation.parse(restToValidate);
      } else {
        createInputDistributionValidation.parse(restToValidate);
      }

      // If we reach here, validation passed
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
    // Check if currently submitting
    if (isSubmitting === true) return true;

    // Check if currently processing file
    if (isProcessingFile === true) return true;

    // Check if file is selected but signed URL is not ready
    if (formData.imageFile && (!url || !url.signedUrl)) return true;

    return false;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    let finalImageUrl: string | null = distribution?.imageUrl || null;
    let finalImageKey: string | null = distribution?.imageKey || null;

    try {
      // 1. Handle removal of an existing image
      if (imageToBeRemovedKey) {
        // Add a small delay before deletion
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
        // Handle replacement scenario (edit mode with existing image)
        if (
          isEdit &&
          distribution?.imageKey &&
          !imageToBeRemovedKey && // Only if we haven't already handled deletion above
          formData.imageFile
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const oldKeyDeleted = await deleteFileFromCloudflare(
            distribution.imageKey
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
      const dataToSave: InputDistributionFormData = {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <SelectItem key={proj.id} value={proj.id}>
                  {proj.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.projectId && (
            <p className="text-red-500 text-sm mt-1">{formErrors.projectId}</p>
          )}
        </div>
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
          <Label htmlFor="name">
            Name/Description <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g., High Yield Rice Seeds"
            value={formData.name}
            onChange={handleInputChange}
            className={formErrors.name ? "border-red-500" : ""}
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>
        <div>
          <Label htmlFor="activityType">
            Activity Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.activityType}
            onValueChange={(value) => handleSelectChange("activityType", value)}
          >
            <SelectTrigger
              id="activityType"
              className={formErrors.activityType ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {PREDEFINED_ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.activityType && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.activityType}
            </p>
          )}
        </div>

        {formData.activityType === "Other" && (
          <div className="md:col-span-2">
            {" "}
            {/* Adjust span if needed */}
            <Label htmlFor="customActivityType">
              Custom Activity Type <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customActivityType"
              name="customActivityType"
              placeholder="Enter custom activity type"
              value={formData.customActivityType || ""}
              onChange={handleInputChange}
              className={formErrors.customActivityType ? "border-red-500" : ""}
            />
            {formErrors.customActivityType && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.customActivityType}
              </p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="target">Target</Label>
          <Input
            id="target"
            name="target"
            type="number"
            placeholder="Enter target number (optional)"
            value={formData.target}
            onChange={handleInputChange}
            className={formErrors.target ? "border-red-500" : ""}
            min="0"
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
            placeholder="Enter achieved number (optional)"
            value={formData.achieved}
            onChange={handleInputChange}
            className={formErrors.achieved ? "border-red-500" : ""}
            min="0"
          />
          {formErrors.achieved && (
            <p className="text-red-500 text-sm mt-1">{formErrors.achieved}</p>
          )}
        </div>
      </div>

      {/* Target Sentence and Achieved Sentence Array Inputs */}
      <div className="grid grid-cols-1 gap-4">
        <ArrayInputManager
          label="Target Points"
          items={formData.targetSentence}
          setItems={(items) =>
            setFormData((p) => ({ ...p, targetSentence: items }))
          }
          placeholder="Add a target point"
          error={formErrors.targetSentence}
        />

        <ArrayInputManager
          label="Achievement Points"
          items={formData.achievedSentence}
          setItems={(items) =>
            setFormData((p) => ({ ...p, achievedSentence: items }))
          }
          placeholder="Add an achievement point"
          error={formErrors.achievedSentence}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="units">Units</Label>
          <Input
            id="units"
            name="units"
            placeholder="e.g., kg, bags, packets"
            value={formData.units || ""}
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
        <Label htmlFor="imageFile">Input Distribution Image</Label>
        <div
          className={`mt-3 p-4 border-2 ${
            formErrors.imageFile ? "border-red-500" : "border-gray-300"
          } border-dashed rounded-md`}
        >
          {imagePreviewUrl ? (
            // Image Preview and Remove Button
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
                  onError={() => setIsImageLoading(false)} // in case image fails
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
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
          {/* Hidden file input, triggered by button/placeholder click */}
          <Input
            id="imageFile"
            name="imageFile"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden" // Visually hidden, functionality triggered by ref
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
