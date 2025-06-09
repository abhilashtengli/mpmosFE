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
import { Sprout, Plus, Search, Eye, Edit, ImageIcon } from "lucide-react";

// Validation schemas
const baseFLDSchema = z.object({
  fldId: z
    .string()
    .trim()
    .min(2, { message: "FLD ID must be at least 2 characters" })
    .max(50, { message: "FLD ID cannot exceed 50 characters" }),
  title: z
    .string()
    .trim()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(255, { message: "Title cannot exceed 255 characters" }),
  project: z.string().trim().min(1, { message: "Project is required" }),
  quarter: z.string().trim().min(1, { message: "Quarter is required" }),
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
    .optional(),
  cropType: z.string().trim().min(1, { message: "Crop type is required" }),
  area: z
    .number({ invalid_type_error: "Area must be a number" })
    .positive({ message: "Area must be positive" })
});

const createFLDValidation = baseFLDSchema.refine(
  (data) => data.achieved <= data.target,
  {
    message: "Achieved count cannot exceed target count",
    path: ["achieved"]
  }
);

const updateFLDValidation = baseFLDSchema.partial().refine(
  (data) => {
    if (data.target !== undefined && data.achieved !== undefined) {
      return data.achieved <= data.target;
    }
    return true;
  },
  {
    message: "Achieved count cannot exceed target count",
    path: ["achieved"]
  }
);

interface FLDFormData {
  fldId: string;
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
  cropType: string;
  area: string;
  imageFile: File | null;
}

type FormErrors = {
  [key: string]: string;
};

interface FLD {
  id: string;
  fldId: string;
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
  cropType: string;
  area: number;
}

interface FLDViewProps {
  fld: FLD;
}

interface FLDFormProps {
  fld?: FLD;
  onSave: (data: FLDFormData) => void;
  onClose: () => void;
  formErrors: FormErrors; // 👈 add this
  validateForm: (data: FLDFormData, isEdit?: boolean) => boolean;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit?: boolean;
}

// Mock FLD data
const flds: FLD[] = [
  {
    id: "1",
    fldId: "FLD-2024-001",
    title: "Rice Cultivation Demonstration",
    project: "Sustainable Agriculture Initiative",
    quarter: "Q2 2024",
    target: 10,
    achieved: 8,
    district: "Guwahati",
    village: "Khanapara",
    block: "Dispur",
    beneficiaryMale: 15,
    beneficiaryFemale: 10,
    units: "Plots",
    remarks: "Successful demonstration of improved rice varieties",
    status: "Completed",
    cropType: "Rice",
    area: 2.5
  },
  {
    id: "2",
    fldId: "FLD-2024-002",
    title: "Vegetable Farming Demo",
    project: "Water Management Project",
    quarter: "Q2 2024",
    target: 8,
    achieved: 7,
    district: "Jorhat",
    village: "Teok",
    block: "Jorhat",
    beneficiaryMale: 12,
    beneficiaryFemale: 8,
    units: "Plots",
    remarks: "Demonstration of organic vegetable farming",
    status: "Completed",
    cropType: "Vegetables",
    area: 1.8
  }
];

export default function FLDPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedFLD, setSelectedFLD] = useState<FLD | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter FLDs based on search and filter criteria
  const filteredFLDs = flds.filter((fld) => {
    const matchesSearch =
      fld.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fld.fldId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fld.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fld.cropType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQuarter =
      !selectedQuarter ||
      selectedQuarter === "all" ||
      fld.quarter === selectedQuarter;
    const matchesProject =
      !selectedProject ||
      selectedProject === "all" ||
      fld.project === selectedProject;
    const matchesDistrict =
      !selectedDistrict ||
      selectedDistrict === "all" ||
      fld.district === selectedDistrict;

    return matchesSearch && matchesQuarter && matchesProject && matchesDistrict;
  });

  const handleView = (fld: FLD): void => {
    setSelectedFLD(fld);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (fld: FLD): void => {
    setSelectedFLD(fld);
    setIsEditDialogOpen(true);
  };

  const handleSave = (formData: FLDFormData): void => {
    console.log("Saving FLD:", formData);
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
    toast.success("FLD Program Saved", {
      description: `${formData.title} has been saved successfully.`
    });
  };

  const validateForm = (data: FLDFormData, isEdit = false): boolean => {
    try {
      const validationData = {
        fldId: data.fldId,
        title: data.title,
        project: data.project,
        quarter: data.quarter,
        target: Number.parseInt(data.target) || 0,
        achieved: Number.parseInt(data.achieved) || 0,
        district: data.district,
        village: data.village,
        block: data.block,
        beneficiaryMale: Number.parseInt(data.beneficiaryMale) || 0,
        beneficiaryFemale: Number.parseInt(data.beneficiaryFemale) || 0,
        units: data.units,
        remarks: data.remarks,
        cropType: data.cropType,
        area: Number.parseFloat(data.area) || 0
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
                onSave={handleSave}
                onClose={() => setIsDialogOpen(false)}
                formErrors={formErrors}
                validateForm={validateForm}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
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
                  placeholder="Search FLDs..."
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
                  <TableHead>Title</TableHead>
                  <TableHead>Crop Type</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Target/Achieved</TableHead>
                  <TableHead>Area (Acres)</TableHead>
                  <TableHead>Beneficiaries</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFLDs.length === 0 ? (
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
                      <TableCell>{fld.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{fld.cropType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{fld.project}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{fld.quarter}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
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
                      <TableCell>{fld.area}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>M: {fld.beneficiaryMale}</div>
                          <div>F: {fld.beneficiaryFemale}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            fld.status === "Completed" ? "default" : "secondary"
                          }
                        >
                          {fld.status}
                        </Badge>
                      </TableCell>
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
                onSave={handleSave}
                onClose={() => setIsEditDialogOpen(false)}
                isEdit={true}
                formErrors={formErrors}
                validateForm={validateForm}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function FLDView({ fld }: FLDViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">FLD ID</Label>
          <p className="text-lg font-semibold">{fld.fldId}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Status</Label>
          <Badge
            variant={fld.status === "Completed" ? "default" : "secondary"}
            className="mt-1"
          >
            {fld.status}
          </Badge>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500">FLD Title</Label>
        <p className="text-lg">{fld.title}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Crop Type</Label>
          <p>{fld.cropType}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Area (Acres)
          </Label>
          <p>{fld.area}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          <p>{fld.project}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <p>{fld.quarter}</p>
        </div>
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Male Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-blue-600">
            {fld.beneficiaryMale}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Female Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-pink-600">
            {fld.beneficiaryFemale}
          </p>
        </div>
      </div>

      {fld.remarks && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Remarks</Label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {fld.remarks}
          </p>
        </div>
      )}
    </div>
  );
}

function FLDForm({ fld, onSave, onClose, isEdit = false }: FLDFormProps) {
  const [formData, setFormData] = useState<FLDFormData>({
    fldId: fld?.fldId || "",
    title: fld?.title || "",
    project: fld?.project || "",
    quarter: fld?.quarter || "",
    target: fld?.target?.toString() || "",
    achieved: fld?.achieved?.toString() || "",
    district: fld?.district || "",
    village: fld?.village || "",
    block: fld?.block || "",
    beneficiaryMale: fld?.beneficiaryMale?.toString() || "0",
    beneficiaryFemale: fld?.beneficiaryFemale?.toString() || "0",
    units: fld?.units || "",
    remarks: fld?.remarks || "",
    cropType: fld?.cropType || "",
    area: fld?.area?.toString() || "",
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
      const dataToValidate = {
        fldId: formData.fldId,
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
        remarks: formData.remarks,
        cropType: formData.cropType,
        area: Number.parseFloat(formData.area) || 0
      };

      if (isEdit) {
        updateFLDValidation.parse(dataToValidate);
      } else {
        createFLDValidation.parse(dataToValidate);
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
      if (formData.imageFile) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      onSave(formData);
    } catch {
      toast.error("Error", {
        description: "Failed to save FLD program. Please try again."
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
        <div>
          <Label htmlFor="title">
            FLD Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter FLD title (max 255 characters)"
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
          <Label htmlFor="cropType">
            Crop Type <span className="text-red-500">*</span>
          </Label>
          <Input
            id="cropType"
            name="cropType"
            placeholder="e.g., Rice, Wheat, Vegetables"
            value={formData.cropType}
            onChange={handleInputChange}
            className={formErrors.cropType ? "border-red-500" : ""}
            required
          />
          {formErrors.cropType && (
            <p className="text-red-500 text-sm mt-1">{formErrors.cropType}</p>
          )}
        </div>
        <div>
          <Label htmlFor="area">
            Area (Acres) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="area"
            name="area"
            type="number"
            step="0.1"
            placeholder="Enter area in acres"
            value={formData.area}
            onChange={handleInputChange}
            className={formErrors.area ? "border-red-500" : ""}
            min="0"
            required
          />
          {formErrors.area && (
            <p className="text-red-500 text-sm mt-1">{formErrors.area}</p>
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
          <Label htmlFor="units">
            Units <span className="text-red-500">*</span>
          </Label>
          <Input
            id="units"
            name="units"
            placeholder="e.g., Plots, Demonstrations"
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
          className={formErrors.remarks ? "border-red-500" : ""}
        />
        {formErrors.remarks && (
          <p className="text-red-500 text-sm mt-1">{formErrors.remarks}</p>
        )}
      </div>

      <div>
        <Label htmlFor="imageFile">FLD Image</Label>
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
          {isSubmitting ? "Saving..." : isEdit ? "Update FLD" : "Save FLD"}
        </Button>
      </div>
    </form>
  );
}
