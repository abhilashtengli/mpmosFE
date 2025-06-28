import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, TrendingUp, BarChart3, FolderOpen } from "lucide-react";
import axios from "axios";
import { Base_Url } from "@/lib/constants";

interface QuickStat {
  label: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  colour: string;
}

interface StatsData {
  latestProjectReport: {
    id: string;
    project: { title: string };
    fileName: string;
    quarter: string;
    year: number;
    createdAt: string;
  } | null;
  latestCompiledReport: {
    id: string;
    fileName: string;
    quarter: string;
    year: number;
    createdAt: string;
  } | null;
  reportCounter: {
    count: number;
    updatedAt: string;
  } | null;
}

export default function QuickStatsSection() {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${Base_Url}/get-stats`, {
          withCredentials: true
        });

        if (!response.data.success) {
          throw new Error("Failed to fetch stats");
        }

        const result = await response.data;
        if (result.success) {
          setStatsData(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch stats");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  const getQuickStats = (): QuickStat[] => {
    if (!statsData) return [];

    return [
      {
        label: "Total Reports",
        value: statsData.reportCounter?.count?.toString() || "0",
        change: "Generated",
        icon: <FileText className="h-5 w-5 text-blue-600" />,
        colour: "border-l-blue-600"
      },
      {
        label: "Latest Project Report",
        value: statsData.latestProjectReport?.project?.title || "No reports",
        change: statsData.latestProjectReport
          ? `${statsData.latestProjectReport.quarter} ${statsData.latestProjectReport.year}`
          : "—",
        icon: <BarChart3 className="h-5 w-5 text-green-600" />,
        colour: "border-l-green-600"
      },
      {
        label: "Last Compiled Report On",
        value: statsData.latestCompiledReport
          ? formatDate(statsData.latestCompiledReport.createdAt)
          : "No reports",
        change: statsData.latestCompiledReport
          ? `${statsData.latestCompiledReport.quarter} ${statsData.latestCompiledReport.year}`
          : "—",
        icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
        colour: "border-l-purple-600"
      },
      {
        label: "Report Format",
        value: "Word",
        change: "Format",
        icon: <FolderOpen className="h-5 w-5 text-orange-600" />,
        colour: "border-l-orange-600"
      }
    ];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="hover:shadow-md border-l-4 border-l-gray-200 bg-white rounded-lg border transition-shadow duration-200 h-20"
          >
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-gray-200" />
                  <Skeleton className="h-8 w-16 bg-gray-200" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="md:col-span-4">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-red-600">
              Failed to load stats: {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quickStats = getQuickStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {quickStats.map((stat: QuickStat, index: number) => (
        <div
          key={index}
          className={`hover:shadow-md border border-l-4 ${stat.colour} bg-white shadow-sm h-20 rounded-lg transition-all duration-200 hover:scale-105`}
        >
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-x-1">
                    {stat.icon}
                    <p className="text-xs font-medium text-center text-gray-600">
                      {stat.label}
                    </p>
                  </div>

                  {stat.change && (
                    <Badge
                      variant="outline"
                      className="text-xs text-gray-500 border-gray-200 ml-2 shrink-0"
                    >
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <p className="text-md font-bold tracking-wide pl-3 text-gray-900 truncate max-w-[200px]">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
