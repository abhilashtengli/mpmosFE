import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Cell,
  LineChart,
  Line
} from "recharts";
import {
  Users,
  TrendingUp,
  MapPin,
  Calendar,
  BookOpen,
  Sprout,
  Building,
  Package,
  GraduationCap,
  Activity,
  Target,
  Award
} from "lucide-react";
import { useProjectStore } from "@/stores/useProjectStore";
import { useEffect } from "react";

// Mock data for demonstration
const summaryData = {
  totalProjects: 45,
  activeProjects: 32,
  completedProjects: 13,
  totalBeneficiaries: 12450,
  maleBeneficiaries: 6890,
  femaleBeneficiaries: 5560,
  currentQuarter: "Q2 2024"
};

const activityData = [
  { name: "Training", target: 150, achieved: 142, percentage: 94.7 },
  { name: "Awareness Programs", target: 200, achieved: 185, percentage: 92.5 },
  { name: "FLD", target: 80, achieved: 75, percentage: 93.8 },
  { name: "Infrastructure Dev", target: 25, achieved: 22, percentage: 88.0 },
  { name: "Input Distribution", target: 300, achieved: 285, percentage: 95.0 }
];

const quarterlyData = [
  { quarter: "Q1 2024", target: 755, achieved: 709 },
  { quarter: "Q2 2024", target: 755, achieved: 709 },
  { quarter: "Q3 2024", target: 755, achieved: 0 },
  { quarter: "Q4 2024", target: 755, achieved: 0 }
];

const projectStatusData = [
  { name: "Active", value: 32, color: "#22c55e" },
  { name: "Completed", value: 13, color: "#16a34a" }
];

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
      return <GraduationCap className="h-4 w-4" />;
    case "Awareness Program":
      return <Users className="h-4 w-4" />;
    case "FLD":
      return <Sprout className="h-4 w-4" />;
    case "Infrastructure Dev":
      return <Building className="h-4 w-4" />;
    case "Input Distribution":
      return <Package className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

export default function DashboardAdPage() {
  //   const [selectedQuarter, setSelectedQuarter] = useState("Q2 2024");
  const { fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Sprout className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                AgriProject Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className="text-green-700 border-green-300"
            >
              {summaryData.currentQuarter}
            </Badge>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AD</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                Admin Director
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Projects
              </CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.totalProjects}
              </div>
              <p className="text-xs text-muted-foreground">
                {summaryData.activeProjects} active,{" "}
                {summaryData.completedProjects} completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Beneficiaries
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryData.totalBeneficiaries.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {summaryData.maleBeneficiaries.toLocaleString()} male,{" "}
                {summaryData.femaleBeneficiaries.toLocaleString()} female
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Quarter Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">93.9%</div>
              <Progress value={93.9} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                709 of 755 targets achieved
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Geographic Coverage
              </CardTitle>
              <MapPin className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                States covered across NEH region
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Achievement Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Achievement Overview</CardTitle>
                  <CardDescription>
                    Target vs Achievement across all activity types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                      <Bar dataKey="achieved" fill="#22c55e" name="Achieved" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Project Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                  <CardDescription>
                    Active vs Completed projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) =>
                          `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quarterly Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Quarterly Performance Trend</CardTitle>
                <CardDescription>
                  Target vs Achievement comparison across quarters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#e5e7eb"
                      strokeWidth={2}
                      name="Target"
                    />
                    <Line
                      type="monotone"
                      dataKey="achieved"
                      stroke="#22c55e"
                      strokeWidth={2}
                      name="Achieved"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>
                  Latest entries across all activity types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {activity.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{activity.type}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.date}
                        </p>
                        {activity.beneficiaries > 0 && (
                          <p className="text-xs text-green-600">
                            {activity.beneficiaries} beneficiaries
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activityData.map((activity) => (
                <Card
                  key={activity.name}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getActivityIcon(activity.name)}
                      <span>{activity.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Target:</span>
                        <span className="font-medium">{activity.target}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Achieved:</span>
                        <span className="font-medium text-green-600">
                          {activity.achieved}
                        </span>
                      </div>
                      <Progress value={activity.percentage} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {activity.percentage}% Complete
                        </span>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>
                  Manage and track agricultural development projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex space-x-2">
                    <Button variant="outline">Filter by State</Button>
                    <Button variant="outline">Filter by Status</Button>
                    <Button variant="outline">Filter by Director</Button>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Target className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </div>
                <div className="text-center py-12 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Project management interface would be implemented here</p>
                  <p className="text-sm">
                    Including CRUD operations, search, and filtering
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>
                  Generate comprehensive reports and export data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Award className="h-6 w-6 mb-2" />
                    <span>Achievement Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <span>Beneficiary Analysis</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <MapPin className="h-6 w-6 mb-2" />
                    <span>Geographic Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Calendar className="h-6 w-6 mb-2" />
                    <span>Quarterly Summary</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <span>Performance Trends</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span>Export Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
