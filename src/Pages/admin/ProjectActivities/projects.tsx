import { useEffect, useState } from "react";
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
  FileText,
  Plus,
  Search,
  Calendar,
  Eye,
  Edit,
  Delete
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  createProjectValidation,
  updateProjectValidation
} from "@/lib/validations/project";
import axios, { AxiosError } from "axios";
import { Base_Url } from "@/lib/constants";
import { useProjectStore } from "@/stores/useProjectStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router-dom";

// TypeScript interfaces
interface Project {
  id: string;
  implementingAgency: string;
  title: string;
  locationState: string;
  director: string;
  budget: number;
  status: "Active" | "Completed";
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface ProjectFormData {
  implementingAgency: string;
  title: string;
  locationState: string;
  director: string;
  budget: number | null;
  status: string;
  startDate: string;
  endDate: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ProjectFormProps {
  project?: Project;
  onSave: (data: ProjectFormData, projectId?: string) => Promise<boolean>;
  onClose: () => void;
  isEdit?: boolean;
}

interface ProjectViewProps {
  project: Project;
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

// Mock data for demonstration

function ProjectForm({
  project,
  onSave,
  onClose,
  isEdit = false
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    implementingAgency: project?.implementingAgency || "",
    title: project?.title || "",
    locationState: project?.locationState || "",
    director: project?.director || "",
    budget:
      project?.budget !== undefined && project?.budget !== null
        ? Number(project.budget)
        : null,
    status: project?.status || "",
    startDate: project?.startDate || "",
    endDate: project?.endDate || ""
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsed = parseFloat(value);

    setFormData((prev) => ({
      ...prev,
      budget: isNaN(parsed) ? null : parsed
    }));

    if (formErrors.budget) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.budget;
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
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
      const dataToValidate = {
        implementingAgency: formData.implementingAgency,
        title: formData.title,
        locationState: formData.locationState,
        director: formData.director,
        budget:
          formData.budget === null || formData.budget === 0
            ? undefined
            : formData.budget,
        status: formData.status,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      };

      if (isEdit) {
        updateProjectValidation.parse(dataToValidate);
      } else {
        createProjectValidation.parse(dataToValidate);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form before submitting."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onSave(formData, project?.id);
      if (success) {
        onClose();
      }
    } catch {
      toast.error("Error", {
        description: "Failed to save project. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="implementingAgency">
          Implementing Agency <span className="text-red-500">*</span>
        </Label>
        <Input
          id="implementingAgency"
          name="implementingAgency"
          placeholder="Enter implementing agency name"
          value={formData.implementingAgency}
          onChange={handleInputChange}
          className={formErrors.implementingAgency ? "border-red-500" : ""}
          required
        />
        {formErrors.implementingAgency && (
          <p className="text-red-500 text-sm mt-1">
            {formErrors.implementingAgency}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="title">
          Project Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter project title (max 40 characters)"
          maxLength={40}
          value={formData.title}
          onChange={handleInputChange}
          className={formErrors.title ? "border-red-500" : ""}
          required
        />
        {formErrors.title && (
          <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>
            Location State <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.locationState}
            onValueChange={(value) =>
              handleSelectChange("locationState", value)
            }
          >
            <SelectTrigger
              className={formErrors.locationState ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Assam">Assam</SelectItem>
              <SelectItem value="Meghalaya">Meghalaya</SelectItem>
              <SelectItem value="Manipur">Manipur</SelectItem>
              <SelectItem value="Sikkim">Sikkim</SelectItem>
              <SelectItem value="Tripura">Tripura</SelectItem>
              <SelectItem value="Mizoram">Mizoram</SelectItem>
              <SelectItem value="Nagaland">Nagaland</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.locationState && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.locationState}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="director">
            Director <span className="text-red-500">*</span>
          </Label>
          <Input
            id="director"
            name="director"
            placeholder="Enter director name"
            value={formData.director}
            onChange={handleInputChange}
            className={formErrors.director ? "border-red-500" : ""}
            required
          />
          {formErrors.director && (
            <p className="text-red-500 text-sm mt-1">{formErrors.director}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget">Budget (₹)</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            step="0.01"
            placeholder="Enter budget amount"
            value={formData.budget ?? ""}
            onChange={handleBudgetChange}
            className={formErrors.budget ? "border-red-500" : ""}
          />
          {formErrors.budget && (
            <p className="text-red-500 text-sm mt-1">{formErrors.budget}</p>
          )}
        </div>
        <div>
          <Label>
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger
              className={formErrors.status ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          {formErrors.status && (
            <p className="text-red-500 text-sm mt-1">{formErrors.status}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={
              project?.startDate
                ? new Date(project.startDate).toISOString().split("T")[0]
                : ""
            }
            onChange={handleInputChange}
            className={formErrors.startDate ? "border-red-500" : ""}
          />
          {formErrors.startDate && (
            <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>
          )}
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={
              project?.endDate
                ? new Date(project.endDate).toISOString().split("T")[0]
                : ""
            }
            onChange={handleInputChange}
            className={formErrors.endDate ? "border-red-500" : ""}
          />
          {formErrors.endDate && (
            <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>
          )}
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
            ? "Update Project"
            : "Save Project"}
        </Button>
      </div>
    </form>
  );
}

function ProjectView({ project }: ProjectViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Project Title
          </Label>
          <p className="text-lg font-semibold">{project.title}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Status</Label>
          <Badge
            className={`mt-1 ${
              project.status === "Completed"
                ? "bg-green-500 text-white"
                : "text-black bg-white border border-gray-300"
            }`}
          >
            {project.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Implementing Agency
          </Label>
          <p>{project.implementingAgency}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Project Director
          </Label>
          <p>{project.director}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Location State
          </Label>
          <p>{project.locationState}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Budget</Label>
          <p className="text-lg font-semibold text-green-600">
            ₹{project.budget.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Start Date
          </Label>
          <p>
            {new Date(project.startDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">End Date</Label>
          <p>
            {new Date(project.endDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}
          </p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500">Created At</Label>
        <p>{new Date(project.createdAt).toLocaleDateString("en-IN")}</p>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("");
  const { fetchProjects, projects } = useProjectStore();
  const [existingProjects, setProjects] = useState<Project[]>(projects);
  const logOut = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      if (!projects || projects.length === 0) {
        setIsLoading(true);
        try {
          await fetchProjects();
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array

  useEffect(() => {
    setProjects(projects || []);
  }, [projects]);

  // Filter projects based on search and filter criteria
  const filteredProjects: Project[] = existingProjects.filter(
    (project: Project) => {
      const matchesSearch: boolean =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.implementingAgency
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus: boolean =
        !selectedStatus ||
        selectedStatus === "all" ||
        project.status === selectedStatus;
      const matchesState: boolean =
        !selectedState ||
        selectedState === "all" ||
        project.locationState === selectedState;
      const matchesAgency: boolean =
        !selectedAgency ||
        selectedAgency === "all" ||
        project.implementingAgency === selectedAgency;

      return matchesSearch && matchesStatus && matchesState && matchesAgency;
    }
  );

  const uniqueAgencies = Array.from(
    new Set(projects.map((project) => project.implementingAgency))
  );
  const uniqueStates = Array.from(
    new Set(projects.map((project) => project.locationState))
  );

  const handleView = (project: Project): void => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (project: Project): void => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };
  const handleDelete = (project: Project): void => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (
    formData: ProjectFormData,
    operation: "create" | "update" = "create",
    projectId?: string
  ): Promise<boolean> => {
    // Input validation
    if (operation === "update" && !projectId) {
      toast.error("Project ID is required for update operation");
      return false;
    }

    // Validate required fields
    if (!formData.title?.trim()) {
      toast.error("Project title is required");
      return false;
    }

    if (!formData.implementingAgency?.trim()) {
      toast.error("Implementing agency is required");
      return false;
    }

    // Show loading toast
    const loadingToast = toast.loading(
      `${operation === "create" ? "Creating" : "Updating"} project...`
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

      if (operation === "create") {
        response = await axios.post(
          `${Base_Url}/create-project`,
          formData,
          config
        );
      } else {
        response = await axios.put(
          `${Base_Url}/update-project/${projectId}`,
          formData,
          config
        );
      }

      // Handle successful response
      if (response?.status === 201 || response?.status === 200) {
        const data = response.data as ApiSuccessResponse;
        fetchProjects();
        toast.success(data.message || `Project ${operation}d successfully`, {
          description: `${data.data.title} - ${data.data.status}`,
          duration: 6000
        });

        console.log(`Project ${operation}d successfully:`, data.data);

        // Update local state
        if (operation === "create") {
          const newProject: Project = {
            id: data.data.id,
            implementingAgency: formData.implementingAgency,
            title: formData.title,
            locationState: formData.locationState,
            director: formData.director,
            budget: formData.budget || 0,
            status: formData.status as "Active" | "Completed",
            startDate: formData.startDate,
            endDate: formData.endDate,
            createdAt: new Date().toISOString()
          };
          setProjects((prev) => [newProject, ...prev]);
        } else if (operation === "update" && projectId) {
          setProjects((prev) =>
            prev.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    implementingAgency: formData.implementingAgency,
                    title: formData.title,
                    locationState: formData.locationState,
                    director: formData.director,
                    budget: formData.budget || 0,
                    status: formData.status as "Active" | "Completed",
                    startDate: formData.startDate,
                    endDate: formData.endDate
                  }
                : p
            )
          );
        }

        // Close dialogs on success
        setIsDialogOpen(false);
        setIsEditDialogOpen(false);

        return true;
      }

      // Handle unexpected success status codes
      toast.error(`Unexpected response status: ${response?.status}`);
      return false;
    } catch (error) {
      console.error(`Error ${operation}ing project:`, error);

      // REAL error handling for production
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        if (axiosError.response) {
          // Server responded with error status
          const { status, data } = axiosError.response;

          switch (status) {
            case 400:
              // Validation errors
              if (data?.code === "VALIDATION_ERROR" && data.errors) {
                toast.error("Validation Error", {
                  description: "Please check your input and try again",
                  duration: 5000
                });

                // Log specific validation errors for debugging
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
              toast.error("Project Not Found", {
                description:
                  "The project you're trying to update doesn't exist",
                duration: 5000
              });
              break;

            case 409:
              toast.error("Duplicate Project", {
                description:
                  data?.message || "A project with this title already exists",
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

  const handleDeleteProject = async () => {
    if (!selectedProject) {
      toast.error("No project selected", {
        description: "Please select a project to delete"
      });
      return;
    }

    const loadingToast = toast.loading(
      `Deleting "${selectedProject.title}"...`
    );

    try {
      const response = await axios.delete(
        `${Base_Url}/delete-project/${selectedProject.id}`,
        {
          withCredentials: true,
          timeout: 30000
        }
      );

      if (response.status === 200 && response.data.success) {
        const { relatedRecordsDeleted = 0 } = response.data.data;

        toast.success("Project deleted", {
          description:
            relatedRecordsDeleted > 0
              ? `"${
                  selectedProject.title
                }" and ${relatedRecordsDeleted} related record${
                  relatedRecordsDeleted !== 1 ? "s" : ""
                } deleted`
              : `"${selectedProject.title}" deleted successfully`,
          duration: 5000
        });
        fetchProjects();
        setSelectedProject(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Deletion failed", {
          description:
            response.data?.message || "Project deletion was not completed"
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
            title: "Project not found",
            fallback: "Project may already be deleted"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Project Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage agricultural development projects
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>
                  Create a new agricultural development project
                </DialogDescription>
              </DialogHeader>
              <ProjectForm
                onSave={(formData) => handleSave(formData, "create")}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-4.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {uniqueStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Agency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  {uniqueAgencies.map((agency) => (
                    <SelectItem key={agency} value={agency}>
                      {agency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              List of all agricultural development projects
              {filteredProjects.length !== projects.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredProjects.length} of {projects.length} shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead>Implementing Agency</TableHead>
                  <TableHead>Director</TableHead>
                  <TableHead>Location State</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <p className="text-gray-500">Loading projects...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No projects found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project: Project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.title}
                      </TableCell>
                      <TableCell className="text-sm">
                        {project.implementingAgency}
                      </TableCell>
                      <TableCell>{project.director}</TableCell>
                      <TableCell>{project.locationState}</TableCell>
                      <TableCell>₹ {project.budget.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(project.startDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              }
                            )}{" "}
                            to{" "}
                            {new Date(project.endDate).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                              }
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${
                            project.status === "Completed"
                              ? "bg-green-500 text-white"
                              : "bg-white text-black border border-gray-300"
                          }`}
                        >
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(project)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(project)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(project)}
                          >
                            <Delete className="h-3 w-3 mr-1 text-red-500" />
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

        {/* View Project Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Project Details</DialogTitle>
              <DialogDescription>
                View complete project information
              </DialogDescription>
            </DialogHeader>
            {selectedProject && <ProjectView project={selectedProject} />}
          </DialogContent>
        </Dialog>

        {/*Delete project Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-black">
                Confirm Project Deletion
              </DialogTitle>
              <DialogDescription>
                <span className="text-sm text-red-600 font-medium">
                  ⚠️ Note: All activities related to this project will also be
                  permanently deleted.
                </span>
                <br />
                <span className="block mt-2">
                  Are you sure you want to delete this project?
                </span>
                <span className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </span>
              </DialogDescription>
            </DialogHeader>

            {selectedProject && (
              <div className="grid gap-2 py-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Title : </span>
                  {selectedProject.title}
                </div>
                <div>
                  <span className="font-medium text-foreground">Agency : </span>
                  {selectedProject.implementingAgency}
                </div>
                <div>
                  <span className="font-medium text-foreground">Budget : </span>
                  ₹{selectedProject.budget.toLocaleString("en-IN")}
                </div>
                <div>
                  <span className="font-medium text-foreground">Status : </span>
                  {selectedProject.status}
                </div>
                <div>
                  <span className="font-medium text-foreground">
                    Duration :{" "}
                  </span>
                  {new Date(selectedProject.startDate).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    }
                  )}{" "}
                  →{" "}
                  {new Date(selectedProject.endDate).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    }
                  )}
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
                  handleDeleteProject();
                }}
                disabled={isLoading}
                className="cursor-pointer"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Project Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update project information</DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <ProjectForm
                project={selectedProject}
                onSave={(formData, projectId) =>
                  handleSave(formData, "update", projectId)
                }
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
