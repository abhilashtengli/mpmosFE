"use client";

import type React from "react";
import { useState } from "react";
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
import { Users, Plus, Search, Eye, Edit, ImageIcon } from "lucide-react";

// Add these validation schemas (you'll need to create the validation file)
const baseAwarenessSchema = z.object({
  programId: z
    .string()
    .trim()
    .min(2, { message: "Program ID must be at least 2 characters" })
    .max(50, { message: "Program ID cannot exceed 50 characters" }),
  title: z
    .string()
    .trim()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(100, { message: "Title cannot exceed 100 characters" }),
  project: z.string().trim().min(1, { message: "Project is required" }),
  quarter: z.string().trim().min(1, { message: "Quarter is required" }),
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
  units: z.string().trim().min(1, { message: "Units are required" }),
  remarks: z
    .string()
    .trim()
    .max(300, { message: "Remarks cannot exceed 300 characters" })
    .optional()
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
    units: z.string().trim().optional().nullable()
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
  programId: string;
  title: string;
  project: string;
  quarter: string;
  target: number;
  achieved: number;
  district: string;
  village: string;
  block: string;
  beneficiaryMale: number;
  beneficiaryFemale: number;
  units: string;
  remarks: string;
  status: string;
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
  programId: string;
  title: string;
  project: string;
  quarter: string;
  target: string;
  achieved: string;
  district: string;
  village: string;
  block: string;
  beneficiaryMale: string;
  beneficiaryFemale: string;
  units: string;
  remarks: string;
  imageFile: File | null;
}

type FormErrors = {
  [key: string]: string;
};

// Mock awareness program data
const awarenessPrograms: AwarenessProgram[] = [
  {
    id: "1",
    programId: "AWR-2024-001",
    title: "Nutrition Awareness Campaign",
    project: "Sustainable Agriculture Initiative",
    quarter: "Q2 2024",
    target: 100,
    achieved: 85,
    district: "Guwahati",
    village: "Khanapara",
    block: "Dispur",
    beneficiaryMale: 45,
    beneficiaryFemale: 40,
    units: "Participants",
    remarks: "Successful awareness campaign on nutrition and health",
    status: "Completed"
  },
  {
    id: "2",
    programId: "AWR-2024-002",
    title: "Climate Change Awareness",
    project: "Water Management Project",
    quarter: "Q2 2024",
    target: 75,
    achieved: 70,
    district: "Jorhat",
    village: "Teok",
    block: "Jorhat",
    beneficiaryMale: 35,
    beneficiaryFemale: 35,
    units: "Participants",
    remarks: "Awareness program on climate change adaptation",
    status: "Completed"
  }
];

export default function AwarenessPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedAwareness, setSelectedAwareness] =
    useState<AwarenessProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  // Filter awareness programs based on search and filter criteria
  const filteredAwareness = awarenessPrograms.filter((awareness) => {
    const matchesSearch =
      awareness.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      awareness.programId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      awareness.project.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQuarter =
      !selectedQuarter ||
      selectedQuarter === "all" ||
      awareness.quarter === selectedQuarter;
    const matchesProject =
      !selectedProject ||
      selectedProject === "all" ||
      awareness.project === selectedProject;
    const matchesDistrict =
      !selectedDistrict ||
      selectedDistrict === "all" ||
      awareness.district === selectedDistrict;

    return matchesSearch && matchesQuarter && matchesProject && matchesDistrict;
  });

  const handleView = (awareness: AwarenessProgram): void => {
    setSelectedAwareness(awareness);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (awareness: AwarenessProgram): void => {
    setSelectedAwareness(awareness);
    setIsEditDialogOpen(true);
  };

  const handleSave = (formData: AwarenessFormData): void => {
    console.log("Saving awareness program:", formData);
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
    toast.success("Awareness Program Saved", {
      description: `${formData.title} has been saved successfully.`
    });
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search programs..."
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
                  <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                  <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                  <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                  <SelectItem value="Q4 2024">Q4 2024</SelectItem>
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
                  <SelectItem value="Sustainable Agriculture Initiative">
                    Sustainable Agriculture Initiative
                  </SelectItem>
                  <SelectItem value="Water Management Project">
                    Water Management Project
                  </SelectItem>
                  <SelectItem value="Crop Diversification Program">
                    Crop Diversification Program
                  </SelectItem>
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
                  <SelectItem value="Guwahati">Guwahati</SelectItem>
                  <SelectItem value="Jorhat">Jorhat</SelectItem>
                  <SelectItem value="Dibrugarh">Dibrugarh</SelectItem>
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
                  <TableHead>Beneficiaries</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAwareness.length === 0 ? (
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
                        {awareness.programId}
                      </TableCell>
                      <TableCell>{awareness.title}</TableCell>
                      <TableCell className="text-sm">
                        {awareness.project}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{awareness.quarter}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {awareness.district}, {awareness.village}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {awareness.achieved}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            / {awareness.target}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>M: {awareness.beneficiaryMale}</div>
                          <div>F: {awareness.beneficiaryFemale}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            awareness.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {awareness.status}
                        </Badge>
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

function AwarenessView({ awareness }: AwarenessViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Program ID
          </Label>
          <p className="text-lg font-semibold">{awareness.programId}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Status</Label>
          <Badge
            variant={awareness.status === "Completed" ? "default" : "secondary"}
            className="mt-1"
          >
            {awareness.status}
          </Badge>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500">
          Program Title
        </Label>
        <p className="text-lg">{awareness.title}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          <p>{awareness.project}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <p>{awareness.quarter}</p>
        </div>
      </div>

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
    programId: awareness?.programId || "",
    title: awareness?.title || "",
    project: awareness?.project || "",
    quarter: awareness?.quarter || "",
    target: awareness?.target?.toString() || "",
    achieved: awareness?.achieved?.toString() || "",
    district: awareness?.district || "",
    village: awareness?.village || "",
    block: awareness?.block || "",
    beneficiaryMale: awareness?.beneficiaryMale?.toString() || "0",
    beneficiaryFemale: awareness?.beneficiaryFemale?.toString() || "0",
    units: awareness?.units || "",
    remarks: awareness?.remarks || "",
    imageFile: null
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        imageFile: "File size must be less than 20MB"
      }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,
        imageFile: "Please select a valid image file"
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, imageFile: file }));

    // Clear error for this field
    if (formErrors.imageFile) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.imageFile;
        return newErrors;
      });
    }

    toast.success("Image selected", {
      description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
    });
  };

  const validateForm = (): boolean => {
    try {
      const validationData = {
        programId: formData.programId,
        title: formData.title,
        project: formData.project,
        quarter: formData.quarter,
        target: Number.parseInt(formData.target) || 0,
        achieved: Number.parseInt(formData.achieved) || 0,
        district: formData.district,
        village: formData.village,
        block: formData.block,
        beneficiaryMale: Number.parseInt(formData.beneficiaryMale) || 0,
        beneficiaryFemale: Number.parseInt(formData.beneficiaryFemale) || 0,
        units: formData.units,
        remarks: formData.remarks
      };
      if (isEdit) {
        updateAwarenessProgramValidation.parse(validationData);
      } else {
        createAwarenessValidation.parse(validationData);
      }

      createAwarenessValidation.parse(validationData);
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

    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form before submitting."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate file upload delay
      if (formData.imageFile) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      onSave(formData);
    } catch {
      toast.error("Error", {
        description: "Failed to save awareness program. Please try again."
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
            value={formData.project}
            onValueChange={(value) => handleSelectChange("project", value)}
          >
            <SelectTrigger
              className={formErrors.project ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sustainable Agriculture Initiative">
                Sustainable Agriculture Initiative
              </SelectItem>
              <SelectItem value="Water Management Project">
                Water Management Project
              </SelectItem>
            </SelectContent>
          </Select>
          {formErrors.project && (
            <p className="text-red-500 text-sm mt-1">{formErrors.project}</p>
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
          placeholder="Enter program title (max 100 characters)"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>
            Quarter <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.quarter}
            onValueChange={(value) => handleSelectChange("quarter", value)}
          >
            <SelectTrigger
              className={formErrors.quarter ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1 2024">Q1 2024</SelectItem>
              <SelectItem value="Q2 2024">Q2 2024</SelectItem>
              <SelectItem value="Q3 2024">Q3 2024</SelectItem>
              <SelectItem value="Q4 2024">Q4 2024</SelectItem>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div>
        <Label htmlFor="imageFile">Program Image</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
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
              <ImageIcon className="h-4 w-4 mr-2" />
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
