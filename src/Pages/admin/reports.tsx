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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  BarChart3,
  Download,
  FileText,
  Users,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Search,
  Plus
} from "lucide-react";

// TypeScript interfaces
interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface QuickStat {
  label: string;
  value: string;
  change: string;
}

interface RecentReport {
  name: string;
  type: string;
  date: string;
  size: string;
}

const reportTypes: ReportType[] = [
  {
    id: "achievement",
    title: "Achievement Report",
    description:
      "Comprehensive report showing target vs achievement across all activities",
    icon: Award,
    color: "bg-green-100 text-green-700"
  },
  {
    id: "beneficiary",
    title: "Beneficiary Analysis",
    description: "Detailed analysis of beneficiaries with gender breakdown",
    icon: Users,
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: "geographic",
    title: "Geographic Report",
    description: "State-wise and district-wise project distribution analysis",
    icon: MapPin,
    color: "bg-purple-100 text-purple-700"
  },
  {
    id: "quarterly",
    title: "Quarterly Summary",
    description: "Quarter-wise performance summary and trends",
    icon: Calendar,
    color: "bg-orange-100 text-orange-700"
  },
  {
    id: "performance",
    title: "Performance Trends",
    description: "Long-term performance trends and comparative analysis",
    icon: TrendingUp,
    color: "bg-indigo-100 text-indigo-700"
  },
  {
    id: "project",
    title: "Project Status Report",
    description: "Detailed project status and budget utilization report",
    icon: Target,
    color: "bg-red-100 text-red-700"
  }
];

const quickStats: QuickStat[] = [
  { label: "Total Reports Generated", value: "1,247", change: "+12%" },
  { label: "Last Report Generated", value: "2 hours ago", change: "Recent" },
  { label: "Most Downloaded", value: "Achievement Report", change: "Popular" },
  { label: "Export Formats", value: "PDF, Excel, CSV", change: "Available" }
];

const recentReports: RecentReport[] = [
  {
    name: "Q2 2024 Achievement Report",
    type: "PDF",
    date: "2024-06-05",
    size: "2.4 MB"
  },
  {
    name: "Beneficiary Analysis May 2024",
    type: "Excel",
    date: "2024-06-04",
    size: "1.8 MB"
  },
  {
    name: "Geographic Distribution Report",
    type: "PDF",
    date: "2024-06-03",
    size: "3.1 MB"
  },
  {
    name: "Performance Trends Q1-Q2",
    type: "CSV",
    date: "2024-06-02",
    size: "0.9 MB"
  }
];

export default function ReportsAdPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const filteredReportTypes: ReportType[] = reportTypes.filter(
    (report: ReportType) => {
      const matchesSearch: boolean =
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType: boolean =
        !selectedType || selectedType === "all" || report.id === selectedType;

      return matchesSearch && matchesType;
    }
  );

  const handleGenerateReport = (reportId: string): void => {
    console.log("Generating report:", reportId);
    // In a real app, this would trigger report generation
  };

  const handleExportReport = (reportId: string): void => {
    console.log("Exporting report:", reportId);
    // In a real app, this would trigger report export
  };

  const handleDownloadReport = (reportName: string): void => {
    console.log("Downloading report:", reportName);
    // In a real app, this would trigger file download
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
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
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Custom Report
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Custom Report</DialogTitle>
                  <DialogDescription>
                    Configure and generate a custom report
                  </DialogDescription>
                </DialogHeader>
                <div className="p-4">
                  <p className="text-gray-600">
                    Custom report builder coming soon...
                  </p>
                </div>
              </DialogContent>
            </Dialog>
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

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {reportTypes.map((report: ReportType) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Report Types */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
            <CardDescription>
              Select a report type to generate and download
              {filteredReportTypes.length !== reportTypes.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredReportTypes.length} of {reportTypes.length} shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReportTypes.map((report: ReportType) => (
                <Card
                  key={report.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${report.color}`}>
                        <report.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {report.description}
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleGenerateReport(report.id)}
                          >
                            Generate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportReport(report.id)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredReportTypes.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  No reports found matching your criteria
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>
              Recently generated reports and downloads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReports.map((report: RecentReport, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      <p className="text-sm text-gray-500">
                        {report.type} • {report.date} • {report.size}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadReport(report.name)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
