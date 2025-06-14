import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { Base_Url } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import EnhancedShimmerTableRows from "@/components/shimmer-rows";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  PlusCircle,
  AlertCircle
} from "lucide-react";

import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

// Create Project Details Validation
const createProjectDetailsValidation = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(300, { message: "Title cannot exceed 100 characters" }),
  region: z
    .string()
    .trim()
    .refine((val) => val === "NEH" || val === "AICRP", {
      message: "Region must be either 'NEH' or 'AICRP'"
    }),
  year: z
    .number()
    .int({ message: "Year must be a valid integer" })
    .min(1950, { message: "Year must be at least 1950" })
    .max(new Date().getFullYear() + 5, { message: "Year seems unrealistic" }), // Corrected max year
  budget: z
    .number()
    .positive({ message: "Budget must be a positive number" })
    .optional()
    .nullable(),
  center: z
    .string()
    .trim()
    .min(2, { message: "Center must be at least 2 characters" })
    .max(300, { message: "Center cannot exceed 100 characters" })
    .optional()
    .nullable(),
  location: z
    .string()
    .trim()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(200, { message: "Location cannot exceed 100 characters" })
    .optional()
    .nullable(),
  objectives: z
    .array(z.string().trim().min(1, { message: "Objective cannot be empty" }))
    .min(1, { message: "At least one objective is required" })
    .max(20, { message: "Cannot have more than 20 objectives" }),
  director: z
    .string()
    .trim()
    .min(2, { message: "Director name must be at least 2 characters" })
    .max(100, { message: "Director name cannot exceed 100 characters" }),
  coDirectors: z
    .array(
      z.string().trim().min(1, { message: "Co-director name cannot be empty" })
    )
    .max(10, { message: "Cannot have more than 10 co-directors" })
    .optional(), // Making optional as per schema
  achievements: z
    .array(z.string().trim().min(1, { message: "Achievement cannot be empty" }))
    .max(50, { message: "Cannot have more than 50 achievements" })
    .optional() // Making optional as per schema
});

// Update Project Details Validation
const updateProjectDetailsValidation = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(300, { message: "Title cannot exceed 100 characters" })
    .optional(),
  region: z
    .string()
    .trim()
    .refine((val) => val === "NEH" || val === "AICRP", {
      message: "Region must be either 'NEH' or 'AICRP'"
    })
    .optional(),
  year: z
    .number()
    .int({ message: "Year must be a valid integer" })
    .min(1950, { message: "Year must be at least 1950" })
    .max(new Date().getFullYear() + 5, { message: "Year seems unrealistic" }) // Corrected max year
    .optional(),
  budget: z
    .number()
    .positive({ message: "Budget must be a positive number" })
    .optional()
    .nullable(),
  center: z
    .string()
    .trim()
    .min(2, { message: "Center must be at least 2 characters" })
    .max(300, { message: "Center cannot exceed 100 characters" })
    .optional()
    .nullable(),
  location: z
    .string()
    .trim()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(200, { message: "Location cannot exceed 100 characters" })
    .optional()
    .nullable(),
  objectives: z
    .array(z.string().trim().min(1, { message: "Objective cannot be empty" }))
    .min(1, { message: "At least one objective is required" })
    .max(20, { message: "Cannot have more than 20 objectives" })
    .optional(),
  director: z
    .string()
    .trim()
    .min(2, { message: "Director name must be at least 2 characters" })
    .max(100, { message: "Director name cannot exceed 100 characters" })
    .optional(),
  coDirectors: z
    .array(
      z.string().trim().min(1, { message: "Co-director name cannot be empty" })
    )
    .max(10, { message: "Cannot have more than 10 co-directors" })
    .optional(),
  achievements: z
    .array(z.string().trim().min(1, { message: "Achievement cannot be empty" }))
    .max(50, { message: "Cannot have more than 50 achievements" })
    .optional()
});

// Interfaces based on Schema and API response
interface RawProjectDetails {
  id: string;
  title: string;
  region: string;
  year: number;
  budget: number | null;
  center: string | null;
  location: string | null;
  objectives: string[];
  director: string;
  coDirectors: string[];
  achievements: string[];
  createdAt: string;
  updatedAt: string;
  User?: {
    id: string;
    name: string;
  };
}

// Frontend-specific interface
type ProjectDetails = RawProjectDetails;

// Form data interface
interface ProjectDetailsFormData {
  title: string;
  region: string;
  year: string;
  budget: string;
  center: string;
  location: string;
  objectives: string[];
  director: string;
  coDirectors: string[];
  achievements: string[];
}

type FormErrors = { [key: string]: string | { [key: number]: string } };

// Props for sub-components
interface ProjectDetailFormProps {
  project?: ProjectDetails;
  onSave: (data: ProjectDetailsFormData) => Promise<boolean>;
  onClose: () => void;
  isEdit?: boolean;
}

interface ProjectDetailViewProps {
  project: ProjectDetails;
}

export default function ProjectDetailsAdPage() {
  const [projects, setProjects] = useState<ProjectDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);

  // Filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  const user = useAuthStore((state) => state.user);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint =
        user?.role === "admin"
          ? "/get-all-project-details"
          : "/get-user-project-details";
      const response = await axios.get(`${Base_Url}${endpoint}`, {
        withCredentials: true
      });
      if (response.data.success) {
        setProjects(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch projects.");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast.error("Fetch Failed", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleOpenFormDialog = (project?: ProjectDetails) => {
    if (project) {
      setSelectedProject(project);
      setIsEditMode(true);
    } else {
      setSelectedProject(null);
      setIsEditMode(false);
    }
    setIsFormDialogOpen(true);
  };

  const handleOpenViewDialog = (project: ProjectDetails) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (project: ProjectDetails) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveProject = async (
    data: ProjectDetailsFormData
  ): Promise<boolean> => {
    const loadingToast = toast.loading(
      isEditMode ? "Updating project..." : "Creating project..."
    );

    try {
      const requestData = {
        ...data,
        year: Number(data.year),
        budget: data.budget ? Number(data.budget) : null
      };

      const response = isEditMode
        ? await axios.put(
            `${Base_Url}/update-project-details/${selectedProject?.id}`,
            requestData,
            {
              withCredentials: true
            }
          )
        : await axios.post(`${Base_Url}/add-project-details`, requestData, {
            withCredentials: true
          });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchProjectDetails(); // Refresh data
        setIsFormDialogOpen(false);
        return true;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        (err instanceof Error ? err.message : "An unknown error occurred.");
      toast.error(isEditMode ? "Update Failed" : "Creation Failed", {
        description: errorMessage
      });
      return false;
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    const loadingToast = toast.loading("Deleting project...");
    try {
      const response = await axios.delete(
        `${Base_Url}/delete-project-details/${selectedProject.id}`,
        {
          withCredentials: true
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchProjectDetails(); // Refresh data
        setIsDeleteDialogOpen(false);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        (err instanceof Error ? err.message : "An unknown error occurred.");
      toast.error("Deletion Failed", { description: errorMessage });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const searchMatch =
        searchTerm === "" ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.director.toLowerCase().includes(searchTerm.toLowerCase());
      const regionMatch =
        selectedRegion === "all" || p.region === selectedRegion;
      const yearMatch =
        selectedYear === "all" || p.year === Number(selectedYear);
      return searchMatch && regionMatch && yearMatch;
    });
  }, [projects, searchTerm, selectedRegion, selectedYear]);

  const uniqueYears = useMemo(
    () => [...new Set(projects.map((p) => p.year))].sort((a, b) => b - a),
    [projects]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Project Details
              </h1>
              <p className="text-sm text-gray-600">
                Manage detailed information for all agricultural projects.
              </p>
            </div>
          </div>
          <Button
            onClick={() => handleOpenFormDialog()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </header>

      {/* Add this block to display page-level errors */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-4.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title or director..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="NEH">NEH</SelectItem>
                <SelectItem value="AICRP">AICRP</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {uniqueYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects List</CardTitle>
          <CardDescription>
            A list of all registered projects in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border">
                <TableHead>Title</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Director</TableHead>
                <TableHead>Co-Directors</TableHead>
                <TableHead>Objectives</TableHead>
                {user?.role === "admin" && <TableHead>Created By</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <EnhancedShimmerTableRows />
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                      {project.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.region}</Badge>
                    </TableCell>
                    <TableCell>{project.year}</TableCell>
                    <TableCell className="truncate max-w-[150px] whitespace-nowrap overflow-hidden">
                      {project.director}
                    </TableCell>
                    <TableCell>{project.coDirectors.length}</TableCell>
                    <TableCell>{project.objectives.length}</TableCell>
                    {user?.role === "admin" && (
                      <TableCell>{project.User?.name || "N/A"}</TableCell>
                    )}
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenViewDialog(project)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenFormDialog(project)}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDeleteDialog(project)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Project Details" : "Add New Project"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the details for this project."
                : "Fill in the form to add a new project."}
            </DialogDescription>
          </DialogHeader>
          <ProjectDetailForm
            isEdit={isEditMode}
            project={selectedProject ?? undefined}
            onSave={handleSaveProject}
            onClose={() => setIsFormDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="tracking-wider leading-6 text-zinc-800">
              {selectedProject?.title}
            </DialogTitle>
            <DialogDescription>Detailed view of the project.</DialogDescription>
          </DialogHeader>
          {selectedProject && <ProjectDetailView project={selectedProject} />}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the project "
              <strong>{selectedProject?.title}</strong>"? This action cannot be
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
            <Button variant="destructive" onClick={handleDeleteProject}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reusable component for managing array inputs in the form
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
  error?: string | { [key: number]: string };
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
      <div className="flex flex-col items-end  border-red-500 space-y-2 mt-1">
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

function ProjectDetailForm({
  project,
  onSave,
  onClose,
  isEdit = false
}: ProjectDetailFormProps) {
  const [formData, setFormData] = useState<ProjectDetailsFormData>({
    title: project?.title || "",
    region: project?.region || "",
    year: project?.year?.toString() || "",
    budget: project?.budget?.toString() || "",
    center: project?.center || "",
    location: project?.location || "",
    objectives: project?.objectives || [],
    director: project?.director || "",
    coDirectors: project?.coDirectors || [],
    achievements: project?.achievements || []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (
    name: keyof ProjectDetailsFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const dataToValidate = {
      ...formData,
      year: formData.year ? Number(formData.year) : undefined,
      budget: formData.budget ? Number(formData.budget) : undefined,
      // Filter out empty strings from arrays before validation
      objectives: formData.objectives.filter((s) => s.trim() !== ""),
      coDirectors: formData.coDirectors.filter((s) => s.trim() !== ""),
      achievements: formData.achievements.filter((s) => s.trim() !== "")
    };

    const validationSchema = isEdit
      ? updateProjectDetailsValidation
      : createProjectDetailsValidation;
    const result = validationSchema.safeParse(dataToValidate);

    if (!result.success) {
      const newErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const path = err.path.join(".");
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      toast.error("Validation Failed", {
        description: "Please check the form for errors."
      });
      setIsSubmitting(false);
      return;
    }

    const success = await onSave(formData);
    if (success) {
      onClose();
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">
              {errors.title as string}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="director">Project Director</Label>
          <Input
            id="director"
            name="director"
            value={formData.director}
            onChange={handleInputChange}
          />
          {errors.director && (
            <p className="text-red-500 text-sm mt-1">
              {errors.director as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <Select
            value={formData.region}
            onValueChange={(value) => handleSelectChange("region", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEH">NEH</SelectItem>
              <SelectItem value="AICRP">AICRP</SelectItem>
            </SelectContent>
          </Select>
          {errors.region && (
            <p className="text-red-500 text-sm mt-1">
              {errors.region as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            value={formData.year}
            onChange={handleInputChange}
          />
          {errors.year && (
            <p className="text-red-500 text-sm mt-1">{errors.year as string}</p>
          )}
        </div>
        <div>
          <Label htmlFor="budget">Budget (Optional)</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleInputChange}
          />
          {errors.budget && (
            <p className="text-red-500 text-sm mt-1">
              {errors.budget as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="location">Location (Optional)</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">
              {errors.location as string}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="center">Center (Optional)</Label>
          <Input
            id="center"
            name="center"
            value={formData.center}
            onChange={handleInputChange}
          />
          {errors.center && (
            <p className="text-red-500 text-sm mt-1">
              {errors.center as string}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <ArrayInputManager
          label="Objectives"
          items={formData.objectives}
          setItems={(items) =>
            setFormData((p) => ({ ...p, objectives: items }))
          }
          placeholder="Add an objective"
          error={errors.objectives as string}
        />
        <ArrayInputManager
          label="Co-Directors"
          items={formData.coDirectors}
          setItems={(items) =>
            setFormData((p) => ({ ...p, coDirectors: items }))
          }
          placeholder="Add a co-director"
          error={errors.coDirectors as string}
        />
        <ArrayInputManager
          label="Achievements"
          items={formData.achievements}
          setItems={(items) =>
            setFormData((p) => ({ ...p, achievements: items }))
          }
          placeholder="Add an achievement"
          error={errors.achievements as string}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Project"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ProjectDetailView({ project }: ProjectDetailViewProps) {
  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Top section for core details */}
      <div className="pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-x-6 gap-y-5 text-sm">
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wider">
              Region
            </Label>
            <p className="font-medium text-gray-700 mt-0.5">{project.region}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wider">
              Year
            </Label>
            <p className="font-medium text-gray-700 mt-0.5">{project.year}</p>
          </div>
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wider">
              Budget
            </Label>
            <p className="font-medium text-gray-700 mt-0.5">
              {project.budget
                ? `₹${project.budget.toLocaleString("en-IN")}`
                : "N/A"}
            </p>
          </div>
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wider">
              Location
            </Label>
            <p className="font-medium text-gray-700 mt-0.5">
              {project.location || "N/A"}
            </p>
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-500 uppercase tracking-wider">
            Center
          </Label>
          <p className="font-medium text-gray-700 mt-0.5">
            {project.center || "N/A"}
          </p>
        </div>
      </div>

      {/* Project Team Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Project Team
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">
              Project Director
            </Label>
            <p className="text-gray-800 mt-1">{project.director}</p>
          </div>
          {project.coDirectors && project.coDirectors.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Co-Project Directors
              </Label>
              <ul className="list-disc list-inside space-y-1 pl-2 mt-1">
                {project.coDirectors.map((coDirector, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    {coDirector}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Objectives Section */}
      {project.objectives && project.objectives.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Objectives
          </h3>
          <ul className="space-y-3">
            {project.objectives.map((objective, index) => (
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

      {/* Achievements Section */}
      {project.achievements && project.achievements.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Salient Achievements
          </h3>
          <ul className="space-y-3">
            {project.achievements.map((achievement, index) => (
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

      {/* User and Timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
        <div>
          <Label className="flex items-center">
            Created At{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>
          <p className="tracking-wider mt-2">
            {new Date(project.createdAt).toLocaleString()}
          </p>
        </div>
        <div>
          <Label className="flex items-center">
            Last Updated{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>
          <p className="tracking-wider mt-2">
            {new Date(project.updatedAt).toLocaleString()}
          </p>
        </div>
        {project.User && (
          <div>
            <Label>Created/Managed By</Label>
            <p className="tracking-wider mt-2">{project.User.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
