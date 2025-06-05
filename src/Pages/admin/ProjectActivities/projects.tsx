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
import { FileText, Plus, Search, Calendar, Eye, Edit } from "lucide-react";

// TypeScript interfaces
interface Project {
  id: string;
  implementingAgency: string;
  title: string;
  locationState: string;
  director: string;
  budget: number;
  status: "Active" | "Completed" | "On Hold";
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface ProjectFormData {
  implementingAgency: string;
  title: string;
  locationState: string;
  director: string;
  budget: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface ProjectFormProps {
  project?: Project;
  onSave: (data: ProjectFormData) => void;
  onClose: () => void;
  isEdit?: boolean;
}

interface ProjectViewProps {
  project: Project;
}

const projects: Project[] = [
  {
    id: "1",
    implementingAgency: "ICAR-NRCB",
    title: "Sustainable Agriculture Initiative",
    locationState: "Assam",
    director: "Dr. John Smith",
    budget: 500000.0,
    status: "Active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    implementingAgency: "State Agriculture Department",
    title: "Water Management Project",
    locationState: "West Bengal",
    director: "Dr. Jane Doe",
    budget: 750000.0,
    status: "Active",
    startDate: "2024-02-01",
    endDate: "2024-11-30",
    createdAt: "2024-02-10"
  },
  {
    id: "3",
    implementingAgency: "Agricultural University",
    title: "Crop Diversification Program",
    locationState: "Odisha",
    director: "Dr. Robert Johnson",
    budget: 300000.0,
    status: "Completed",
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    createdAt: "2023-05-20"
  }
];

export default function ProjectsAdPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedAgency, setSelectedAgency] = useState<string>("");

  // Filter projects based on search and filter criteria
  const filteredProjects: Project[] = projects.filter((project: Project) => {
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
  });

  const handleView = (project: Project): void => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (project: Project): void => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleSave = (formData: ProjectFormData): void => {
    // In a real app, this would make an API call
    console.log("Saving project:", formData);
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
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
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="Assam">Assam</SelectItem>
                  <SelectItem value="West Bengal">West Bengal</SelectItem>
                  <SelectItem value="Odisha">Odisha</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Agency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  <SelectItem value="ICAR-NRCB">ICAR-NRCB</SelectItem>
                  <SelectItem value="State Agriculture Department">
                    State Agriculture Department
                  </SelectItem>
                  <SelectItem value="Agricultural University">
                    Agricultural University
                  </SelectItem>
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
                {filteredProjects.length === 0 ? (
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
                      <TableCell>₹{project.budget.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {project.startDate} to {project.endDate}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={` ${
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
            className={` mt-1 ${
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
          <p>{project.startDate}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">End Date</Label>
          <p>{project.endDate}</p>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-500">Created At</Label>
        <p>{project.createdAt}</p>
      </div>
    </div>
  );
}

function ProjectForm({
  project,
  onSave,
  onClose,
  isEdit = false
}: ProjectFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    project?.status || ""
  );
  const [selectedState, setSelectedState] = useState<string>(
    project?.locationState || ""
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: ProjectFormData = {
      implementingAgency: formData.get("implementingAgency") as string,
      title: formData.get("title") as string,
      locationState: selectedState,
      director: formData.get("director") as string,
      budget: formData.get("budget") as string,
      status: selectedStatus,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string
    };
    onSave(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="implementingAgency">Implementing Agency *</Label>
        <Input
          id="implementingAgency"
          name="implementingAgency"
          placeholder="Enter implementing agency name"
          defaultValue={project?.implementingAgency || ""}
          required
        />
      </div>

      <div>
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter project title (max 255 characters)"
          maxLength={255}
          defaultValue={project?.title || ""}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="locationState">Location State *</Label>
          <Select
            value={selectedState}
            onValueChange={setSelectedState}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Assam">Assam</SelectItem>
              <SelectItem value="West Bengal">West Bengal</SelectItem>
              <SelectItem value="Odisha">Odisha</SelectItem>
              <SelectItem value="Jharkhand">Jharkhand</SelectItem>
              <SelectItem value="Bihar">Bihar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="director">Director *</Label>
          <Input
            id="director"
            name="director"
            placeholder="Enter director name"
            defaultValue={project?.director || ""}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            step="0.01"
            placeholder="Enter budget amount"
            defaultValue={project?.budget?.toString() || ""}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={project?.startDate || ""}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={project?.endDate || ""}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {isEdit ? "Update Project" : "Save Project"}
        </Button>
      </div>
    </form>
  );
}
