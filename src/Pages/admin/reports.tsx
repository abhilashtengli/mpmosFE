"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Download,
  FileText,
  Search,
  Loader2,
  Calendar,
  Building,
  AlertCircle,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";
import { useProjectStore } from "@/stores/useProjectStore";
import { Base_Url, quarterlyData } from "@/lib/constants";
import axios, { type AxiosError, type AxiosResponse } from "axios";
import QuickStatsSection from "@/components/quick-stats";

interface GeneratedReport {
  id: string;
  project: {
    id: string;
    implementingAgency: string;
    title: string;
    locationState: string;
    director: string;
    budget: string;
    status: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
  };
  quarter: string;
  year: number;
  fileUrl: string;
  fileKey: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    name: string;
  };
}

interface CompiledReport {
  id: string;
  quarter: string;
  year: number;
  fileUrl: string;
  fileKey: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    name: string;
  };
}

interface ProjectFormData {
  projectId: string;
  quarter: number;
  year: number;
}

interface CompiledFormData {
  quarter: number;
  year: number;
}

interface FormErrors {
  projectId?: string;
  quarter?: string;
  year?: string;
}

interface ApiErrorData {
  success?: boolean;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
}

export default function ReportsAdPage() {
  const [activeTab, setActiveTab] = useState<string>("project");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [compiledSearchTerm, setCompiledSearchTerm] = useState<string>("");

  // Project Reports State
  const [isGeneratingProject, setIsGeneratingProject] =
    useState<boolean>(false);
  const [isLoadingProjectReports, setIsLoadingProjectReports] =
    useState<boolean>(true);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(
    []
  );
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
    projectId: "",
    quarter: 0,
    year: 0
  });
  const [projectFormErrors, setProjectFormErrors] = useState<FormErrors>({});

  // Compiled Reports State
  const [isGeneratingCompiled, setIsGeneratingCompiled] =
    useState<boolean>(false);
  const [isLoadingCompiledReports, setIsLoadingCompiledReports] =
    useState<boolean>(true);
  const [compiledReports, setCompiledReports] = useState<CompiledReport[]>([]);
  const [compiledFormData, setCompiledFormData] = useState<CompiledFormData>({
    quarter: 0,
    year: 0
  });
  const [compiledFormErrors, setCompiledFormErrors] = useState<FormErrors>({});

  // Get projects from store
  const projects = useProjectStore((state) => state.projects);

  // Get unique project titles
  const uniqueProjectTitle = Array.from(
    new Set(projects.map((project) => project.title))
  );

  // Get unique years and quarters for dropdowns
  const availableYears = Array.from(
    new Set(quarterlyData.map((q) => q.year))
  ).sort((a, b) => b + a);

  const quarters = [1, 2, 3, 4];

  useEffect(() => {
    fetchGeneratedReports();
    fetchCompiledReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Error handling helper for actual errors
  const handleApiError = (
    error: AxiosError<ApiErrorData>,
    defaultMessage: string
  ) => {
    console.error("API Error:", error);

    if (error.response?.data?.error) {
      const { code, message } = error.response.data.error;

      switch (code) {
        case "UNAUTHORIZED":
          toast.error("Authentication Error", {
            description: "Please log in again to continue."
          });
          break;
        case "VALIDATION_ERROR":
          toast.error("Validation Error", {
            description: message || "Please check your input and try again."
          });
          break;
        case "PROJECT_NOT_FOUND":
        case "QUARTER_NOT_FOUND":
          toast.error("Not Found", {
            description: message || "The requested resource was not found."
          });
          break;
        case "ACCESS_DENIED":
          toast.error("Access Denied", {
            description: "You don't have permission to access this resource."
          });
          break;
        case "NO_ACTIVITIES_FOUND":
          toast.error("No Data Available", {
            description: "No activities found for the selected criteria."
          });
          break;
        case "DATABASE_ERROR":
          toast.error("Database Error", {
            description:
              message || "Database operation failed. Please try again."
          });
          break;
        case "FILE_UPLOAD_ERROR":
          toast.error("Upload Error", {
            description: "Failed to upload the report file. Please try again."
          });
          break;
        case "REPORT_GENERATION_ERROR":
          toast.error("Report Generation Error", {
            description: "Failed to generate the report document."
          });
          break;
        default:
          toast.error("Error", {
            description: message || defaultMessage
          });
      }
    } else if (error.response?.status === 401) {
      toast.error("Authentication Required", {
        description: "Please log in to continue."
      });
    } else if (error.response?.status === 403) {
      toast.error("Access Denied", {
        description: "You don't have permission to perform this action."
      });
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error("Server Error", {
        description: "Something went wrong on our end. Please try again later."
      });
    } else {
      toast.error("Error", {
        description: defaultMessage
      });
    }
  };

  // Error handling helper for failed responses
  const handleFailedResponse = (
    response: AxiosResponse<ApiErrorData>,
    defaultMessage: string
  ) => {
    console.error("Failed Response:", response);

    if (response.data?.error) {
      const { code, message } = response.data.error;

      switch (code) {
        case "UNAUTHORIZED":
          toast.error("Authentication Error", {
            description: "Please log in again to continue."
          });
          break;
        case "VALIDATION_ERROR":
          toast.error("Validation Error", {
            description: message || "Please check your input and try again."
          });
          break;
        case "PROJECT_NOT_FOUND":
        case "QUARTER_NOT_FOUND":
          toast.error("Not Found", {
            description: message || "The requested resource was not found."
          });
          break;
        case "ACCESS_DENIED":
          toast.error("Access Denied", {
            description: "You don't have permission to access this resource."
          });
          break;
        case "NO_ACTIVITIES_FOUND":
          toast.error("No Data Available", {
            description: "No activities found for the selected criteria."
          });
          break;
        case "DATABASE_ERROR":
          toast.error("Database Error", {
            description:
              message || "Database operation failed. Please try again."
          });
          break;
        case "FILE_UPLOAD_ERROR":
          toast.error("Upload Error", {
            description: "Failed to upload the report file. Please try again."
          });
          break;
        case "REPORT_GENERATION_ERROR":
          toast.error("Report Generation Error", {
            description: "Failed to generate the report document."
          });
          break;
        default:
          toast.error("Error", {
            description: message || defaultMessage
          });
      }
    } else {
      toast.error("Error", {
        description: response.data?.message || defaultMessage
      });
    }
  };

  const fetchGeneratedReports = async () => {
    try {
      setIsLoadingProjectReports(true);
      const response = await axios.get(`${Base_Url}/get-project-reports`, {
        withCredentials: true
      });

      if (response.data.success) {
        setGeneratedReports(response.data.data || []);
      } else {
        handleFailedResponse(response, "Failed to fetch project reports");
      }
    } catch (error) {
      handleApiError(
        error as AxiosError<ApiErrorData>,
        "Failed to fetch project reports"
      );
    } finally {
      setIsLoadingProjectReports(false);
    }
  };

  const fetchCompiledReports = async () => {
    try {
      setIsLoadingCompiledReports(true);
      const response = await axios.get(`${Base_Url}/get-compiled-reports`, {
        withCredentials: true
      });

      if (response.data.success) {
        setCompiledReports(response.data.data || []);
      } else {
        handleFailedResponse(response, "Failed to fetch compiled reports");
      }
    } catch (error) {
      handleApiError(
        error as AxiosError<ApiErrorData>,
        "Failed to fetch compiled reports"
      );
    } finally {
      setIsLoadingCompiledReports(false);
    }
  };

  const handleProjectSelectChange = (
    field: keyof ProjectFormData,
    value: string | number
  ) => {
    setProjectFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    if (projectFormErrors[field]) {
      setProjectFormErrors((prev) => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleCompiledSelectChange = (
    field: keyof CompiledFormData,
    value: string | number
  ) => {
    setCompiledFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    if (compiledFormErrors[field]) {
      setCompiledFormErrors((prev) => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateProjectForm = (): boolean => {
    const errors: FormErrors = {};

    if (!projectFormData.projectId) {
      errors.projectId = "Please select a project";
    }
    if (!projectFormData.quarter) {
      errors.quarter = "Please select a quarter";
    }
    if (!projectFormData.year) {
      errors.year = "Please select a year";
    }

    setProjectFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCompiledForm = (): boolean => {
    const errors: FormErrors = {};

    if (!compiledFormData.quarter) {
      errors.quarter = "Please select a quarter";
    }
    if (!compiledFormData.year) {
      errors.year = "Please select a year";
    }

    setCompiledFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getQuarterId = (quarter: number, year: number): string | null => {
    const quarterData = quarterlyData.find(
      (q) => q.number === quarter && q.year === year
    );
    return quarterData ? quarterData.id : null;
  };

  const handleGenerateProjectReport = async () => {
    if (!validateProjectForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quarterId = getQuarterId(
      projectFormData.quarter,
      projectFormData.year
    );
    if (!quarterId) {
      toast.error("Invalid quarter and year combination");
      return;
    }

    try {
      setIsGeneratingProject(true);
      const requestData = {
        projectId: projectFormData.projectId,
        quarterId: quarterId
      };

      const response = await axios.post(
        `${Base_Url}/generate-project-report`,
        requestData,
        {
          withCredentials: true,
          validateStatus: (status: number) => status < 500
        }
      );

      if (response.data.success) {
        toast.success("Project report generated successfully!");
        setProjectFormData({
          projectId: "",
          quarter: 0,
          year: 0
        });
        setGeneratedReports((prevReports) => [
          response.data.data,
          ...prevReports
        ]);
        // await fetchGeneratedReports();
      } else {
        handleFailedResponse(response, "Failed to generate project report");
      }
    } catch (error) {
      handleApiError(
        error as AxiosError<ApiErrorData>,
        "Failed to generate project report"
      );
    } finally {
      setIsGeneratingProject(false);
    }
  };

  const handleGenerateCompiledReport = async () => {
    if (!validateCompiledForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quarterId = getQuarterId(
      compiledFormData.quarter,
      compiledFormData.year
    );
    if (!quarterId) {
      toast.error("Invalid quarter and year combination");
      return;
    }

    try {
      setIsGeneratingCompiled(true);
      const requestData = {
        quarterId: quarterId
      };

      const response = await axios.post(
        `${Base_Url}/generate-compiled-report`,
        requestData,
        {
          withCredentials: true,
          validateStatus: (status: number) => status < 500
        }
      );

      if (response.data.success) {
        toast.success("Compiled report generated successfully!");
        setCompiledFormData({
          quarter: 0,
          year: 0
        });
        setCompiledReports((prevReports) => [
          response.data.data,
          ...prevReports
        ]);
        // await fetchCompiledReports();
      } else {
        handleFailedResponse(response, "Failed to generate compiled report");
      }
    } catch (error) {
      handleApiError(
        error as AxiosError<ApiErrorData>,
        "Failed to generate compiled report"
      );
    } finally {
      setIsGeneratingCompiled(false);
    }
  };

  const handleDownloadReport = async (fileUrl: string, fileName: string) => {
    try {
      const loadingToast = toast.loading("Downloading report...");

      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    }
  };

  const filteredProjectReports = generatedReports.filter(
    (report) =>
      report.project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.project.implementingAgency
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.quarter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.year.toString().includes(searchTerm)
  );

  const filteredCompiledReports = compiledReports.filter(
    (report) =>
      report.quarter.toLowerCase().includes(compiledSearchTerm.toLowerCase()) ||
      report.year.toString().includes(compiledSearchTerm) ||
      report.User.name.toLowerCase().includes(compiledSearchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reports & Analytics
              </h1>
              <p className="text-sm text-gray-600">
                Generate comprehensive reports and export data
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Quick Stats */}
        <div>
          <QuickStatsSection />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger
              value="project"
              className="flex cursor-pointer items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Project Reports
            </TabsTrigger>
            <TabsTrigger
              value="compiled"
              className="flex cursor-pointer items-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              Compiled Reports
            </TabsTrigger>
          </TabsList>

          {/* Project Reports Tab */}
          <TabsContent value="project" className="space-y-6">
            {/* Generate Project Report Section */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generate New Project Report
                </CardTitle>
                <CardDescription>
                  Select a project, quarter, and year to generate a
                  comprehensive project report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label>
                      Project <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={
                        projects.find((p) => p.id === projectFormData.projectId)
                          ?.title || ""
                      }
                      onValueChange={(value) => {
                        const selectedProject = projects.find(
                          (p) => p.title === value
                        );
                        if (selectedProject)
                          handleProjectSelectChange(
                            "projectId",
                            selectedProject.id
                          );
                      }}
                    >
                      <SelectTrigger
                        className={
                          projectFormErrors.projectId ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueProjectTitle.map((title) => (
                          <SelectItem key={title} value={title}>
                            {title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {projectFormErrors.projectId && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {projectFormErrors.projectId}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>
                      Quarter <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={
                        projectFormData.quarter
                          ? projectFormData.quarter.toString()
                          : ""
                      }
                      onValueChange={(value) =>
                        handleProjectSelectChange(
                          "quarter",
                          Number.parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger
                        className={
                          projectFormErrors.quarter ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select quarter" />
                      </SelectTrigger>
                      <SelectContent>
                        {quarters.map((quarter) => (
                          <SelectItem key={quarter} value={quarter.toString()}>
                            Q{quarter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {projectFormErrors.quarter && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {projectFormErrors.quarter}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>
                      Year <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={
                        projectFormData.year
                          ? projectFormData.year.toString()
                          : ""
                      }
                      onValueChange={(value) =>
                        handleProjectSelectChange(
                          "year",
                          Number.parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger
                        className={
                          projectFormErrors.year ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {projectFormErrors.year && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {projectFormErrors.year}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateProjectReport}
                  disabled={isGeneratingProject}
                  className="bg-green-600 hover:bg-green-700 transition-colors duration-200"
                >
                  {isGeneratingProject ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Project Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Search Project Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Search Project Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by project name, agency, quarter, or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Latest Project Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Project Reports</CardTitle>
                <CardDescription>
                  Recently generated project reports and downloads
                  {filteredProjectReports.length !==
                    generatedReports.length && (
                    <span className="text-green-600">
                      {" "}
                      ({filteredProjectReports.length} of{" "}
                      {generatedReports.length} shown)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProjectReports ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">
                      Loading reports...
                    </span>
                  </div>
                ) : filteredProjectReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">
                      {searchTerm
                        ? "No project reports found matching your search"
                        : "No project reports generated yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProjectReports.map((report: GeneratedReport) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200 hover:shadow-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FileText className="h-6 w-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 flex gap-x-2">
                              {report.project.title}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {report.quarter} {report.year}
                              </span>
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {report.project.implementingAgency}
                              </span>
                              <span>Generated by {report.User.name}</span>
                              <span>{formatDate(report.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {report.project.locationState}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {report.project.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadReport(
                              report.fileUrl,
                              report.fileName
                            )
                          }
                          className="shrink-0 hover:bg-green-50 hover:border-green-200 transition-colors duration-200"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compiled Reports Tab */}
          <TabsContent value="compiled" className="space-y-6">
            {/* Generate Compiled Report Section */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Generate New Compiled Report
                </CardTitle>
                <CardDescription>
                  Select quarter and year to generate a comprehensive compiled
                  report across all projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>
                      Quarter <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={
                        compiledFormData.quarter
                          ? compiledFormData.quarter.toString()
                          : ""
                      }
                      onValueChange={(value) =>
                        handleCompiledSelectChange(
                          "quarter",
                          Number.parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger
                        className={
                          compiledFormErrors.quarter ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select quarter" />
                      </SelectTrigger>
                      <SelectContent>
                        {quarters.map((quarter) => (
                          <SelectItem key={quarter} value={quarter.toString()}>
                            Q{quarter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {compiledFormErrors.quarter && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {compiledFormErrors.quarter}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>
                      Year <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={
                        compiledFormData.year
                          ? compiledFormData.year.toString()
                          : ""
                      }
                      onValueChange={(value) =>
                        handleCompiledSelectChange(
                          "year",
                          Number.parseInt(value)
                        )
                      }
                    >
                      <SelectTrigger
                        className={
                          compiledFormErrors.year ? "border-red-500" : ""
                        }
                      >
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {compiledFormErrors.year && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {compiledFormErrors.year}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateCompiledReport}
                  disabled={isGeneratingCompiled}
                  className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  {isGeneratingCompiled ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Compiled Report...
                    </>
                  ) : (
                    <>
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Generate Compiled Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Search Compiled Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Search Compiled Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by quarter, year, or generated by..."
                    value={compiledSearchTerm}
                    onChange={(e) => setCompiledSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Latest Compiled Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Compiled Reports</CardTitle>
                <CardDescription>
                  Recently generated compiled reports and downloads
                  {filteredCompiledReports.length !==
                    compiledReports.length && (
                    <span className="text-blue-600">
                      {" "}
                      ({filteredCompiledReports.length} of{" "}
                      {compiledReports.length} shown)
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCompiledReports ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-600">
                      Loading compiled reports...
                    </span>
                  </div>
                ) : filteredCompiledReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">
                      {compiledSearchTerm
                        ? "No compiled reports found matching your search"
                        : "No compiled reports generated yet"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredCompiledReports.map((report: CompiledReport) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200 hover:shadow-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FolderOpen className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 flex gap-x-2">
                              Compiled Report
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {report.quarter} {report.year}
                              </span>
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>Generated by {report.User.name}</span>
                              <span>{formatDate(report.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {report.quarter} {report.year}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                              >
                                Compiled Report
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownloadReport(
                              report.fileUrl,
                              report.fileName
                            )
                          }
                          className="shrink-0 hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
