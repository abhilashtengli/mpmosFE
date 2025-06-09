import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  Plus,
  Search,
  ImageIcon,
  Eye,
  Edit,
  X,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  createInputDistributionValidation,
  updateInputDistributionValidation
} from "@/lib/validations/input-distribution";
import { z } from "zod";

interface InputDistribution {
  id: string;
  inputDistId: string;
  activityType: string;
  customActivityType?: string;
  name: string;
  project: string;
  quarter: string;
  target: number;
  achieved: number;
  district: string;
  village: string;
  block: string;
  units: string;
  remarks: string;
  status: string;
  imageUrl?: string;
}

interface DistributionViewProps {
  distribution: InputDistribution;
}

interface InputDistributionFormData {
  inputDistId: string;
  activityType: string;
  customActivityType: string;
  name: string;
  project: string;
  quarter: string;
  target: string;
  achieved: string;
  district: string;
  village: string;
  block: string;
  units: string;
  remarks: string;
  imageFile: File | null;
}

interface FormErrors {
  [key: string]: string;
}

interface InputDistributionFormProps {
  distribution?: InputDistribution;
  onSave: (data: InputDistributionFormData) => void;
  onClose: () => void;
  isEdit?: boolean;
}

const inputDistributions: InputDistribution[] = [
  {
    id: "1",
    inputDistId: "IND-2024-001",
    activityType: "Seed Distribution",
    name: "High Yield Rice Seeds",
    project: "Crop Improvement Program",
    quarter: "Q2 2024",
    target: 500,
    achieved: 480,
    district: "Guwahati",
    village: "Khanapara",
    block: "Dispur",
    units: "kg",
    remarks: "Distributed to 50 farmers",
    status: "Completed"
  },
  {
    id: "2",
    inputDistId: "IND-2024-002",
    activityType: "Fertilizers",
    name: "Organic Fertilizer Distribution",
    project: "Sustainable Agriculture Initiative",
    quarter: "Q2 2024",
    target: 200,
    achieved: 195,
    district: "Jorhat",
    village: "Teok",
    block: "Jorhat",
    units: "bags",
    remarks: "Organic fertilizer for vegetable cultivation",
    status: "Completed"
  },
  {
    id: "3",
    inputDistId: "IND-2024-003",
    activityType: "Other",
    customActivityType: "Bio-pesticides",
    name: "Neem-based Bio-pesticide",
    project: "Organic Farming Initiative",
    quarter: "Q2 2024",
    target: 100,
    achieved: 98,
    district: "Dibrugarh",
    village: "Naharkatiya",
    block: "Dibrugarh",
    units: "bottles",
    remarks: "Eco-friendly pest control solution",
    status: "Completed"
  }
];

export default function InputDistributionPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedDistribution, setSelectedDistribution] =
    useState<InputDistribution | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedActivityType, setSelectedActivityType] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [pageError, setPageError] = useState<string | null>(null);

  // Filter distributions based on search and filter criteria
  const filteredDistributions = inputDistributions.filter((distribution) => {
    const matchesSearch =
      distribution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distribution.inputDistId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      distribution.project.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActivityType =
      !selectedActivityType ||
      selectedActivityType === "all" ||
      distribution.activityType === selectedActivityType ||
      (selectedActivityType === "Other" &&
        distribution.activityType === "Other");
    const matchesQuarter =
      !selectedQuarter ||
      selectedQuarter === "all" ||
      distribution.quarter === selectedQuarter;
    const matchesProject =
      !selectedProject ||
      selectedProject === "all" ||
      distribution.project === selectedProject;
    const matchesDistrict =
      !selectedDistrict ||
      selectedDistrict === "all" ||
      distribution.district === selectedDistrict;

    return (
      matchesSearch &&
      matchesActivityType &&
      matchesQuarter &&
      matchesProject &&
      matchesDistrict
    );
  });

  const handleView = (distribution: InputDistribution): void => {
    setSelectedDistribution(distribution);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (distribution: InputDistribution): void => {
    setSelectedDistribution(distribution);
    setIsEditDialogOpen(true);
  };

  const handleSave = (data: InputDistributionFormData): void => {
    try {
      setPageError(null);
      console.log("Saving distribution:", data);
      setIsDialogOpen(false);
      setIsEditDialogOpen(false);
      toast.success("Success", {
        description: "Input distribution saved successfully."
      });
    } catch (error) {
      console.error("Error saving distribution:", error);
      setPageError("An error occurred while saving. Please try again.");
      toast.error("Error", {
        description: "Failed to save input distribution. Please try again."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-green-600" />
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
                <Plus className="h-4 w-4 mr-2" />
                New Input Distribution
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Input Distribution</DialogTitle>
                <DialogDescription>
                  Create a new input distribution entry
                </DialogDescription>
              </DialogHeader>
              <InputDistributionForm
                onSave={handleSave}
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
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search distributions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedActivityType}
                onValueChange={setSelectedActivityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Seed Distribution">
                    Seed Distribution
                  </SelectItem>
                  <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                  <SelectItem value="Pesticides">Pesticides</SelectItem>
                  <SelectItem value="Planting Materials">
                    Planting Materials
                  </SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="Crop Improvement Program">
                    Crop Improvement Program
                  </SelectItem>
                  <SelectItem value="Sustainable Agriculture Initiative">
                    Sustainable Agriculture Initiative
                  </SelectItem>
                  <SelectItem value="Organic Farming Initiative">
                    Organic Farming Initiative
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

        <Card>
          <CardHeader>
            <CardTitle>Input Distribution Programs</CardTitle>
            <CardDescription>
              List of all input distribution activities
              {filteredDistributions.length !== inputDistributions.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredDistributions.length} of {inputDistributions.length}{" "}
                  shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Distribution ID</TableHead>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Target/Achieved</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistributions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-gray-500"
                    >
                      No distributions found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDistributions.map((distribution) => (
                    <TableRow key={distribution.id}>
                      <TableCell className="font-medium">
                        {distribution.inputDistId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {distribution.activityType === "Other" &&
                          distribution.customActivityType
                            ? distribution.customActivityType
                            : distribution.activityType}
                        </Badge>
                      </TableCell>
                      <TableCell>{distribution.name}</TableCell>
                      <TableCell className="text-sm">
                        {distribution.project}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{distribution.quarter}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {distribution.district}, {distribution.village}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {distribution.achieved}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            / {distribution.target}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{distribution.units}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            distribution.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {distribution.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(distribution)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(distribution)}
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

        {/* View Distribution Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Distribution Details</DialogTitle>
              <DialogDescription>
                View complete input distribution information
              </DialogDescription>
            </DialogHeader>
            {selectedDistribution && (
              <DistributionView distribution={selectedDistribution} />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Distribution Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Input Distribution</DialogTitle>
              <DialogDescription>
                Update input distribution information
              </DialogDescription>
            </DialogHeader>
            {selectedDistribution && (
              <InputDistributionForm
                distribution={selectedDistribution}
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

function DistributionView({ distribution }: DistributionViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Distribution ID
          </Label>
          <p className="text-lg font-semibold">{distribution.inputDistId}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Status</Label>
          <Badge
            variant={
              distribution.status === "Completed" ? "default" : "secondary"
            }
            className="mt-1"
          >
            {distribution.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Activity Type
          </Label>
          <p className="text-lg">
            {distribution.activityType === "Other" &&
            distribution.customActivityType
              ? distribution.customActivityType
              : distribution.activityType}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Name/Description
          </Label>
          <p className="text-lg">{distribution.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          <p>{distribution.project}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <p>{distribution.quarter}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">District</Label>
          <p>{distribution.district}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Village</Label>
          <p>{distribution.village}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Block</Label>
          <p>{distribution.block}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Target</Label>
          <p className="text-lg font-semibold text-gray-600">
            {distribution.target}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Achieved</Label>
          <p className="text-lg font-semibold text-green-600">
            {distribution.achieved}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Units</Label>
          <p>{distribution.units}</p>
        </div>
      </div>

      {distribution.remarks && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Remarks</Label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {distribution.remarks}
          </p>
        </div>
      )}

      {distribution.imageUrl && (
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Distribution Image
          </Label>
          <div className="mt-2">
            <img
              src={distribution.imageUrl || "/placeholder.svg"}
              alt="Distribution"
              className="max-w-full h-auto rounded-md border"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InputDistributionForm({
  distribution,
  onSave,
  onClose,
  isEdit = false
}: InputDistributionFormProps) {
  const [formData, setFormData] = useState<InputDistributionFormData>({
    inputDistId: distribution?.inputDistId || "",
    activityType: distribution?.activityType || "",
    customActivityType: distribution?.customActivityType || "",
    name: distribution?.name || "",
    project: distribution?.project || "",
    quarter: distribution?.quarter || "",
    target: distribution?.target?.toString() || "",
    achieved: distribution?.achieved?.toString() || "",
    district: distribution?.district || "",
    village: distribution?.village || "",
    block: distribution?.block || "",
    units: distribution?.units || "",
    remarks: distribution?.remarks || "",
    imageFile: null
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    distribution?.imageUrl || null
  );

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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
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

    toast.success("Image selected", {
      description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
    });
  };

  const removeImage = (): void => {
    setFormData((prev) => ({ ...prev, imageFile: null }));
    setImagePreview(null);
  };

  const validateForm = (): boolean => {
    try {
      const dataToValidate = {
        projectId: "550e8400-e29b-41d4-a716-446655440000", // Mock project ID
        quarterId: "550e8400-e29b-41d4-a716-446655440001", // Mock quarter ID
        activityType: formData.activityType,
        customActivityType: formData.customActivityType,
        name: formData.name,
        target: Number.parseInt(formData.target) || 0,
        achieved: Number.parseInt(formData.achieved) || 0,
        district: formData.district,
        village: formData.village,
        block: formData.block,
        units: formData.units,
        remarks: formData.remarks,
        imageUrl: formData.imageFile ? "https://example.com/image.jpg" : null,
        imageKey: formData.imageFile ? `input-distribution-${Date.now()}` : null
      };

      if (isEdit) {
        updateInputDistributionValidation.parse(dataToValidate);
      } else {
        createInputDistributionValidation.parse(dataToValidate);
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
    setFormError(null);

    try {
      // Simulate file upload delay
      if (formData.imageFile) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      onSave(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormError("An error occurred while saving. Please try again.");
      toast.error("Error", {
        description: "Failed to save input distribution. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
                <SelectItem value="Crop Improvement Program">
                  Crop Improvement Program
                </SelectItem>
                <SelectItem value="Sustainable Agriculture Initiative">
                  Sustainable Agriculture Initiative
                </SelectItem>
                <SelectItem value="Organic Farming Initiative">
                  Organic Farming Initiative
                </SelectItem>
              </SelectContent>
            </Select>
            {formErrors.project && (
              <p className="text-red-500 text-sm mt-1">{formErrors.project}</p>
            )}
          </div>
          <div>
            <Label htmlFor="name">
              Name/Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter distribution name"
              value={formData.name}
              onChange={handleInputChange}
              maxLength={200}
              className={formErrors.name ? "border-red-500" : ""}
              required
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>
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
            <Label>
              Activity Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.activityType}
              onValueChange={(value) =>
                handleSelectChange("activityType", value)
              }
            >
              <SelectTrigger
                className={formErrors.activityType ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Seed Distribution">
                  Seed Distribution
                </SelectItem>
                <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                <SelectItem value="Pesticides">Pesticides</SelectItem>
                <SelectItem value="Planting Materials">
                  Planting Materials
                </SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.activityType && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.activityType}
              </p>
            )}
          </div>
        </div>

        {formData.activityType === "Other" && (
          <div>
            <Label htmlFor="customActivityType">
              Custom Activity Type <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customActivityType"
              name="customActivityType"
              placeholder="Enter custom activity type"
              value={formData.customActivityType}
              onChange={handleInputChange}
              className={formErrors.customActivityType ? "border-red-500" : ""}
              required
            />
            {formErrors.customActivityType && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.customActivityType}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="target">
              Target <span className="text-red-500">*</span>
            </Label>
            <Input
              id="target"
              name="target"
              type="number"
              placeholder="Enter target"
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
              placeholder="Enter achieved"
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
            <Label htmlFor="units">
              Units <span className="text-red-500">*</span>
            </Label>
            <Input
              id="units"
              name="units"
              placeholder="kg, bags, packets"
              value={formData.units}
              onChange={handleInputChange}
              maxLength={20}
              className={formErrors.units ? "border-red-500" : ""}
              required
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
            className={` mt-2 ${formErrors.remarks ? "border-red-500" : ""}`}
          />
          {formErrors.remarks && (
            <p className="text-red-500 text-sm mt-1">{formErrors.remarks}</p>
          )}
        </div>

        <div>
          <Label htmlFor="imageFile">Distribution Image</Label>
          <div className="space-y-2 mt-2">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <Label htmlFor="imageFile" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload an image
                    </span>
                  </Label>
                  <Input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}
            {formErrors.imageFile ? (
              <p className="text-red-500 text-sm">{formErrors.imageFile}</p>
            ) : (
              <p className="text-sm text-gray-500">Max file size: 20MB</p>
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
              ? "Update Distribution"
              : "Save Distribution"}
          </Button>
        </div>
      </form>
    </div>
  );
}
