"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Users,
  MapPin,
  Calendar,
  Sprout,
  Building,
  Package,
  GraduationCap,
  Activity,
  Target,
  Search,
  FileText,
  Download,
  Loader2,
  User
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import axios from "axios";
import { Base_Url } from "@/lib/constants";
import ChartShimmerLoader from "@/components/chart-shimmer";
import ShimmerPieChart from "@/components/pie-char-shimmer";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "@/stores/useProjectStore";
import { Skeleton } from "@/components/ui/skeleton";
import iimr from "@/assets/IIMR_logo.jpg";
import aicrp from "@/assets/AICRP_logo.png";
import cpgs from "@/assets/CPGS_logo.jpg";
// Types
interface DashboardStats {
  projectCount: number;
  maletotalBeneficiaries: number;
  femaletotalBeneficiaries: number;
  totalBeneficiaries: number;
}

interface TargetAchievedData {
  training: { target: number; achieved: number };
  awareness: { target: number; achieved: number };
  fld: { target: number; achieved: number };
  infrastructure: { target: number; achieved: number };
  inputDistribution: { target: number; achieved: number };
  project: {
    activeCount: number;
    completedCount: number;
    activePercentage: number;
    completedPercentage: number;
  };
}

interface GeneratedReport {
  id: string;
  fileName: string;
  fileUrl: string;
  quarter: string;
  year: number;
  createdAt: string;
  project: {
    title: string;
    implementingAgency: string;
    locationState: string;
    status: string;
  };
  User: {
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

// Fallback data
const fallbackStats: DashboardStats = {
  projectCount: 0,
  maletotalBeneficiaries: 0,
  femaletotalBeneficiaries: 0,
  totalBeneficiaries: 0
};

const fallbackTargetData: TargetAchievedData = {
  training: { target: 0, achieved: 0 },
  awareness: { target: 0, achieved: 0 },
  fld: { target: 0, achieved: 0 },
  infrastructure: { target: 0, achieved: 0 },
  inputDistribution: { target: 0, achieved: 0 },
  project: {
    activeCount: 0,
    completedCount: 0,
    activePercentage: 0,
    completedPercentage: 0
  }
};

const recentActivities = [
  {
    id: 1,
    type: "Training",
    title: "Organic Farming Workshop",
    location: "Assam, Guwahati",
    date: "2024-06-03",
    beneficiaries: 45
  },
  {
    id: 2,
    type: "FLD",
    title: "Rice Cultivation Demo",
    location: "West Bengal, Kolkata",
    date: "2024-06-02",
    beneficiaries: 0
  },
  {
    id: 3,
    type: "Input Distribution",
    title: "Seed Distribution Program",
    location: "Odisha, Bhubaneswar",
    date: "2024-06-01",
    beneficiaries: 0
  },
  {
    id: 4,
    type: "Awareness Program",
    title: "Nutrition Awareness",
    location: "Jharkhand, Ranchi",
    date: "2024-05-31",
    beneficiaries: 78
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "Training":
    case "training":
      return <GraduationCap className="h-4 w-4" />;
    case "Awareness Program":
    case "awareness":
      return <Users className="h-4 w-4" />;
    case "FLD":
    case "fld":
      return <Sprout className="h-4 w-4" />;
    case "Infrastructure Dev":
    case "infrastructure":
      return <Building className="h-4 w-4" />;
    case "Input Distribution":
    case "inputDistribution":
      return <Package className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "training":
      return "from-blue-500 to-blue-600";
    case "awareness":
      return "from-green-500 to-green-600";
    case "fld":
      return "from-yellow-500 to-yellow-600";
    case "infrastructure":
      return "from-purple-500 to-purple-600";
    case "inputDistribution":
      return "from-red-500 to-red-600";
    default:
      return "from-gray-500 to-gray-600";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export default function DashboardAdPage() {
  const user = useAuthStore((state) => state.user);

  // States
  const [stats, setStats] = useState<DashboardStats>(fallbackStats);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [targetData, setTargetData] =
    useState<TargetAchievedData>(fallbackTargetData);
  const [isTargetLoading, setIsTargetLoading] = useState(false);

  // Project Reports States
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [isLoadingProjectReports, setIsLoadingProjectReports] =
    useState<boolean>(true);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(
    []
  );

  // Compiled Reports States
  const [compiledSearchTerm, setCompiledSearchTerm] = useState("");
  const [isLoadingCompiledReports, setIsLoadingCompiledReports] =
    useState<boolean>(true);
  const [compiledReports, setCompiledReports] = useState<CompiledReport[]>([]);

  // UI States
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuthStore();
  const { fetchProjects } = useProjectStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddAdmin = () => {
    setIsOpen(false);
    navigate("/admin/signup");
  };
  const handleOpenProfile = () => {
    setIsOpen(false);
    navigate("/admin/profile");
  };

  const handleLogout = async () => {
    setIsOpen(false);
    logout();
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const response = await axios.get(`${Base_Url}/get-dashboard-stats`, {
        withCredentials: true
      });
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        toast.error("Failed to fetch dashboard stats");
        setStats(fallbackStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch dashboard stats");
      setStats(fallbackStats);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Fetch target achieved data
  const fetchTargetData = async () => {
    try {
      setIsTargetLoading(true);
      const response = await axios.get(
        `${Base_Url}/get-dashboard-target-achieved`,
        {
          withCredentials: true
        }
      );
      if (response.data.success) {
        setTargetData(response.data.data);
      } else {
        toast.error("Failed to fetch target data");
        setTargetData(fallbackTargetData);
      }
    } catch (error) {
      console.error("Error fetching target data:", error);
      toast.error("Failed to fetch target data");
      setTargetData(fallbackTargetData);
    } finally {
      setIsTargetLoading(false);
    }
  };

  // Fetch project reports
  const fetchGeneratedReports = async () => {
    try {
      setIsLoadingProjectReports(true);
      const response = await axios.get(`${Base_Url}/get-project-reports`, {
        withCredentials: true
      });
      if (response.data.success) {
        setGeneratedReports(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch project reports");
      }
    } catch (error) {
      console.error("Error fetching project reports:", error);
      toast.error("Failed to fetch project reports");
    } finally {
      setIsLoadingProjectReports(false);
    }
  };

  // Fetch compiled reports
  const fetchCompiledReports = async () => {
    try {
      setIsLoadingCompiledReports(true);
      const response = await axios.get(`${Base_Url}/get-compiled-reports`, {
        withCredentials: true
      });
      if (response.data.success) {
        setCompiledReports(response.data.data || []);
      } else {
        toast.error(
          response.data.message || "Failed to fetch compiled reports"
        );
      }
    } catch (error) {
      console.error("Error fetching compiled reports:", error);
      toast.error("Failed to fetch compiled reports");
    } finally {
      setIsLoadingCompiledReports(false);
    }
  };

  // Filter reports
  const filteredProjectReports = generatedReports.filter(
    (report) =>
      report.project.title
        .toLowerCase()
        .includes(projectSearchTerm.toLowerCase()) ||
      report.project.implementingAgency
        .toLowerCase()
        .includes(projectSearchTerm.toLowerCase()) ||
      report.quarter.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
      report.year.toString().includes(projectSearchTerm)
  );

  const filteredCompiledReports = compiledReports.filter(
    (report) =>
      report.quarter.toLowerCase().includes(compiledSearchTerm.toLowerCase()) ||
      report.year.toString().includes(compiledSearchTerm) ||
      report.User.name
        .toLowerCase()
        .includes(compiledSearchTerm.toLowerCase()) ||
      report.fileName.toLowerCase().includes(compiledSearchTerm.toLowerCase())
  );

  const handleDownloadReport = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchStats();
    fetchTargetData();
    fetchGeneratedReports();
    fetchCompiledReports();
  }, []);

  // Prepare chart data
  const activityChartData = [
    {
      name: "Training",
      target: targetData.training.target,
      achieved: targetData.training.achieved
    },
    {
      name: "Awareness",
      target: targetData.awareness.target,
      achieved: targetData.awareness.achieved
    },
    {
      name: "FLD",
      target: targetData.fld.target,
      achieved: targetData.fld.achieved
    },
    {
      name: "Infrastructure",
      target: targetData.infrastructure.target,
      achieved: targetData.infrastructure.achieved
    },
    {
      name: "Input Distribution",
      target: targetData.inputDistribution.target,
      achieved: targetData.inputDistribution.achieved
    }
  ];

  const projectStatusData = [
    { name: "Active", value: targetData.project.activeCount, color: "#22c55e" },
    {
      name: "Completed",
      value: targetData.project.completedCount,
      color: "#16a34a"
    }
  ];

  const activityCardsData = [
    {
      key: "training",
      name: "Training",
      target: targetData.training.target,
      achieved: targetData.training.achieved,
      percentage:
        targetData.training.target > 0
          ? (targetData.training.achieved / targetData.training.target) * 100
          : 0
    },
    {
      key: "awareness",
      name: "Awareness Programs",
      target: targetData.awareness.target,
      achieved: targetData.awareness.achieved,
      percentage:
        targetData.awareness.target > 0
          ? (targetData.awareness.achieved / targetData.awareness.target) * 100
          : 0
    },
    {
      key: "fld",
      name: "FLD",
      target: targetData.fld.target,
      achieved: targetData.fld.achieved,
      percentage:
        targetData.fld.target > 0
          ? (targetData.fld.achieved / targetData.fld.target) * 100
          : 0
    },
    {
      key: "infrastructure",
      name: "Infrastructure Dev",
      target: targetData.infrastructure.target,
      achieved: targetData.infrastructure.achieved,
      percentage:
        targetData.infrastructure.target > 0
          ? (targetData.infrastructure.achieved /
              targetData.infrastructure.target) *
            100
          : 0
    },
    {
      key: "inputDistribution",
      name: "Input Distribution",
      target: targetData.inputDistribution.target,
      achieved: targetData.inputDistribution.achieved,
      percentage:
        targetData.inputDistribution.target > 0
          ? (targetData.inputDistribution.achieved /
              targetData.inputDistribution.target) *
            100
          : 0
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex flex-wrap items-center gap-6">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                  <img
                    src={aicrp}
                    alt="AICRP on Sorghum and Millets"
                    className="rounded-full w-12 h-12 object-contain"
                  />
                </div>
                <div className=" w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                  <img
                    src={cpgs}
                    alt="CPGS Logo"
                    className=" rounded-full w-20 h-20 object-contain"
                  />
                </div>
                <div className="w-24 h-14 rounded- flex items-center justify-center shadow-md">
                  <img
                    src={iimr}
                    alt="IIMR Logo"
                    className="rounded-lg h-16 object-contain"
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-zinc-700">
                Millet Project Monitoring System Dashboard
              </h1>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            {/* User Profile Trigger */}
            <motion.div
              className="flex items-center space-x-4 cursor-pointer select-none"
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex items-center space-x-2 ">
                <motion.div
                  className="w-8 h-8 bg-green-600 rounded-full pb-0.5 flex items-center justify-center shadow-md"
                  whileHover={{
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                    scale: 1.05
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <span className="text-white text-sm font-medium">
                    {user?.name.slice(0, 2).toUpperCase()}
                  </span>
                </motion.div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium tracking-wider text-gray-700">
                    {user?.name}
                  </span>
                  <span className="text-[10px] tracking-widest text-green-900">
                    {user?.role === "admin" ? "Admin" : "Project diretor"}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.div>
              </div>
            </motion.div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.8
                  }}
                  className="absolute right-0 mt-2 overflow-hidden w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-2 z-50"
                  style={{
                    boxShadow:
                      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                >
                  {/* Add Admin Button */}
                  {user?.role === "admin" && (
                    <motion.button
                      onClick={handleAddAdmin}
                      className="w-full flex cursor-pointer rounded-lg items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                      whileHover={{ x: 1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }}
                    >
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 17
                        }}
                      >
                        <UserPlus className="w-4 h-4 text-blue-600" />
                      </motion.div>
                      <span className="text-sm font-medium">Add Admin</span>
                    </motion.button>
                  )}

                  {/* Divider */}
                  <div className="my-1 border-t border-gray-100" />

                  {/* Profile Button */}
                  <motion.button
                    onClick={handleOpenProfile}
                    className="w-full flex cursor-pointer rounded-lg items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-green-50 transition-colors duration-150"
                    whileHover={{ x: 1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }}
                    >
                      <User className="w-4 h-4 text-green-600" />
                    </motion.div>
                    <span className="text-sm font-medium">Profile</span>
                  </motion.button>

                  {/* Divider */}
                  <div className="my-1 border-t border-gray-100" />

                  {/* Logout Button */}
                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex cursor-pointer rounded-lg items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                    whileHover={{ x: 1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <motion.div
                      whileHover={{ rotate: -5, scale: 1.1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17
                      }}
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                    </motion.div>
                    <span className="text-sm font-medium">Logout</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Backdrop for mobile */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
                  onClick={() => setIsOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-3">
          <h1 className="text-xl font-semibold">Millet Promo-meter</h1>
          <h3 className="text-md text-gray-700">
            Real-time metrics of our impact in NEH
          </h3>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="border-l-4 border-l-green-500 bg-white shadow-md rounded-xl h-fit min-h-[70px] p-2">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              {isStatsLoading ? (
                <div className="flex items-center justify-between w-full  border-red-600 space-x-2">
                  <div className="flex items-center gap-x-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium">Total Projects</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold ">
                      <Skeleton className="h-6 w-12 bg-gray-200" />
                    </div>
                    <div className="text-[10px] ">
                      <Skeleton className="h-4 w-20 bg-gray-200" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-x-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium">Total Projects</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.projectCount}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {targetData.project.activeCount} active,{" "}
                      {targetData.project.completedCount} completed
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-l-4 border-l-blue-500 bg-white shadow-md border rounded-xl h-fit min-h-[70px] p-2">
            <div className="flex flex-row items-center justify-between w-full  space-y-0 pb-2">
              {" "}
              {isStatsLoading ? (
                <div className="flex items-center justify-between w-full space-x-2">
                  <div className="flex items-center gap-x-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium">Total Beneficiaries</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold ">
                      <Skeleton className="h-6 w-12 bg-gray-200" />
                    </div>
                    <div className="text-[10px] ">
                      <Skeleton className="h-4 w-20 bg-gray-200" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-x-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium">Total Beneficiaries</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold">
                      {stats.totalBeneficiaries.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {stats.maletotalBeneficiaries.toLocaleString()} male,{" "}
                      {stats.femaletotalBeneficiaries.toLocaleString()} female
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-l-4 border-l-purple-500 bg-white shadow-md border h-fit min-h-[70px] p-2 rounded-xl">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex gap-x-2 items-center">
                <MapPin className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-medium">Geographic Coverage</p>
              </div>
              <div>
                <div className="text-2xl font-bold">8</div>
                <p className="text-[10px] text-muted-foreground">
                  States covered across NEH region
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger className="cursor-pointer" value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="activities">
              Activities
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="reports">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Achievement Chart */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-gray-800">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <span>Activity Achievement Overview</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Target vs Achievement across all activity types
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {isTargetLoading ? (
                    <ChartShimmerLoader />
                  ) : (
                    <div className="bg-white rounded-lg pt-4  shadow-sm border-red-400">
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={activityChartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          barCategoryGap="20%"
                        >
                          <defs>
                            <linearGradient
                              id="targetGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#e5e7eb"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#d1d5db"
                                stopOpacity={0.6}
                              />
                            </linearGradient>
                            <linearGradient
                              id="achievedGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#22c55e"
                                stopOpacity={0.9}
                              />
                              <stop
                                offset="95%"
                                stopColor="#16a34a"
                                stopOpacity={0.7}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f1f5f9"
                            strokeOpacity={0.6}
                          />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={11}
                            tick={{ fill: "#64748b" }}
                            axisLine={{ stroke: "#e2e8f0" }}
                          />
                          <YAxis
                            fontSize={11}
                            tick={{ fill: "#64748b" }}
                            axisLine={{ stroke: "#e2e8f0" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "none",
                              borderRadius: "12px",
                              boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                              padding: "12px 16px"
                            }}
                            labelStyle={{
                              color: "#374151",
                              fontWeight: "600",
                              marginBottom: "4px"
                            }}
                            cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                          />
                          <Bar
                            dataKey="target"
                            fill="url(#targetGradient)"
                            name="Target"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                          />
                          <Bar
                            dataKey="achieved"
                            fill="url(#achievedGradient)"
                            name="Achieved"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={60}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Project Status Distribution */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-gray-800">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span>Project Status Distribution</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Active vs Completed projects breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {isTargetLoading ? (
                    <ShimmerPieChart />
                  ) : (
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <ResponsiveContainer width="100%" height={245}>
                        <PieChart>
                          <defs>
                            <linearGradient
                              id="activeGradient"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="1"
                            >
                              <stop offset="0%" stopColor="#22c55e" />
                              <stop offset="100%" stopColor="#16a34a" />
                            </linearGradient>
                            <linearGradient
                              id="completedGradient"
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="1"
                            >
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#1d4ed8" />
                            </linearGradient>
                          </defs>
                          <Pie
                            data={[
                              {
                                ...projectStatusData[0],
                                color: "url(#activeGradient)"
                              },
                              {
                                ...projectStatusData[1],
                                color: "url(#completedGradient)"
                              }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value, percent }) =>
                              `${name}: ${value} (${(percent * 100).toFixed(
                                0
                              )}%)`
                            }
                            outerRadius={90}
                            innerRadius={30}
                            fill="#8884d8"
                            dataKey="value"
                            stroke="#fff"
                            strokeWidth={3}
                          >
                            {projectStatusData.map((_entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  index === 0
                                    ? "url(#activeGradient)"
                                    : "url(#completedGradient)"
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "none",
                              borderRadius: "12px",
                              boxShadow:
                                "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                              padding: "12px 16px"
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Project Stats Summary */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-3 bg-gradient-to-r from-green-100 to-green-50 rounded-lg border border-green-200">
                          <div className="text-2xl font-bold text-green-700">
                            {targetData.project.activeCount}
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Active Projects
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-700">
                            {targetData.project.completedCount}
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            Completed Projects
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <span>Recent Activities</span>
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Latest entries across all activity types
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 hover:shadow-md hover:border-blue-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${
                              index % 4 === 0
                                ? "from-blue-500 to-blue-600"
                                : index % 4 === 1
                                ? "from-green-500 to-green-600"
                                : index % 4 === 2
                                ? "from-purple-500 to-purple-600"
                                : "from-orange-500 to-orange-600"
                            } shadow-lg`}
                          >
                            <div className="text-white">
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 text-sm">
                              {activity.title}
                            </h4>
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {activity.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${
                              activity.type === "Training"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : activity.type === "FLD"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : activity.type === "Input Distribution"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                          >
                            {activity.type}
                          </Badge>
                          <p className="text-xs text-gray-400 flex items-center justify-end">
                            <Calendar className="h-3 w-3 mr-1" />
                            {activity.date}
                          </p>
                          {activity.beneficiaries > 0 && (
                            <p className="text-xs text-green-600 font-medium flex items-center justify-end">
                              <Users className="h-3 w-3 mr-1" />
                              {activity.beneficiaries} beneficiaries
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activityCardsData.map((activity) => (
                <Card
                  key={activity.key}
                  className="hover:shadow-md transition-all duration-200 border border-gray-200 bg-white"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base font-semibold text-gray-800 min-h-[24px]">
                      <div className="flex items-center space-x-2 flex-1">
                        <div
                          className={`p-1.5 rounded-lg bg-gradient-to-r ${getActivityColor(
                            activity.key
                          )}`}
                        >
                          <div className="text-white">
                            {getActivityIcon(activity.key)}
                          </div>
                        </div>
                        <span className="truncate">{activity.name}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            Target
                          </div>
                          <div className="text-lg font-bold text-gray-800">
                            {activity.target.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            Achieved
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {activity.achieved.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {/* Progress Section */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Progress
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {activity.percentage.toFixed(1)}%
                          </span>
                        </div>
                        {/* Progress Bar Container */}
                        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getActivityColor(
                              activity.key
                            )} rounded-full transition-all duration-1000 ease-out transform origin-left`}
                            style={{
                              width: `${Math.min(
                                Math.max(activity.percentage, 0),
                                100
                              )}%`,
                              transform: "scaleX(1)",
                              animation: "progressSlide 1.5s ease-out forwards"
                            }}
                          />
                        </div>
                        {/* Status Badge */}
                        <div className="flex justify-center mt-3">
                          <Badge
                            variant={
                              activity.percentage >= 100
                                ? "default"
                                : activity.percentage >= 75
                                ? "secondary"
                                : "outline"
                            }
                            className={`text-xs px-2 py-1 ${
                              activity.percentage >= 100
                                ? "bg-green-100 text-green-800 border-green-200"
                                : activity.percentage >= 75
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : activity.percentage >= 50
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            {activity.percentage >= 100
                              ? "Completed"
                              : activity.percentage >= 75
                              ? "On Track"
                              : activity.percentage >= 50
                              ? "In Progress"
                              : activity.target === 0
                              ? "No Target Set"
                              : "Behind Schedule"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Nested Reports Tabs */}
            <Tabs defaultValue="project-reports" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger className="cursor-pointer" value="project-reports">
                  Project Reports
                </TabsTrigger>
                <TabsTrigger
                  className="cursor-pointer"
                  value="compiled-reports"
                >
                  Compiled Reports
                </TabsTrigger>
              </TabsList>

              {/* Project Reports Tab */}
              <TabsContent value="project-reports" className="space-y-6">
                {/* Search Section */}
                <Card className="mb-6">
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
                        value={projectSearchTerm}
                        onChange={(e) => setProjectSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Reports</CardTitle>
                    <CardDescription>
                      Generated reports for individual projects
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
                          Loading project reports...
                        </span>
                      </div>
                    ) : filteredProjectReports.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">
                          {projectSearchTerm
                            ? "No project reports found matching your search"
                            : "No project reports generated yet"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredProjectReports.map(
                          (report: GeneratedReport) => (
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
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {report.project.locationState}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
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
                                className="shrink-0"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Compiled Reports Tab */}
              <TabsContent value="compiled-reports" className="space-y-6">
                {/* Search Section */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Search Compiled Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by quarter, year, filename, or generated by..."
                        value={compiledSearchTerm}
                        onChange={(e) => setCompiledSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compiled Reports</CardTitle>
                    <CardDescription>
                      Comprehensive reports compiled across multiple projects
                      {filteredCompiledReports.length !==
                        compiledReports.length && (
                        <span className="text-green-600">
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
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">
                          {compiledSearchTerm
                            ? "No compiled reports found matching your search"
                            : "No compiled reports generated yet"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredCompiledReports.map(
                          (report: CompiledReport) => (
                            <div
                              key={report.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 flex gap-x-2 items-center">
                                    <span>Compiled Report</span>
                                    <span className="flex items-center gap-1 text-sm">
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
                                  <p className="text-xs text-gray-400 mt-1">
                                    File: {report.fileName}
                                  </p>
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
                                className="shrink-0"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <style>{`
        @keyframes progressSlide {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
