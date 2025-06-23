import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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
  BarChart3,
  Plus,
  Search,
  Eye,
  Edit,
  UserRound,
  Trash2,
  Loader2,
  UploadCloud,
  ImageIcon,
  FileText,
  Settings
} from "lucide-react";
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
import { useActivityCategoriesStore } from "@/stores/useActivityCategoryStore";

// Base validation schema
const baseActivitySchema = z.object({
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
});

// Create activity validation with refinements
const createActivityValidation = baseActivitySchema.refine(
  (data) => {
    return data.achieved <= data.target;
  },
  {
    message: "Achieved count cannot exceed target count",
    path: ["achieved"]
  }
);

// Update activity validation
const updateActivityValidation = z
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

interface RawActivity {
  id: string;
  activityId: string;
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

interface Activity {
  id: string;
  activityId: string;
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

interface ActivityFormData {
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

interface ActivityFormProps {
  activity?: Activity;
  onSave: (data: ActivityFormData) => Promise<boolean>;
  onClose: () => void;
  isEdit?: boolean;
  activityCategoryId: string;
}

interface ActivityViewProps {
  activity: Activity;
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
  data: Activity;
  code: string;
}

export default function ActivityPage() {
  const { activityCategoryId } = useParams<{ activityCategoryId: string }>();
  const [activities, setActivities] = useState<Activity[]>([]);
  //   const [activityCategory, setActivityCategory] =
  //     useState<ActivityCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategorySettingsOpen, setIsCategorySettingsOpen] = useState(false);
  const [isCategoryDeleteDialogOpen, setIsCategoryDeleteDialogOpen] =
    useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  //   const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const projects = useProjectStore((state) => state.projects);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const userRole = useAuthStore((state) => state.user);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { isLoading, getCategoryById, updateCategory, deleteCategory } =
    useActivityCategoriesStore();
  // Get current category
  const activityCategory = getCategoryById(activityCategoryId || "");

  // Set category name when category is loaded
  useEffect(() => {
    if (activityCategory) {
      setCategoryName(activityCategory.name);
    }
  }, [activityCategory]);

  // Fetch activities data
  const fetchActivities = async () => {
    try {
      setActivities([]);
      setIsLoadingData(true);
      const endpoint =
        userRole?.role === "admin"
          ? "get-admin-activites"
          : "get-user-activites";
      const response = await axios.get(
        `${Base_Url}/${endpoint}/${activityCategoryId}`,
        {
          withCredentials: true
        }
      );

      const data = response.data;
      if (response.data.code === "UNAUTHORIZED") {
        toast.success("UNAUTHORIZED", {
          description: `${response.data.message}`
        });
        logout();
      } else if (response.data.code === "NO_ACTIVITY_FOUND") {
        toast.info("No Activities Found", {
          description: "No activity data available. Please add new data."
        });
        return;
      } else if (!data.success || response.status !== 200) {
        throw new Error(data.message || "Failed to fetch activities");
      }

      const mappedActivities: Activity[] = (data.data || []).map(
        (item: RawActivity) => ({
          id: item.id,
          activityId: item.activityId,
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
      setActivities(mappedActivities || []);
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
          description: "An unexpected error occurred while fetching activities"
        });
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (activityCategoryId) {
      fetchActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityCategoryId, userRole]);

  // Filter activities based on search and filter criteria
  const filteredActivities: Activity[] = activities.filter(
    (activity: Activity) => {
      const matchesSearch: boolean =
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.activityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.project.title.toLowerCase().includes(searchTerm.toLowerCase());

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

        matchesYearQuarter = matchingQuarterIds.includes(activity.quarter.id);
      }

      const matchesProject: boolean =
        !selectedProject ||
        selectedProject === "all" ||
        activity.project.title === selectedProject;

      const matchesDistrict: boolean =
        !selectedDistrict ||
        selectedDistrict === "all" ||
        activity.district === selectedDistrict;

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
    if (!activities || activities.length === 0) return [];
    return Array.from(new Set(activities.map((activity) => activity.district)));
  }, [activities]);

  const handleView = (activity: Activity): void => {
    setSelectedActivity(activity);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (activity: Activity): void => {
    setSelectedActivity(activity);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (activity: Activity): void => {
    setSelectedActivity(activity);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (
    formData: ActivityFormData,
    operation: "create" | "update" = "create",
    activityId?: string
  ): Promise<boolean> => {
    if (operation === "update" && !activityId) {
      toast.error("Activity ID is required for update operation");
      return false;
    }

    if (!formData.title?.trim()) {
      toast.error("Activity title is required");
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

    const loadingToast = toast.loading(
      `${operation === "create" ? "Creating" : "Updating"} activity...`
    );

    try {
      let response;
      const config = {
        withCredentials: true,
        timeout: 30000,
        headers: {
          "Content-Type": "application/json"
        }
      };

      const requestData = {
        activityCategoryId: activityCategoryId,
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
          `${Base_Url}/create-activity`,
          requestData,
          config
        );
      } else {
        response = await axios.put(
          `${Base_Url}/update-activity/${activityId}`,
          requestData,
          config
        );
      }

      if (response?.status === 201 || response?.status === 200) {
        const data = response.data as ApiSuccessResponse;

        toast.success(data.message || `Activity ${operation}d successfully`, {
          description: `${data.data.title}`,
          duration: 6000
        });

        if (operation === "create") {
          const newActivity: Activity = {
            id: data.data.id,
            activityId: data.data.activityId,
            title: data.data.title,
            project: {
              id: data.data.project.id,
              title: data.data.project.title
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
          setActivities((prev) => [newActivity, ...prev]);
        } else if (operation === "update" && activityId) {
          setActivities((prev) =>
            prev.map((a) =>
              a.id === activityId
                ? {
                    ...a,
                    title: data.data.title,
                    project: {
                      id: data.data.project.id,
                      title: data.data.project.title
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
                : a
            )
          );
        }

        setIsDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedActivity(null);

        return true;
      } else {
        toast.error(`Unexpected response status: ${response?.status}`);
        return false;
      }
    } catch (error) {
      console.error(`Error ${operation}ing activity:`, error);
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

  const handleDeleteActivity = async () => {
    if (!selectedActivity) {
      toast.error("No Activity selected", {
        description: "Please select an activity to delete"
      });
      return;
    }
    setIsDeleting(true);
    const loadingToast = toast.loading(
      `Deleting "${selectedActivity.title}"...`
    );

    try {
      const response = await axios.delete(
        `${Base_Url}/delete-activity/${selectedActivity.id}`,
        {
          withCredentials: true,
          timeout: 30000
        }
      );

      if (response.status === 200 && response.data.success) {
        if (response.data.warning) {
          toast.warning("Activity deleted with file issues", {
            description: `${selectedActivity.title} was removed from your account, but ${response.data.warning}`,
            duration: 6000
          });
        } else {
          toast.success("Activity deleted successfully", {
            description: `${selectedActivity.title} and all associated files have been deleted`,
            duration: 5000
          });
        }
        setActivities((prevActivities) =>
          prevActivities.filter(
            (activity) => activity.id !== selectedActivity.id
          )
        );
        setSelectedActivity(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Deletion failed", {
          description:
            response.data?.message || "Activity deletion was not completed"
        });
      }
    } catch (error: unknown) {
      console.error("Delete activity error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        const errorMap: Record<number, { title: string; fallback: string }> = {
          400: {
            title: "Invalid request",
            fallback: "The activity ID is invalid"
          },
          401: { title: "Authentication required", fallback: "Please sign in" },
          403: { title: "Access denied", fallback: "Permission denied" },
          404: {
            title: "Activity not found",
            fallback: "Activity may already be deleted"
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

  const handleUpdateCategoryName = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    const capitalizedName = categoryName
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    if (!activityCategoryId) {
      toast.error("Category ID is missing");
      return;
    }

    const success = await updateCategory(activityCategoryId, capitalizedName);
    if (success) {
      setIsCategorySettingsOpen(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!activityCategoryId) {
      toast.error("Category ID is missing");
      return;
    }

    const success = await deleteCategory(activityCategoryId);
    if (success) {
      navigate("/admin/dashboard");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  if (!activityCategoryId) {
    return <div>Invalid activity category ID</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activityCategory?.name || "Activity"} Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage activities and track beneficiaries
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Dialog
              open={isCategorySettingsOpen}
              onOpenChange={setIsCategorySettingsOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Category Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Activity Category Settings</DialogTitle>
                  <DialogDescription>
                    Update or delete this activity category
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">Category Name</Label>
                    <Input
                      id="categoryName"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      placeholder="Enter category name"
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsCategorySettingsOpen(false);
                        setIsCategoryDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Category
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCategorySettingsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateCategoryName}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Name"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Activity</DialogTitle>
                  <DialogDescription>
                    Create a new activity entry with target and achievement data
                  </DialogDescription>
                </DialogHeader>
                <ActivityForm
                  onSave={(formData) => handleSave(formData, "create")}
                  onClose={() => setIsDialogOpen(false)}
                  activityCategoryId={activityCategoryId}
                />
              </DialogContent>
            </Dialog>
          </div>
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
                  placeholder="Search activities..."
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
                  <SelectItem value="2">Q2</SelectItem>
                  <SelectItem value="3">Q3</SelectItem>
                  <SelectItem value="4">Q4</SelectItem>
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

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
            <CardDescription>
              List of all activities with target vs achievement tracking
              {filteredActivities.length !== activities.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredActivities.length} of {activities.length} shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Target/Achieved</TableHead>
                  {userRole?.role === "admin" && (
                    <TableHead>Created By</TableHead>
                  )}
                  <TableHead>Beneficiaries</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingData ? (
                  <EnhancedShimmerTableRows />
                ) : filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      No activities found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity: Activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">
                        {activity.activityId}
                      </TableCell>
                      <TableCell className="truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                        {activity.title}
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                        {activity.project.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {(() => {
                            const quarterInfo = quarterlyData.find(
                              (q) => q.id === activity.quarter.id
                            );
                            return quarterInfo
                              ? `Q${quarterInfo.number} ${quarterInfo.year}`
                              : "Unknown Quarter";
                          })()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                        {activity.district}, {activity.village}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {activity.achieved}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            /
                            <span className="text-gray-700">
                              {activity.target} {activity.units}
                            </span>
                          </span>
                        </div>
                      </TableCell>
                      {userRole?.role === "admin" && (
                        <TableCell>{activity.User?.name || "N/A"}</TableCell>
                      )}
                      <TableCell>
                        <div className="text-sm flex flex-col gap-y-1">
                          <Badge variant="outline">
                            <div className="w-16 flex gap-x-1">
                              <UserRound className="h-4 w-4 text-blue-500" />
                              M: {activity.beneficiaryMale}
                            </div>
                          </Badge>
                          <Badge variant="outline">
                            <div className="w-16 flex gap-x-1">
                              <UserRound className="h-4 w-4 text-pink-500" />
                              F: {activity.beneficiaryFemale}
                            </div>
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(activity)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(activity)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(activity)}
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

        {/* View Activity Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Activity Details</DialogTitle>
              <DialogDescription>
                View complete activity information
              </DialogDescription>
            </DialogHeader>
            {selectedActivity && <ActivityView activity={selectedActivity} />}
          </DialogContent>
        </Dialog>

        {/* Edit Activity Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Activity</DialogTitle>
              <DialogDescription>Update activity information</DialogDescription>
            </DialogHeader>
            {selectedActivity && (
              <ActivityForm
                activity={selectedActivity}
                onSave={(formData) =>
                  handleSave(formData, "update", selectedActivity.id)
                }
                onClose={() => setIsEditDialogOpen(false)}
                isEdit={true}
                activityCategoryId={activityCategoryId}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Activity Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-black">
                ⚠️ Confirm Activity Deletion
              </DialogTitle>
              <DialogDescription>
                <br />
                <span className="block mt-2">
                  Are you sure you want to delete this activity?
                </span>
                <span className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </span>
              </DialogDescription>
            </DialogHeader>

            {selectedActivity && (
              <div className="grid gap-2 py-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Title: </span>
                  {selectedActivity?.title}
                </div>
                <div>
                  <span className="font-medium text-foreground">Project: </span>
                  {selectedActivity?.project.title}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    District:{" "}
                  </span>
                  {selectedActivity?.district}
                </div>
                <div>
                  <span className="font-medium text-foreground">Village: </span>
                  {selectedActivity?.village}
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
                  handleDeleteActivity();
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

        {/* Delete Category Dialog */}
        <Dialog
          open={isCategoryDeleteDialogOpen}
          onOpenChange={setIsCategoryDeleteDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-black">
                ⚠️ Confirm Activity Category Deletion
              </DialogTitle>
              <DialogDescription>
                <br />
                <span className="block mt-2">
                  Are you sure you want to delete this Activity Category?
                </span>
                <span className="text-xs text-muted-foreground">
                  This action cannot be undone and will delete all activities in
                  this category.
                </span>
              </DialogDescription>
            </DialogHeader>

            {activityCategory && (
              <div className="grid gap-2 py-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">
                    Category Name:{" "}
                  </span>
                  {activityCategory.name}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Total Activities:{" "}
                  </span>
                  {activities.length}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCategoryDeleteDialogOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCategory}
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? (
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

function ActivityView({ activity }: ActivityViewProps) {
  const projects = useProjectStore((state) => state.projects);

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Activity ID
          </Label>
          <p className="text-md font-semibold">{activity.activityId}</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-500">
            Activity Title
          </Label>
          <p className="text-md">{activity.title}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          <p>
            {projects.find((p) => p.id === activity.project.id)?.title ||
              "Unknown project"}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <Badge variant="outline">
            Q
            {quarterlyData.find((q) => q.id === activity.quarter.id)?.number ||
              "Unknown"}{" "}
            {quarterlyData.find((q) => q.id === activity.quarter.id)?.year ||
              ""}
          </Badge>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">District</Label>
          <p>{activity.district}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Village</Label>
          <p>{activity.village}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Block</Label>
          <p>{activity.block}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Target</Label>
          <p className="text-lg font-semibold text-gray-600">
            {activity.target}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Achieved</Label>
          <p className="text-lg font-semibold text-green-600">
            {activity.achieved}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Units</Label>
          <p>{activity.units}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Male Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-blue-600">
            {activity.beneficiaryMale}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Female Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-pink-600">
            {activity.beneficiaryFemale}
          </p>
        </div>
      </div>
      <hr />
      {activity.remarks && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Remarks</Label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {activity.remarks}
          </p>
        </div>
      )}
      {activity.imageUrl && (
        <>
          <hr />
          <div>
            <Label>Image</Label>
            <div className="mt-2 border rounded-md overflow-hidden max-w-sm">
              <img
                src={activity.imageUrl || "/placeholder.svg"}
                alt={activity.imageUrl}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </>
      )}
      {(activity.imageUrl || activity.pdfUrl) && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-500">
            Attachments
          </Label>
          <div className="flex gap-4">
            {activity.pdfUrl && (
              <div className="flex items-center gap-2">
                <a
                  href={activity.pdfUrl}
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
            {new Date(activity.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <Label className="flex items-center">
            Last Updated{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>
          <p className="tracking-wider mt-2">
            {new Date(activity.updatedAt).toLocaleString()}
          </p>
        </div>
        {activity.User && (
          <div>
            <Label>Created/Managed By</Label>
            <p className="tracking-wider mt-2">{activity.User.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityForm({
  activity,
  onSave,
  onClose,
  isEdit = false
}: ActivityFormProps) {
  const [formData, setFormData] = useState<ActivityFormData>({
    title: activity?.title || "",
    projectId: activity?.project.id || "",
    quarterId: activity?.quarter.id || "",
    target: activity?.target?.toString() || "",
    achieved: activity?.achieved?.toString() || "",
    district: activity?.district || "",
    village: activity?.village || "",
    block: activity?.block || "",
    beneficiaryMale: activity?.beneficiaryMale?.toString() || "0",
    beneficiaryFemale: activity?.beneficiaryFemale?.toString() || "0",
    units: activity?.units || "",
    remarks: activity?.remarks || "",
    imageUrl: activity?.imageUrl || "",
    imageKey: activity?.imageKey || "",
    pdfUrl: activity?.pdfUrl || "",
    pdfKey: activity?.pdfKey || "",
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
    if (isEdit && activity?.imageUrl) {
      setImagePreviewUrl(activity.imageUrl);
      setFormData((prev) => ({
        ...prev,
        imageUrl: activity.imageUrl ?? null,
        imageKey: activity.imageKey ?? null
      }));
    }
    if (isEdit && activity?.pdfUrl) {
      setPdfPreviewInfo({
        name: activity.pdfUrl || "Activity.material.Pdf",
        size: 0
      });
      setFormData((prev) => ({
        ...prev,
        pdfUrl: activity.pdfUrl ?? null,
        pdfKey: activity.pdfKey ?? null
      }));
    }
  }, [isEdit, activity]);

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
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));

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
        isEdit && activity?.imageUrl ? activity.imageUrl : null
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

    if (isEdit && activity?.imageKey) {
      setImageToBeRemovedKey(activity.imageKey);
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

    if (isEdit && activity?.pdfKey) {
      setPdfToBeRemovedKey(activity.pdfKey);
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

      if (isEdit) {
        updateActivityValidation.parse(dataToValidate);
      } else {
        createActivityValidation.parse(dataToValidate);
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

    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form before submitting."
      });
      return;
    }

    setIsSubmitting(true);
    let finalImageUrl: string | null = activity?.imageUrl || null;
    let finalImageKey: string | null = activity?.imageKey || null;
    let finalPdfUrl: string | null = activity?.pdfUrl || null;
    let finalPdfKey: string | null = activity?.pdfKey || null;

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
          activity?.imageKey &&
          !imageToBeRemovedKey &&
          formData.imageFile
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const oldKeyDeleted = await deleteFileFromCloudflare(
            activity.imageKey
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
          activity?.pdfKey &&
          !pdfToBeRemovedKey &&
          formData.pdfFile
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const oldKeyDeleted = await deleteFileFromCloudflare(activity.pdfKey);
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

      const dataToSave: ActivityFormData = {
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
            Activity Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter activity title (max 255 characters)"
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
          <Label htmlFor="imageFile">Activity Image</Label>
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
                    alt="Activity preview"
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
          <Label htmlFor="pdfFile">Activity Materials (PDF)</Label>
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
            "Update Activity"
          ) : (
            "Save Activity"
          )}
        </Button>
      </div>
    </form>
  );
}
