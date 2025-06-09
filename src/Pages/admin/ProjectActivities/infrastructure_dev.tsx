"use client";

import type React from "react";

import { useState, useRef } from "react";
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
  Building,
  Plus,
  Search,
  Eye,
  Edit,
  Upload,
  AlertCircle
} from "lucide-react";
import {
  createInfrastructureValidation,
  updateInfrastructureValidation
} from "@/lib/validations/infrastructure";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { z } from "zod";

interface Infrastructure {
  id: string;
  infrastructureId: string;
  title: string;
  project: string;
  projectId: string;
  quarter: string;
  quarterId: string;
  target: number;
  achieved: number;
  district: string;
  village: string;
  block: string;
  beneficiaryMale: number;
  beneficiaryFemale: number;
  units: string;
  remarks: string | null;
  status: string;
  infrastructureType: string;
  budget: number;
  completionDate: string;
  imageUrl?: string | null;
  imageKey?: string | null;
}

interface InfrastructureViewProps {
  infrastructure: Infrastructure;
}

interface InfrastructureFormProps {
  infrastructure?: Infrastructure;
  onSave: (data: Partial<Infrastructure>, file?: File | null) => void;
  onClose: () => void;
  isEdit?: boolean;
}

// Mock project and quarter data
const projects = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Sustainable Agriculture Initiative"
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174000",
    name: "Water Management Project"
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174000",
    name: "Crop Diversification Program"
  }
];

const quarters = [
  { id: "123e4567-e89b-12d3-a456-426614174001", name: "Q1 2024" },
  { id: "223e4567-e89b-12d3-a456-426614174001", name: "Q2 2024" },
  { id: "323e4567-e89b-12d3-a456-426614174001", name: "Q3 2024" },
  { id: "423e4567-e89b-12d3-a456-426614174001", name: "Q4 2024" }
];

// Mock infrastructure data
const infrastructures: Infrastructure[] = [
  {
    id: "1",
    infrastructureId: "INF-2024-001",
    title: "Storage Facility Construction",
    project: "Sustainable Agriculture Initiative",
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    quarter: "Q2 2024",
    quarterId: "223e4567-e89b-12d3-a456-426614174001",
    target: 5,
    achieved: 3,
    district: "Guwahati",
    village: "Khanapara",
    block: "Dispur",
    beneficiaryMale: 50,
    beneficiaryFemale: 30,
    units: "Facilities",
    remarks:
      "Construction of modern storage facilities for agricultural products",
    status: "In Progress",
    infrastructureType: "Storage",
    budget: 500000,
    completionDate: "2024-08-15"
  },
  {
    id: "2",
    infrastructureId: "INF-2024-002",
    title: "Irrigation System Installation",
    project: "Water Management Project",
    projectId: "223e4567-e89b-12d3-a456-426614174000",
    quarter: "Q2 2024",
    quarterId: "223e4567-e89b-12d3-a456-426614174001",
    target: 8,
    achieved: 6,
    district: "Jorhat",
    village: "Teok",
    block: "Jorhat",
    beneficiaryMale: 40,
    beneficiaryFemale: 35,
    units: "Systems",
    remarks: "Installation of drip irrigation systems",
    status: "Completed",
    infrastructureType: "Irrigation",
    budget: 750000,
    completionDate: "2024-06-30"
  }
];

export default function InfrastructurePage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedInfrastructure, setSelectedInfrastructure] =
    useState<Infrastructure | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [pageError, setPageError] = useState<string | null>(null);

  // Filter infrastructures based on search and filter criteria
  const filteredInfrastructures = infrastructures.filter((infrastructure) => {
    const matchesSearch =
      infrastructure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infrastructure.infrastructureId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      infrastructure.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infrastructure.infrastructureType
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesQuarter =
      !selectedQuarter ||
      selectedQuarter === "all" ||
      infrastructure.quarter === selectedQuarter;
    const matchesProject =
      !selectedProject ||
      selectedProject === "all" ||
      infrastructure.project === selectedProject;
    const matchesDistrict =
      !selectedDistrict ||
      selectedDistrict === "all" ||
      infrastructure.district === selectedDistrict;

    return matchesSearch && matchesQuarter && matchesProject && matchesDistrict;
  });

  const handleView = (infrastructure: Infrastructure): void => {
    setSelectedInfrastructure(infrastructure);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (infrastructure: Infrastructure): void => {
    setSelectedInfrastructure(infrastructure);
    setIsEditDialogOpen(true);
  };

  const handleSave = (
    formData: Partial<Infrastructure>,
    file?: File | null
  ): void => {
    try {
      // In a real app, this would make an API call
      console.log("Saving infrastructure:", formData);
      console.log("File to upload:", file);

      // Show success message
      toast.success("Success", {
        description: formData.id
          ? "Infrastructure updated successfully"
          : "Infrastructure created successfully"
      });

      // Close dialogs
      setIsDialogOpen(false);
      setIsEditDialogOpen(false);
      setPageError(null);
    } catch (error) {
      console.error("Error saving infrastructure:", error);
      setPageError("An error occurred while saving. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building className="h-8 w-8 text-green-600" />
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
                <Plus className="h-4 w-4 mr-2" />
                New Infrastructure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Infrastructure Project</DialogTitle>
                <DialogDescription>
                  Create a new infrastructure development entry with target and
                  achievement data
                </DialogDescription>
              </DialogHeader>
              <InfrastructureForm
                onSave={handleSave}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {/* Page-level error */}
        {pageError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{pageError}</AlertDescription>
          </Alert>
        )}

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
                  placeholder="Search infrastructure..."
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

        {/* Infrastructure List */}
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Development Projects</CardTitle>
            <CardDescription>
              List of all infrastructure projects with target vs achievement
              tracking
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
                  <TableHead>Infrastructure ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Target/Achieved</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Beneficiaries</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInfrastructures.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-8 text-gray-500"
                    >
                      No infrastructure projects found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInfrastructures.map((infrastructure) => (
                    <TableRow key={infrastructure.id}>
                      <TableCell className="font-medium">
                        {infrastructure.infrastructureId}
                      </TableCell>
                      <TableCell>{infrastructure.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {infrastructure.infrastructureType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {infrastructure.project}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {infrastructure.quarter}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {infrastructure.district}, {infrastructure.village}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {infrastructure.achieved}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            / {infrastructure.target}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        ₹{infrastructure.budget.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>M: {infrastructure.beneficiaryMale}</div>
                          <div>F: {infrastructure.beneficiaryFemale}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            infrastructure.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {infrastructure.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(infrastructure)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(infrastructure)}
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
              <DialogTitle>Infrastructure Details</DialogTitle>
              <DialogDescription>
                View complete infrastructure project information
              </DialogDescription>
            </DialogHeader>
            {selectedInfrastructure && (
              <InfrastructureView infrastructure={selectedInfrastructure} />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Infrastructure Project</DialogTitle>
              <DialogDescription>
                Update infrastructure project information
              </DialogDescription>
            </DialogHeader>
            {selectedInfrastructure && (
              <InfrastructureForm
                infrastructure={selectedInfrastructure}
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

function InfrastructureView({ infrastructure }: InfrastructureViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Infrastructure ID
          </Label>
          <p className="text-lg font-semibold">
            {infrastructure.infrastructureId}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Status</Label>
          <Badge
            variant={
              infrastructure.status === "Completed" ? "default" : "secondary"
            }
            className="mt-1"
          >
            {infrastructure.status}
          </Badge>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500">
          Infrastructure Title
        </Label>
        <p className="text-lg">{infrastructure.title}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Infrastructure Type
          </Label>
          <p>{infrastructure.infrastructureType}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Budget</Label>
          <p>₹{infrastructure.budget.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          <p>{infrastructure.project}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <p>{infrastructure.quarter}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">District</Label>
          <p>{infrastructure.district}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Village</Label>
          <p>{infrastructure.village}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Block</Label>
          <p>{infrastructure.block}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Target</Label>
          <p className="text-lg font-semibold text-gray-600">
            {infrastructure.target}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Achieved</Label>
          <p className="text-lg font-semibold text-green-600">
            {infrastructure.achieved}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Units</Label>
          <p>{infrastructure.units}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Male Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-blue-600">
            {infrastructure.beneficiaryMale}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Female Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-pink-600">
            {infrastructure.beneficiaryFemale}
          </p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500">
          Completion Date
        </Label>
        <p>{infrastructure.completionDate}</p>
      </div>

      {infrastructure.imageUrl && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Image</Label>
          <div className="mt-2 border rounded-md overflow-hidden">
            <img
              src={infrastructure.imageUrl || "/placeholder.svg"}
              alt={infrastructure.title}
              className="w-full h-auto max-h-64 object-cover"
            />
          </div>
        </div>
      )}

      {infrastructure.remarks && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Remarks</Label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {infrastructure.remarks}
          </p>
        </div>
      )}
    </div>
  );
}

function InfrastructureForm({
  infrastructure,
  onSave,
  onClose,
  isEdit = false
}: InfrastructureFormProps) {
  const [formData, setFormData] = useState<Partial<Infrastructure>>({
    projectId: infrastructure?.projectId || "",
    quarterId: infrastructure?.quarterId || "",
    title: infrastructure?.title || "",
    infrastructureType: infrastructure?.infrastructureType || "",
    target: infrastructure?.target || 0,
    achieved: infrastructure?.achieved || 0,
    district: infrastructure?.district || "",
    village: infrastructure?.village || "",
    block: infrastructure?.block || "",
    beneficiaryMale: infrastructure?.beneficiaryMale || 0,
    beneficiaryFemale: infrastructure?.beneficiaryFemale || 0,
    units: infrastructure?.units || "",
    budget: infrastructure?.budget || 0,
    completionDate: infrastructure?.completionDate || "",
    remarks: infrastructure?.remarks || "",
    imageUrl: infrastructure?.imageUrl || null,
    imageKey: infrastructure?.imageKey || null
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(
    infrastructure?.imageUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    let parsedValue: unknown = value;

    // Convert numeric fields to numbers
    if (
      [
        "target",
        "achieved",
        "beneficiaryMale",
        "beneficiaryFemale",
        "budget"
      ].includes(name)
    ) {
      parsedValue = value === "" ? 0 : Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

    setSelectedFile(file);

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Clear error for this field
    if (formErrors.imageFile) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.imageFile;
        return newErrors;
      });
    }

    toast("Image selected", {
      description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
    });
  };

  const validateForm = (): boolean => {
    try {
      // Use the appropriate validation schema based on whether we're editing or creating
      const validationSchema = isEdit
        ? updateInfrastructureValidation
        : createInfrastructureValidation;

      // Create a mock URL for validation if a file is selected but not yet uploaded
      const mockImageData = selectedFile
        ? {
            imageUrl: "https://example.com/image.jpg",
            imageKey: `infrastructure-${Date.now()}-${selectedFile.name}`
          }
        : {};

      validationSchema.parse({
        ...formData,
        ...mockImageData
      });

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
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
      toast("Validation Error", {
        description: "Please fix the errors in the form before submitting."
      });
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Simulate file upload delay
      if (selectedFile) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // In a real app, this would upload the file to a storage service
      // and get back a URL and key to store in the database
      let imageData = {};
      if (selectedFile) {
        // Simulate getting a URL and key from a storage service
        const mockImageUrl = URL.createObjectURL(selectedFile);
        const mockImageKey = `infrastructure-${Date.now()}-${
          selectedFile.name
        }`;

        imageData = {
          imageUrl: mockImageUrl,
          imageKey: mockImageKey
        };
      }

      // Add ID if editing
      const finalData = {
        ...formData,
        ...imageData,
        ...(isEdit && infrastructure ? { id: infrastructure.id } : {})
      };

      onSave(finalData, selectedFile);
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormError("An error occurred while saving. Please try again.");
      toast("Error", {
        description: "An error occurred while saving. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="projectId">
            Project <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.projectId as string}
            onValueChange={(value) => handleSelectChange("projectId", value)}
          >
            <SelectTrigger
              className={formErrors.projectId ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
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
          Infrastructure Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter infrastructure title"
          value={formData.title as string}
          onChange={handleInputChange}
          className={formErrors.title ? "border-red-500" : ""}
        />
        {formErrors.title && (
          <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quarterId">
            Quarter <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.quarterId as string}
            onValueChange={(value) => handleSelectChange("quarterId", value)}
          >
            <SelectTrigger
              className={formErrors.quarterId ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent>
              {quarters.map((quarter) => (
                <SelectItem key={quarter.id} value={quarter.id}>
                  {quarter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.quarterId && (
            <p className="text-red-500 text-sm mt-1">{formErrors.quarterId}</p>
          )}
        </div>
        <div>
          <Label htmlFor="infrastructureType">
            Infrastructure Type <span className="text-red-500">*</span>
          </Label>
          <Input
            id="infrastructureType"
            name="infrastructureType"
            placeholder="e.g., Storage, Irrigation, Processing"
            value={formData.infrastructureType as string}
            onChange={handleInputChange}
            className={formErrors.infrastructureType ? "border-red-500" : ""}
          />
          {formErrors.infrastructureType && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.infrastructureType}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="budget">
            Budget <span className="text-red-500">*</span>
          </Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            placeholder="Enter budget amount"
            value={formData.budget as number}
            onChange={handleInputChange}
            className={formErrors.budget ? "border-red-500" : ""}
          />
          {formErrors.budget && (
            <p className="text-red-500 text-sm mt-1">{formErrors.budget}</p>
          )}
        </div>
        <div>
          <Label htmlFor="units">
            Units <span className="text-red-500">*</span>
          </Label>
          <Input
            id="units"
            name="units"
            placeholder="e.g., Facilities, Systems"
            value={formData.units as string}
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
            value={formData.target as number}
            onChange={handleInputChange}
            className={formErrors.target ? "border-red-500" : ""}
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
            value={formData.achieved as number}
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
            value={formData.district as string}
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
            value={formData.village as string}
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
            value={formData.block as string}
            onChange={handleInputChange}
            className={formErrors.block ? "border-red-500" : ""}
          />
          {formErrors.block && (
            <p className="text-red-500 text-sm mt-1">{formErrors.block}</p>
          )}
        </div>
        <div>
          <Label htmlFor="beneficiaryMale">
            Male Beneficiaries <span className="text-red-500">*</span>
          </Label>
          <Input
            id="beneficiaryMale"
            name="beneficiaryMale"
            type="number"
            placeholder="0"
            value={formData.beneficiaryMale as number}
            onChange={handleInputChange}
            className={formErrors.beneficiaryMale ? "border-red-500" : ""}
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
            value={formData.beneficiaryFemale as number}
            onChange={handleInputChange}
            className={formErrors.beneficiaryFemale ? "border-red-500" : ""}
          />
          {formErrors.beneficiaryFemale && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.beneficiaryFemale}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="completionDate">
            Completion Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="completionDate"
            name="completionDate"
            type="date"
            value={formData.completionDate as string}
            onChange={handleInputChange}
            className={`${formErrors.completionDate ? "border-red-500" : ""}`}
          />
          {formErrors.completionDate && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.completionDate}
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
          className={`min-h-[100px] mt-2 ${
            formErrors.remarks ? "border-red-500" : ""
          }`}
          value={(formData.remarks as string) || ""}
          onChange={handleInputChange}
          maxLength={300}
        />
        {formErrors.remarks && (
          <p className="text-red-500 text-sm mt-1">{formErrors.remarks}</p>
        )}
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label htmlFor="image">Infrastructure Image</Label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isEdit ? "Change Image" : "Upload Image"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            id="image"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {formErrors.imageFile && (
            <p className="text-sm text-red-500">{formErrors.imageFile}</p>
          )}
          {formErrors.imageUrl && (
            <p className="text-sm text-red-500">{formErrors.imageUrl}</p>
          )}
          {formErrors.imageKey && (
            <p className="text-sm text-red-500">{formErrors.imageKey}</p>
          )}
        </div>

        {/* Image Preview */}
        {filePreview && (
          <div className="mt-2 border rounded-md overflow-hidden">
            <img
              src={filePreview || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-auto max-h-64 object-cover"
            />
            <div className="p-2 bg-gray-50 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {selectedFile ? selectedFile.name : "Current image"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setFilePreview(null);
                  setFormData((prev) => ({
                    ...prev,
                    imageUrl: null,
                    imageKey: null
                  }));
                }}
              >
                Remove
              </Button>
            </div>
          </div>
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
          {isSubmitting
            ? "Saving..."
            : isEdit
            ? "Update Infrastructure"
            : "Save Infrastructure"}
        </Button>
      </div>
    </form>
  );
}
