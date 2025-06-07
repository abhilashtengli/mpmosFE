import React, { useState } from "react";
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
  Edit
} from "lucide-react";

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
          <div className="mt-1">
            <Badge
              className={` ${
                training.status === "Completed"
                  ? "bg-green-500 text-white"
                  : "secondary"
              }`}
            >
              {training.status}
            </Badge>
          </div>
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
    </div>
  );
}

function TrainingForm({
  training,
  onSave,
  onClose,
  isEdit = false
}: TrainingFormProps) {
  const [formData, setFormData] = useState({
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
    remarks: training?.remarks || ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="trainingId">Training ID</Label>
          <Input
            id="trainingId"
            placeholder="TRN-2024-XXX"
            value={formData.trainingId}
            onChange={(e) => handleInputChange("trainingId", e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Project</Label>
          <Select
            value={formData.project}
            onValueChange={(value) => handleInputChange("project", value)}
          >
            <SelectTrigger>
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
        </div>
      </div>

      <div>
        <Label htmlFor="title">Training Title</Label>
        <Input
          id="title"
          placeholder="Enter training title (max 255 characters)"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          maxLength={255}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Quarter</Label>
          <Select
            value={formData.quarter}
            onValueChange={(value) => handleInputChange("quarter", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1 2024">Q1 2024</SelectItem>
              <SelectItem value="Q2 2024">Q2 2024</SelectItem>
              <SelectItem value="Q3 2024">Q3 2024</SelectItem>
              <SelectItem value="Q4 2024">Q4 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="units">Units</Label>
          <Input
            id="units"
            placeholder="e.g., Participants, Sessions"
            value={formData.units}
            onChange={(e) => handleInputChange("units", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="target">Target</Label>
          <Input
            id="target"
            type="number"
            placeholder="Enter target number"
            value={formData.target}
            onChange={(e) => handleInputChange("target", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="achieved">Achieved</Label>
          <Input
            id="achieved"
            type="number"
            placeholder="Enter achieved number"
            value={formData.achieved}
            onChange={(e) => handleInputChange("achieved", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            placeholder="District name"
            value={formData.district}
            onChange={(e) => handleInputChange("district", e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div>
          <Label htmlFor="village">Village</Label>
          <Input
            id="village"
            placeholder="Village name"
            value={formData.village}
            onChange={(e) => handleInputChange("village", e.target.value)}
            maxLength={100}
            required
          />
        </div>
        <div>
          <Label htmlFor="block">Block</Label>
          <Input
            id="block"
            placeholder="Block name"
            value={formData.block}
            onChange={(e) => handleInputChange("block", e.target.value)}
            maxLength={100}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="beneficiaryMale">Male Beneficiaries</Label>
          <Input
            id="beneficiaryMale"
            type="number"
            placeholder="0"
            value={formData.beneficiaryMale}
            onChange={(e) =>
              handleInputChange("beneficiaryMale", e.target.value)
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="beneficiaryFemale">Female Beneficiaries</Label>
          <Input
            id="beneficiaryFemale"
            type="number"
            placeholder="0"
            value={formData.beneficiaryFemale}
            onChange={(e) =>
              handleInputChange("beneficiaryFemale", e.target.value)
            }
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          placeholder="Additional remarks (max 300 characters)"
          value={formData.remarks}
          onChange={(e) => handleInputChange("remarks", e.target.value)}
          maxLength={300}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Training Image</Label>
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" size="sm">
              <ImageIcon className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </div>
        </div>
        <div>
          <Label>Training Materials (PDF)</Label>
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Upload PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {isEdit ? "Update Training" : "Save Training"}
        </Button>
      </div>
    </form>
  );
}

export default function TrainingAdPage() {
  const [trainings, setTrainings] = useState<Training[]>(initialTrainings);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // Filter trainings based on search and filter criteria
  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch =
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.trainingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.project.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQuarter =
      !selectedQuarter ||
      selectedQuarter === "all" ||
      training.quarter === selectedQuarter;
    const matchesProject =
      !selectedProject ||
      selectedProject === "all" ||
      training.project === selectedProject;
    const matchesDistrict =
      !selectedDistrict ||
      selectedDistrict === "all" ||
      training.district === selectedDistrict;

    return matchesSearch && matchesQuarter && matchesProject && matchesDistrict;
  });

  const handleView = (training: Training) => {
    setSelectedTraining(training);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (training: Training) => {
    setSelectedTraining(training);
    setIsEditDialogOpen(true);
  };

  const handleSave = (formData: TrainingFormData) => {
    if (selectedTraining) {
      // Update existing training
      const updatedTraining: Training = {
        ...selectedTraining,
        ...formData,
        target: parseInt(formData.target),
        achieved: parseInt(formData.achieved),
        beneficiaryMale: parseInt(formData.beneficiaryMale),
        beneficiaryFemale: parseInt(formData.beneficiaryFemale)
      };
      setTrainings((prev) =>
        prev.map((t) => (t.id === selectedTraining.id ? updatedTraining : t))
      );
    } else {
      // Add new training
      const newTraining: Training = {
        id: Date.now().toString(),
        ...formData,
        target: parseInt(formData.target),
        achieved: parseInt(formData.achieved),
        beneficiaryMale: parseInt(formData.beneficiaryMale),
        beneficiaryFemale: parseInt(formData.beneficiaryFemale),
        status: "Planned"
      };
      setTrainings((prev) => [...prev, newTraining]);
    }

    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedTraining(null);
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search trainings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedQuarter}
                onValueChange={setSelectedQuarter}
              >
                <SelectTrigger className="w-full cursor-pointer">
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
                <SelectTrigger className="w-full">
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
                <SelectTrigger className="w-full">
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
                  filteredTrainings.map((training) => (
                    <TableRow key={training.id}>
                      <TableCell className="font-medium">
                        {training.trainingId}
                      </TableCell>
                      <TableCell>{training.title}</TableCell>
                      <TableCell className="text-sm">
                        {training.project}
                      </TableCell>
                      <TableCell>b
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
                          className={` ${
                            training.status === "Completed"
                              ? "bg-green-500 text-white"
                              : "secondary"
                          }`}
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
