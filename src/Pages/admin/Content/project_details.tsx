"use client";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Target,
  TrendingUp
} from "lucide-react";

// TypeScript interfaces
interface Beneficiaries {
  target: number;
  achieved: number;
  male: number;
  female: number;
}

interface ActivityProgress {
  target: number;
  achieved: number;
}

interface Activities {
  training: ActivityProgress;
  awareness: ActivityProgress;
  fld: ActivityProgress;
  infrastructure: ActivityProgress;
}

interface ProjectDetail {
  id: string;
  projectId: string;
  title: string;
  description: string;
  implementingAgency: string;
  director: string;
  locationState: string;
  budget: number;
  budgetUtilized: number;
  status: "Active" | "Completed" | "On Hold";
  startDate: string;
  endDate: string;
  progress: number;
  objectives: string[];
  beneficiaries: Beneficiaries;
  activities: Activities;
}

interface ProjectFormData {
  projectId: string;
  status: string;
  title: string;
  description: string;
  implementingAgency: string;
  director: string;
  budget: string;
  startDate: string;
  endDate: string;
  objectives: string;
}

interface ProjectDetailFormProps {
  project?: ProjectDetail;
  onSave: (data: ProjectFormData) => void;
  onClose: () => void;
  isEdit?: boolean;
}

const projectDetails: ProjectDetail[] = [
  {
    id: "1",
    projectId: "PROJ-2024-001",
    title: "Sustainable Agriculture Initiative",
    description:
      "Comprehensive program to promote sustainable farming practices across northeastern states",
    implementingAgency: "ICAR-NRCB",
    director: "Dr. John Smith",
    locationState: "Assam",
    budget: 500000.0,
    budgetUtilized: 350000.0,
    status: "Active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    progress: 70,
    objectives: [
      "Promote organic farming techniques",
      "Train 500 farmers in sustainable practices",
      "Establish 10 demonstration plots",
      "Reduce chemical fertilizer usage by 30%"
    ],
    beneficiaries: {
      target: 500,
      achieved: 350,
      male: 200,
      female: 150
    },
    activities: {
      training: { target: 20, achieved: 14 },
      awareness: { target: 15, achieved: 12 },
      fld: { target: 10, achieved: 8 },
      infrastructure: { target: 5, achieved: 3 }
    }
  },
  {
    id: "2",
    projectId: "PROJ-2024-002",
    title: "Water Management Project",
    description:
      "Implementation of efficient water management systems for improved agricultural productivity",
    implementingAgency: "State Agriculture Department",
    director: "Dr. Jane Doe",
    locationState: "West Bengal",
    budget: 750000.0,
    budgetUtilized: 600000.0,
    status: "Active",
    startDate: "2024-02-01",
    endDate: "2024-11-30",
    progress: 80,
    objectives: [
      "Install drip irrigation systems",
      "Train farmers on water conservation",
      "Establish water harvesting structures",
      "Improve crop yield by 25%"
    ],
    beneficiaries: {
      target: 300,
      achieved: 240,
      male: 140,
      female: 100
    },
    activities: {
      training: { target: 15, achieved: 12 },
      awareness: { target: 10, achieved: 9 },
      fld: { target: 8, achieved: 7 },
      infrastructure: { target: 12, achieved: 10 }
    }
  }
];

export default function ProjectDetailsAdPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const filteredProjects: ProjectDetail[] = projectDetails.filter(
    (project: ProjectDetail) => {
      const matchesSearch: boolean =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.projectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.director.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus: boolean =
        !selectedStatus ||
        selectedStatus === "all" ||
        project.status === selectedStatus;

      return matchesSearch && matchesStatus;
    }
  );

  const handleEdit = (project: ProjectDetail): void => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleSave = (data: ProjectFormData): void => {
    console.log("Saving project:", data);
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleGenerateReport = (projectId: string): void => {
    console.log("Generating report for project:", projectId);
  };

  const handleViewAnalytics = (projectId: string): void => {
    console.log("Viewing analytics for project:", projectId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Project Details
              </h1>
              <p className="text-sm text-gray-600">
                Detailed information about agricultural development projects
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Project Detail
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Project Details</DialogTitle>
                <DialogDescription>
                  Create detailed project information and tracking
                </DialogDescription>
              </DialogHeader>
              <ProjectDetailForm
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Project Details Cards */}
        <div className="space-y-8">
          {filteredProjects.map((project: ProjectDetail) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {project.description}
                    </CardDescription>
                    <div className="flex items-center space-x-4 mt-3">
                      <Badge variant="outline">{project.projectId}</Badge>
                      <Badge
                        variant={
                          project.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {project.progress}%
                    </div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Project Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">
                      Project Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Implementing Agency
                        </Label>
                        <p className="font-medium">
                          {project.implementingAgency}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Project Director
                        </Label>
                        <p className="font-medium">{project.director}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Location
                        </Label>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{project.locationState}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">
                          Duration
                        </Label>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          <span>
                            {project.startDate} to {project.endDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Budget Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Total Budget</span>
                          <span className="font-medium">
                            ₹{project.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Utilized</span>
                          <span className="font-medium text-green-600">
                            ₹{project.budgetUtilized.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={
                            (project.budgetUtilized / project.budget) * 100
                          }
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Remaining</span>
                          <span className="font-medium">
                            ₹
                            {(
                              project.budget - project.budgetUtilized
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Objectives */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Project Objectives
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.objectives.map(
                      (objective: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <Target className="h-4 w-4 mt-1 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{objective}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Beneficiaries and Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Beneficiaries
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">
                          Total Progress
                        </span>
                        <span className="text-sm font-bold">
                          {project.beneficiaries.achieved} /{" "}
                          {project.beneficiaries.target}
                        </span>
                      </div>
                      <Progress
                        value={
                          (project.beneficiaries.achieved /
                            project.beneficiaries.target) *
                          100
                        }
                        className="mb-3"
                      />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-600" />
                          <span>Male: {project.beneficiaries.male}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-pink-600" />
                          <span>Female: {project.beneficiaries.female}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Activity Progress
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Training</span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={
                              (project.activities.training.achieved /
                                project.activities.training.target) *
                              100
                            }
                            className="w-20"
                          />
                          <span className="text-sm font-medium">
                            {project.activities.training.achieved}/
                            {project.activities.training.target}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Awareness</span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={
                              (project.activities.awareness.achieved /
                                project.activities.awareness.target) *
                              100
                            }
                            className="w-20"
                          />
                          <span className="text-sm font-medium">
                            {project.activities.awareness.achieved}/
                            {project.activities.awareness.target}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">FLD</span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={
                              (project.activities.fld.achieved /
                                project.activities.fld.target) *
                              100
                            }
                            className="w-20"
                          />
                          <span className="text-sm font-medium">
                            {project.activities.fld.achieved}/
                            {project.activities.fld.target}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Infrastructure</span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={
                              (project.activities.infrastructure.achieved /
                                project.activities.infrastructure.target) *
                              100
                            }
                            className="w-20"
                          />
                          <span className="text-sm font-medium">
                            {project.activities.infrastructure.achieved}/
                            {project.activities.infrastructure.target}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => handleEdit(project)}>
                    Edit Details
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleGenerateReport(project.id)}
                  >
                    Generate Report
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleViewAnalytics(project.id)}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                No project details found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Project Details</DialogTitle>
              <DialogDescription>
                Update detailed project information and tracking
              </DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <ProjectDetailForm
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

function ProjectDetailForm({
  project,
  onSave,
  onClose,
  isEdit = false
}: ProjectDetailFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    project?.status || ""
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: ProjectFormData = {
      projectId: formData.get("projectId") as string,
      status: selectedStatus,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      implementingAgency: formData.get("implementingAgency") as string,
      director: formData.get("director") as string,
      budget: formData.get("budget") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      objectives: formData.get("objectives") as string
    };
    onSave(data);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="projectId">Project ID</Label>
          <Input
            id="projectId"
            name="projectId"
            placeholder="PROJ-2024-XXX"
            defaultValue={project?.projectId || ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            required
          >
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

      <div>
        <Label htmlFor="title">Project Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter project title"
          defaultValue={project?.title || ""}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter project description"
          defaultValue={project?.description || ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="implementingAgency">Implementing Agency</Label>
          <Input
            id="implementingAgency"
            name="implementingAgency"
            placeholder="Enter agency name"
            defaultValue={project?.implementingAgency || ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="director">Project Director</Label>
          <Input
            id="director"
            name="director"
            placeholder="Enter director name"
            defaultValue={project?.director || ""}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="budget">Total Budget</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            placeholder="Enter budget amount"
            defaultValue={project?.budget?.toString() || ""}
          />
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={project?.startDate || ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={project?.endDate || ""}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="objectives">Project Objectives</Label>
        <Textarea
          id="objectives"
          name="objectives"
          placeholder="Enter objectives (one per line)"
          defaultValue={project?.objectives?.join("\n") || ""}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {isEdit ? "Update Project Details" : "Save Project Details"}
        </Button>
      </div>
    </form>
  );
}
