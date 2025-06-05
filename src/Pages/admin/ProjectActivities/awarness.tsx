import type React from "react";

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
import { Users, Plus, Search, ImageIcon, Eye, Edit } from "lucide-react";

// Define the interface for awareness program data
interface AwarenessProgram {
  id: string;
  awarnessprogramId: string;
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
  status: string;
}
interface AwarenessViewProps {
  program: AwarenessProgram;
}
interface AwarenessFormProps {
  program?: AwarenessProgram;
  onSave: (data: Partial<AwarenessProgram>) => void;
  onClose: () => void;
  isEdit?: boolean;
}

// Sample data
const awarenessPrograms: AwarenessProgram[] = [
  {
    id: "1",
    awarnessprogramId: "AWR-2024-001",
    title: "Nutrition Awareness Campaign",
    project: "Health & Nutrition Initiative",
    quarter: "Q2 2024",
    target: 100,
    achieved: 95,
    district: "Guwahati",
    village: "Khanapara",
    block: "Dispur",
    beneficiaryMale: 45,
    beneficiaryFemale: 50,
    units: "Participants",
    status: "Completed"
  },
  {
    id: "2",
    awarnessprogramId: "AWR-2024-002",
    title: "Sustainable Farming Practices",
    project: "Environmental Awareness Project",
    quarter: "Q2 2024",
    target: 80,
    achieved: 75,
    district: "Jorhat",
    village: "Teok",
    block: "Jorhat",
    beneficiaryMale: 35,
    beneficiaryFemale: 40,
    units: "Participants",
    status: "Completed"
  }
];

export default function AwarenessAdPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedProgram, setSelectedProgram] =
    useState<AwarenessProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [quarterFilter, setQuarterFilter] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");

  const handleView = (program: AwarenessProgram) => {
    setSelectedProgram(program);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (program: AwarenessProgram) => {
    setSelectedProgram(program);
    setIsEditDialogOpen(true);
  };

  const handleSave = (formData: Partial<AwarenessProgram>) => {
    console.log("Saving program:", formData);
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const filteredPrograms = awarenessPrograms.filter((program) => {
    const matchesSearch =
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.awarnessprogramId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      program.project.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQuarter =
      quarterFilter === "" ||
      quarterFilter === "all" ||
      program.quarter === quarterFilter;
    const matchesProject =
      projectFilter === "" ||
      projectFilter === "all" ||
      program.project === projectFilter;
    const matchesDistrict =
      districtFilter === "" ||
      districtFilter === "all" ||
      program.district.toLowerCase() === districtFilter.toLowerCase();

    return matchesSearch && matchesQuarter && matchesProject && matchesDistrict;
  });

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
                New Awareness Program
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={quarterFilter} onValueChange={setQuarterFilter}>
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
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="Health & Nutrition Initiative">
                    Health & Nutrition Initiative
                  </SelectItem>
                  <SelectItem value="Environmental Awareness Project">
                    Environmental Awareness Project
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  <SelectItem value="guwahati">Guwahati</SelectItem>
                  <SelectItem value="jorhat">Jorhat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Awareness Programs</CardTitle>
            <CardDescription>
              List of all awareness programs with target vs achievement tracking
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
                {filteredPrograms.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">
                      {program.awarnessprogramId}
                    </TableCell>
                    <TableCell>{program.title}</TableCell>
                    <TableCell className="text-sm">{program.project}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{program.quarter}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {program.district}, {program.village}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">
                          {program.achieved}
                        </span>
                        <span className="text-gray-400">
                          {" "}
                          / {program.target}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>M: {program.beneficiaryMale}</div>
                        <div>F: {program.beneficiaryFemale}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={` ${
                          program.status === "Completed"
                            ? "bg-green-500 text-white"
                            : "secondary"
                        }`}
                      >
                        {program.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(program)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(program)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Program Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Awareness Program Details</DialogTitle>
              <DialogDescription>
                View complete awareness program information
              </DialogDescription>
            </DialogHeader>
            {selectedProgram && <AwarenessView program={selectedProgram} />}
          </DialogContent>
        </Dialog>

        {/* Edit Program Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Awareness Program</DialogTitle>
              <DialogDescription>
                Update awareness program information
              </DialogDescription>
            </DialogHeader>
            {selectedProgram && (
              <AwarenessForm
                program={selectedProgram}
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

function AwarenessView({ program }: AwarenessViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Program ID
          </Label>
          <p className="text-lg font-semibold">{program.awarnessprogramId}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Status</Label>
          <Badge
            className={`mt-1 ${
              program.status === "Completed"
                ? "bg-green-500 text-white"
                : "secondary"
            }`}
          >
            {program.status}
          </Badge>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500">
          Program Title
        </Label>
        <p className="text-lg">{program.title}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          <p>{program.project}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <p>{program.quarter}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">District</Label>
          <p>{program.district}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Village</Label>
          <p>{program.village}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Block</Label>
          <p>{program.block}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Target</Label>
          <p className="text-lg font-semibold text-gray-600">
            {program.target}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Achieved</Label>
          <p className="text-lg font-semibold text-green-600">
            {program.achieved}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Units</Label>
          <p>{program.units}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Male Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-blue-600">
            {program.beneficiaryMale}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Female Beneficiaries
          </Label>
          <p className="text-lg font-semibold text-pink-600">
            {program.beneficiaryFemale}
          </p>
        </div>
      </div>
    </div>
  );
}

function AwarenessForm({
  program,
  onSave,
  onClose,
  isEdit = false
}: AwarenessFormProps) {
  const [formData, setFormData] = useState<Partial<AwarenessProgram>>({
    awarnessprogramId: program?.awarnessprogramId || "",
    title: program?.title || "",
    project: program?.project || "",
    quarter: program?.quarter || "",
    target: program?.target || 0,
    achieved: program?.achieved || 0,
    district: program?.district || "",
    village: program?.village || "",
    block: program?.block || "",
    beneficiaryMale: program?.beneficiaryMale || 0,
    beneficiaryFemale: program?.beneficiaryFemale || 0,
    units: program?.units || "",
    status: program?.status || "In Progress"
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: Number.parseInt(value) || 0
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
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
          <Label htmlFor="awarnessprogramId">Program ID</Label>
          <Input
            id="awarnessprogramId"
            placeholder="AWR-2024-XXX"
            value={formData.awarnessprogramId}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="project">Project</Label>
          <Select
            value={formData.project}
            onValueChange={(value) => handleSelectChange("project", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Health & Nutrition Initiative">
                Health & Nutrition Initiative
              </SelectItem>
              <SelectItem value="Environmental Awareness Project">
                Environmental Awareness Project
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Program Title</Label>
        <Input
          id="title"
          placeholder="Enter program title (max 100 characters)"
          maxLength={100}
          value={formData.title}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quarter">Quarter</Label>
          <Select
            value={formData.quarter}
            onValueChange={(value) => handleSelectChange("quarter", value)}
          >
            <SelectTrigger className="">
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
            onChange={handleChange}
            className=""
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
            onChange={handleNumberChange}
          />
        </div>
        <div>
          <Label htmlFor="achieved">Achieved</Label>
          <Input
            id="achieved"
            type="number"
            placeholder="Enter achieved number"
            value={formData.achieved}
            onChange={handleNumberChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            placeholder="District name"
            maxLength={100}
            value={formData.district}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="village">Village</Label>
          <Input
            id="village"
            placeholder="Village name"
            maxLength={100}
            value={formData.village}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="block">Block</Label>
          <Input
            id="block"
            placeholder="Block name"
            maxLength={100}
            value={formData.block}
            onChange={handleChange}
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
            onChange={handleNumberChange}
          />
        </div>
        <div>
          <Label htmlFor="beneficiaryFemale">Female Beneficiaries</Label>
          <Input
            id="beneficiaryFemale"
            type="number"
            placeholder="0"
            value={formData.beneficiaryFemale}
            onChange={handleNumberChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">Program Image</Label>
        <div className="flex items-center space-x-2 mt-2">
          <Button type="button" variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {isEdit ? "Update Program" : "Save Program"}
        </Button>
      </div>
    </form>
  );
}
