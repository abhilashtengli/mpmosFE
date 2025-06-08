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
import {
  GraduationCap,
  Plus,
  Search,
  FileText,
  ImageIcon,
  Eye,
  Edit,
  Upload
} from "lucide-react";

// Base validation schema
const baseTrainingSchema = z.object({
  trainingId: z
    .string()
    .trim()
    .min(2, { message: "Training ID must be at least 2 characters" })
    .max(50, { message: "Training ID cannot exceed 50 characters" }),
  title: z
    .string()
    .trim()
    .min(2, { message: "Title must be at least 2 characters" })
    .max(255, { message: "Title cannot exceed 255 characters" }),
  project: z.string().trim().min(2, { message: "Project must be selected" }),
  quarter: z.string().trim().min(2, { message: "Quarter must be selected" }),
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
  units: z.string().trim().min(1, { message: "Units must be specified" }),
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

// Create training validation with refinements
const createTrainingValidation = baseTrainingSchema.refine(
  (data) => {
    return data.achieved <= data.target;
  },
  {
    message: "Achieved count cannot exceed target count",
    path: ["achieved"]
  }
);

// Update training validation - make all fields optional except refinements
const updateTrainingValidation = z
  .object({
    trainingId: z
      .string()
      .trim()
      .min(2, { message: "Training ID must be at least 2 characters" })
      .max(50, { message: "Training ID cannot exceed 50 characters" })
      .optional(),
    title: z
      .string()
      .trim()
      .min(2, { message: "Title must be at least 2 characters" })
      .max(255, { message: "Title cannot exceed 255 characters" })
      .optional(),
    project: z
      .string()
      .trim()
      .min(2, { message: "Project must be selected" })
      .optional(),
    quarter: z
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
      .trim()
      .min(1, { message: "Units must be specified" })
      .optional(),
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
      // Skip refinement if we don't have both target and achieved
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

// TypeScript interfaces
interface Training {
  id: string;
  trainingId: string;
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
  status: "Completed" | "In Progress" | "Planned";
  imageUrl?: string;
  pdfUrl?: string;
}

interface TrainingFormData {
  trainingId: string;
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
  pdfFile: File | null;
}

interface TrainingFormProps {
  training?: Training;
  onSave: (data: TrainingFormData) => void;
  onClose: () => void;
  isEdit?: boolean;
}

interface TrainingViewProps {
  training: Training;
}

interface FormErrors {
  [key: string]: string;
}

// Mock training data
const initialTrainings: Training[] = [
  {
    id: "1",
    trainingId: "TRN-2024-001",
    title: "Organic Farming Techniques",
    project: "Sustainable Agriculture Initiative",
    quarter: "Q2 2024",
    target: 50,
    achieved: 45,
    district: "Guwahati",
    village: "Khanapara",
    block: "Dispur",
    beneficiaryMale: 25,
    beneficiaryFemale: 20,
    units: "Participants",
    remarks: "Successful training on organic farming methods",
    status: "Completed"
  },
  {
    id: "2",
    trainingId: "TRN-2024-002",
    title: "Modern Irrigation Methods",
    project: "Water Management Project",
    quarter: "Q2 2024",
    target: 30,
    achieved: 28,
    district: "Jorhat",
    village: "Teok",
    block: "Jorhat",
    beneficiaryMale: 15,
    beneficiaryFemale: 13,
    units: "Participants",
    remarks: "Training on drip irrigation and water conservation",
    status: "Completed"
  }
];

//Get project data
//Get training data
// submit new created data
// submit updated data
export default function TrainingPage() {
  const [trainings, setTrainings] = useState<Training[]>(initialTrainings);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  // Filter trainings based on search and filter criteria
  const filteredTrainings: Training[] = trainings.filter(
    (training: Training) => {
      const matchesSearch: boolean =
        training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        training.trainingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        training.project.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesQuarter: boolean =
        !selectedQuarter ||
        selectedQuarter === "all" ||
        training.quarter === selectedQuarter;
      const matchesProject: boolean =
        !selectedProject ||
        selectedProject === "all" ||
        training.project === selectedProject;
      const matchesDistrict: boolean =
        !selectedDistrict ||
        selectedDistrict === "all" ||
        training.district === selectedDistrict;

      return (
        matchesSearch && matchesQuarter && matchesProject && matchesDistrict
      );
    }
  );

  const handleView = (training: Training): void => {
    setSelectedTraining(training);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (training: Training): void => {
    setSelectedTraining(training);
    setIsEditDialogOpen(true);
  };

  const handleSave = (formData: TrainingFormData): void => {
    if (selectedTraining) {
      // Update existing training
      const updatedTraining: Training = {
        ...selectedTraining,
        trainingId: formData.trainingId,
        title: formData.title,
        project: formData.project,
        quarter: formData.quarter,
        target: Number.parseInt(formData.target),
        achieved: Number.parseInt(formData.achieved),
        district: formData.district,
        village: formData.village,
        block: formData.block,
        beneficiaryMale: Number.parseInt(formData.beneficiaryMale),
        beneficiaryFemale: Number.parseInt(formData.beneficiaryFemale),
        units: formData.units,
        remarks: formData.remarks
      };
      setTrainings((prev) =>
        prev.map((t) => (t.id === selectedTraining.id ? updatedTraining : t))
      );
      toast.success("Training Updated", {
        description: `${formData.title} has been updated successfully.`
      });
    } else {
      // Add new training
      const newTraining: Training = {
        id: Date.now().toString(),
        trainingId: formData.trainingId,
        title: formData.title,
        project: formData.project,
        quarter: formData.quarter,
        target: Number.parseInt(formData.target),
        achieved: Number.parseInt(formData.achieved),
        district: formData.district,
        village: formData.village,
        block: formData.block,
        beneficiaryMale: Number.parseInt(formData.beneficiaryMale),
        beneficiaryFemale: Number.parseInt(formData.beneficiaryFemale),
        units: formData.units,
        remarks: formData.remarks,
        status: "Planned"
      };
      setTrainings((prev) => [...prev, newTraining]);
      toast.success("Training Added", {
        description: `${formData.title} has been added successfully.`
      });
    }

    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedTraining(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <GraduationCap className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Training Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage training programs and track beneficiaries
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Training
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Training Program</DialogTitle>
                <DialogDescription>
                  Create a new training program entry with target and
                  achievement data
                </DialogDescription>
              </DialogHeader>
              <TrainingForm
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
                  placeholder="Search trainings..."
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

        {/* Training List */}
        <Card>
          <CardHeader>
            <CardTitle>Training Programs</CardTitle>
            <CardDescription>
              List of all training programs with target vs achievement tracking
              {filteredTrainings.length !== trainings.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredTrainings.length} of {trainings.length} shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Training ID</TableHead>
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
                {filteredTrainings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      No trainings found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrainings.map((training: Training) => (
                    <TableRow key={training.id}>
                      <TableCell className="font-medium">
                        {training.trainingId}
                      </TableCell>
                      <TableCell>{training.title}</TableCell>
                      <TableCell className="text-sm">
                        {training.project}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{training.quarter}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {training.district}, {training.village}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {training.achieved}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            / {training.target}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>M: {training.beneficiaryMale}</div>
                          <div>F: {training.beneficiaryFemale}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            training.status === "Completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {training.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(training)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(training)}
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

        {/* View Training Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Training Details</DialogTitle>
              <DialogDescription>
                View complete training program information
              </DialogDescription>
            </DialogHeader>
            {selectedTraining && <TrainingView training={selectedTraining} />}
          </DialogContent>
        </Dialog>

        {/* Edit Training Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Training Program</DialogTitle>
              <DialogDescription>
                Update training program information
              </DialogDescription>
            </DialogHeader>
            {selectedTraining && (
              <TrainingForm
                training={selectedTraining}
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

function TrainingView({ training }: TrainingViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Training ID
          </Label>
          <p className="text-lg font-semibold">{training.trainingId}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Status</Label>
          <Badge
            variant={training.status === "Completed" ? "default" : "secondary"}
            className="mt-1"
          >
            {training.status}
          </Badge>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500">
          Training Title
        </Label>
        <p className="text-lg">{training.title}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          <p>{training.project}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <p>{training.quarter}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">District</Label>
          <p>{training.district}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Village</Label>
          <p>{training.village}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Block</Label>
          <p>{training.block}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Target</Label>
          <p className="text-lg font-semibold text-gray-600">
            {training.target}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Achieved</Label>
          <p className="text-lg font-semibold text-green-600">
            {training.achieved}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Units</Label>
          <p>{training.units}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Male Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-blue-600">
            {training.beneficiaryMale}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Female Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-pink-600">
            {training.beneficiaryFemale}
          </p>
        </div>
      </div>

      {training.remarks && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Remarks</Label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {training.remarks}
          </p>
        </div>
      )}

      {/* Display attachments if available */}
      {(training.imageUrl || training.pdfUrl) && (
        <div className="space-y-4">
          <Label className="text-sm font-medium text-gray-500">
            Attachments
          </Label>
          <div className="flex gap-4">
            {training.imageUrl && (
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-500" />
                <a
                  href={training.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Image
                </a>
              </div>
            )}
            {training.pdfUrl && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500" />
                <a
                  href={training.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TrainingForm({
  training,
  onSave,
  onClose,
  isEdit = false
}: TrainingFormProps) {
  const [formData, setFormData] = useState<TrainingFormData>({
    trainingId: training?.trainingId || "",
    title: training?.title || "",
    project: training?.project || "",
    quarter: training?.quarter || "",
    target: training?.target?.toString() || "",
    achieved: training?.achieved?.toString() || "",
    district: training?.district || "",
    village: training?.village || "",
    block: training?.block || "",
    beneficiaryMale: training?.beneficiaryMale?.toString() || "0",
    beneficiaryFemale: training?.beneficiaryFemale?.toString() || "0",
    units: training?.units || "",
    remarks: training?.remarks || "",
    imageFile: null,
    pdfFile: null
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "image" | "pdf"
  ): void => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        [`${fileType}File`]: "File size must be less than 20MB"
      }));
      return;
    }

    // Validate file type
    if (fileType === "image" && !file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,
        imageFile: "Please select a valid image file"
      }));
      return;
    }

    if (fileType === "pdf" && file.type !== "application/pdf") {
      setFormErrors((prev) => ({
        ...prev,
        pdfFile: "Please select a valid PDF file"
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [`${fileType}File`]: file }));

    // Clear error for this field
    if (formErrors[`${fileType}File`]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${fileType}File`];
        return newErrors;
      });
    }

    toast.success(`${fileType === "image" ? "Image" : "PDF"} selected`, {
      description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
    });
  };

  const validateForm = (): boolean => {
    try {
      const dataToValidate = {
        trainingId: formData.trainingId,
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
        imageUrl: formData.imageFile
          ? "https://example.com/image.jpg"
          : undefined,
        pdfUrl: formData.pdfFile
          ? "https://example.com/document.pdf"
          : undefined
      };

      if (isEdit) {
        updateTrainingValidation.parse(dataToValidate);
      } else {
        createTrainingValidation.parse(dataToValidate);
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
      if (formData.imageFile || formData.pdfFile) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      onSave(formData);
    } catch {
      toast.error("Error", {
        description: "Failed to save training. Please try again."
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
              <SelectItem value="Crop Diversification Program">
                Crop Diversification Program
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
          Training Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter training title (max 255 characters)"
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
      </div>

      <div className="grid grid-cols-3 gap-4">
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
          className={formErrors.remarks ? "border-red-500" : ""}
        />
        {formErrors.remarks && (
          <p className="text-red-500 text-sm mt-1">{formErrors.remarks}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="imageFile">Training Image</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "image")}
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
                <Upload className="h-4 w-4 mr-2" />
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
        <div>
          <Label htmlFor="pdfFile">Training Materials (PDF)</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                id="pdfFile"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, "pdf")}
                className={`cursor-pointer ${
                  formErrors.pdfFile ? "border-red-500" : ""
                }`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
            {formErrors.pdfFile ? (
              <p className="text-red-500 text-sm">{formErrors.pdfFile}</p>
            ) : (
              <p className="text-sm text-gray-500">Max file size: 20MB</p>
            )}
            {formData.pdfFile && (
              <p className="text-sm text-green-600">
                Selected: {formData.pdfFile.name} (
                {(formData.pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>
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
            ? "Update Training"
            : "Save Training"}
        </Button>
      </div>
    </form>
  );
}
