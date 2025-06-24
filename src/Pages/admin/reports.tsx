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
import {
  BarChart3,
  Download,
  FileText,
  Search,
  Loader2,
  Calendar,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { useProjectStore } from "@/stores/useProjectStore";
import { Base_Url, quarterlyData } from "@/lib/constants";
import axios from "axios";

// TypeScript interfaces
interface QuickStat {
  label: string;
  value: string;
  change: string;
}

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

interface FormData {
  projectId: string;
  quarter: number;
  year: number;
}

interface FormErrors {
  projectId?: string;
  quarter?: string;
  year?: string;
}

const quickStats: QuickStat[] = [
  { label: "Total Reports Generated", value: "1,247", change: "+12%" },
  { label: "Last Report Generated", value: "2 hours ago", change: "Recent" },
  { label: "Most Downloaded", value: "Achievement Report", change: "Popular" },
  { label: "Export Formats", value: "Word", change: "Available" }
];

export default function ReportsAdPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(true);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(
    []
  );
  const [formData, setFormData] = useState<FormData>({
    projectId: "",
    quarter: 0,
    year: 0
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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
  }, []);

  const fetchGeneratedReports = async () => {
    try {
      setIsLoadingReports(true);

      const response = await axios.get(`${Base_Url}/get-project-reports`, {
        withCredentials: true
      });

      console.log("GR : ", response.data.data);
      if (response.data.success) {
        setGeneratedReports(response.data.data || []);
      } else {
        toast.error(response.data.data.message || "Failed to fetch reports");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleSelectChange = (
    field: keyof FormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user makes a selection
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.projectId) {
      errors.projectId = "Please select a project";
    }
    if (!formData.quarter) {
      errors.quarter = "Please select a quarter";
    }
    if (!formData.year) {
      errors.year = "Please select a year";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getQuarterId = (quarter: number, year: number): string | null => {
    const quarterData = quarterlyData.find(
      (q) => q.number === quarter && q.year === year
    );
    return quarterData ? quarterData.id : null;
  };

  const handleGenerateReport = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quarterId = getQuarterId(formData.quarter, formData.year);
    if (!quarterId) {
      toast.error("Invalid quarter and year combination");
      return;
    }

    try {
      setIsGenerating(true);
      const projectData = {
        projectId: formData.projectId,
        quarterId: quarterId
      };
      // const response = await fetch("/generate-report", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     projectId: formData.projectId,
      //     quarterId: quarterId
      //   })
      // });
      const response = await axios.post(`${Base_Url}/generate-report`, {
        withCredentials: true,
        projectData
      });

      const data = await response.data;

      if (data.success) {
        toast.success("Report generated successfully!");
        // Reset form
        setFormData({
          projectId: "",
          quarter: 0,
          year: 0
        });
        // Refresh the reports list
        await fetchGeneratedReports();
      } else {
        toast.error(data.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = async (fileUrl: string, fileName: string) => {
    try {
      toast.loading("Downloading report...");

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

      toast.dismiss();
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.dismiss();
      toast.error("Failed to download report");
    }
  };

  const filteredReports = generatedReports.filter(
    (report) =>
      report.project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.project.implementingAgency
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      report.quarter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.year.toString().includes(searchTerm)
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat: QuickStat, index: number) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Generate Report Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate New Report
            </CardTitle>
            <CardDescription>
              Select a project, quarter, and year to generate a comprehensive
              report
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
                    projects.find((p) => p.id === formData.projectId)?.title ||
                    ""
                  }
                  onValueChange={(value) => {
                    const selectedProject = projects.find(
                      (p) => p.title === value
                    );
                    if (selectedProject)
                      handleSelectChange("projectId", selectedProject.id);
                  }}
                >
                  <SelectTrigger
                    className={formErrors.projectId ? "border-red-500" : ""}
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
                {formErrors.projectId && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.projectId}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Quarter <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.quarter ? formData.quarter.toString() : ""}
                  onValueChange={(value) =>
                    handleSelectChange("quarter", Number.parseInt(value))
                  }
                >
                  <SelectTrigger
                    className={formErrors.quarter ? "border-red-500" : ""}
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
                {formErrors.quarter && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.quarter}
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Year <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.year ? formData.year.toString() : ""}
                  onValueChange={(value) =>
                    handleSelectChange("year", Number.parseInt(value))
                  }
                >
                  <SelectTrigger
                    className={formErrors.year ? "border-red-500" : ""}
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
                {formErrors.year && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.year}</p>
                )}
              </div>
            </div>

            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Search Reports</CardTitle>
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

        {/* Latest Generated Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Generated Reports</CardTitle>
            <CardDescription>
              Recently generated reports and downloads
              {filteredReports.length !== generatedReports.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredReports.length} of {generatedReports.length} shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingReports ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading reports...</span>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  {searchTerm
                    ? "No reports found matching your search"
                    : "No reports generated yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report: GeneratedReport) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
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
                        handleDownloadReport(report.fileUrl, report.fileName)
                      }
                      className="shrink-0"
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
      </div>
    </div>
  );
}
