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
import { Package, Plus, Search, ImageIcon, Eye, Edit } from "lucide-react";

interface InputDistribution {
  id: string;
  inputDistId: string;
  activityType: string;
  customActivityType?: string;
  name: string;
  project: string;
  quarter: string;
  target: number;
  achieved: number;
  district: string;
  village: string;
  block: string;
  units: string;
  remarks: string;
  status: string;
}

interface DistributionViewProps {
  distribution: InputDistribution;
}

interface InputDistributionFormProps {
  distribution?: InputDistribution;
  onSave: (data: FormData) => void;
  onClose: () => void;
  isEdit?: boolean;
}

const inputDistributions: InputDistribution[] = [
  {
    id: "1",
    inputDistId: "IND-2024-001",
    activityType: "Seed Distribution",
    name: "High Yield Rice Seeds",
    project: "Crop Improvement Program",
    quarter: "Q2 2024",
    target: 500,
    achieved: 480,
    district: "Guwahati",
    village: "Khanapara",
    block: "Dispur",
    units: "kg",
    remarks: "Distributed to 50 farmers",
    status: "Completed"
  },
  {
    id: "2",
    inputDistId: "IND-2024-002",
    activityType: "Fertilizers",
    name: "Organic Fertilizer Distribution",
    project: "Sustainable Agriculture Initiative",
    quarter: "Q2 2024",
    target: 200,
    achieved: 195,
    district: "Jorhat",
    village: "Teok",
    block: "Jorhat",
    units: "bags",
    remarks: "Organic fertilizer for vegetable cultivation",
    status: "Completed"
  },
  {
    id: "3",
    inputDistId: "IND-2024-003",
    activityType: "Other",
    customActivityType: "Bio-pesticides",
    name: "Neem-based Bio-pesticide",
    project: "Organic Farming Initiative",
    quarter: "Q2 2024",
    target: 100,
    achieved: 98,
    district: "Dibrugarh",
    village: "Naharkatiya",
    block: "Dibrugarh",
    units: "bottles",
    remarks: "Eco-friendly pest control solution",
    status: "Completed"
  }
];

export default function InputDistributionAdPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedDistribution, setSelectedDistribution] =
    useState<InputDistribution | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedActivityType, setSelectedActivityType] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  // Filter distributions based on search and filter criteria
  const filteredDistributions = inputDistributions.filter((distribution) => {
    const matchesSearch =
      distribution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distribution.inputDistId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      distribution.project.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActivityType =
      !selectedActivityType ||
      selectedActivityType === "all" ||
      distribution.activityType === selectedActivityType ||
      (selectedActivityType === "Other" &&
        distribution.activityType === "Other");
    const matchesQuarter =
      !selectedQuarter ||
      selectedQuarter === "all" ||
      distribution.quarter === selectedQuarter;
    const matchesProject =
      !selectedProject ||
      selectedProject === "all" ||
      distribution.project === selectedProject;
    const matchesDistrict =
      !selectedDistrict ||
      selectedDistrict === "all" ||
      distribution.district === selectedDistrict;

    return (
      matchesSearch &&
      matchesActivityType &&
      matchesQuarter &&
      matchesProject &&
      matchesDistrict
    );
  });

  const handleView = (distribution: InputDistribution): void => {
    setSelectedDistribution(distribution);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (distribution: InputDistribution): void => {
    setSelectedDistribution(distribution);
    setIsEditDialogOpen(true);
  };

  const handleSave = (formData: FormData): void => {
    console.log("Saving distribution:", formData);
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Package className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Input Distribution
              </h1>
              <p className="text-sm text-gray-600">
                Manage input distribution programs and track deliveries
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Input Distribution
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Input Distribution</DialogTitle>
                <DialogDescription>
                  Create a new input distribution entry
                </DialogDescription>
              </DialogHeader>
              <InputDistributionForm
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search distributions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedActivityType}
                onValueChange={setSelectedActivityType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Activity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Seed Distribution">
                    Seed Distribution
                  </SelectItem>
                  <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                  <SelectItem value="Pesticides">Pesticides</SelectItem>
                  <SelectItem value="Planting Materials">
                    Planting Materials
                  </SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedQuarter}
                onValueChange={setSelectedQuarter}
              >
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
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="Crop Improvement Program">
                    Crop Improvement Program
                  </SelectItem>
                  <SelectItem value="Sustainable Agriculture Initiative">
                    Sustainable Agriculture Initiative
                  </SelectItem>
                  <SelectItem value="Organic Farming Initiative">
                    Organic Farming Initiative
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger>
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

        <Card>
          <CardHeader>
            <CardTitle>Input Distribution Programs</CardTitle>
            <CardDescription>
              List of all input distribution activities
              {filteredDistributions.length !== inputDistributions.length && (
                <span className="text-green-600">
                  {" "}
                  ({filteredDistributions.length} of {inputDistributions.length}{" "}
                  shown)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Distribution ID</TableHead>
                  <TableHead>Activity Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Target/Achieved</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistributions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-8 text-gray-500"
                    >
                      No distributions found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDistributions.map((distribution) => (
                    <TableRow key={distribution.id}>
                      <TableCell className="font-medium">
                        {distribution.inputDistId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {distribution.activityType === "Other" &&
                          distribution.customActivityType
                            ? distribution.customActivityType
                            : distribution.activityType}
                        </Badge>
                      </TableCell>
                      <TableCell>{distribution.name}</TableCell>
                      <TableCell className="text-sm">
                        {distribution.project}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{distribution.quarter}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {distribution.district}, {distribution.village}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            {distribution.achieved}
                          </span>
                          <span className="text-gray-400">
                            {" "}
                            / {distribution.target}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{distribution.units}</TableCell>
                      <TableCell>
                        <Badge
                          className={` ${
                            distribution.status === "Completed"
                              ? "bg-green-500 text-white"
                              : "secondary"
                          }`}
                        >
                          {distribution.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(distribution)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(distribution)}
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

        {/* View Distribution Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Distribution Details</DialogTitle>
              <DialogDescription>
                View complete input distribution information
              </DialogDescription>
            </DialogHeader>
            {selectedDistribution && (
              <DistributionView distribution={selectedDistribution} />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Distribution Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Input Distribution</DialogTitle>
              <DialogDescription>
                Update input distribution information
              </DialogDescription>
            </DialogHeader>
            {selectedDistribution && (
              <InputDistributionForm
                distribution={selectedDistribution}
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

function DistributionView({ distribution }: DistributionViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Distribution ID
          </Label>
          <p className="text-lg font-semibold">{distribution.inputDistId}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Status</Label>
          <Badge
            className={`mt-1 ${
              distribution.status === "Completed"
                ? "bg-green-500 text-white"
                : "secondary"
            }`}
          >
            {distribution.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Activity Type
          </Label>
          <p className="text-lg">
            {distribution.activityType === "Other" &&
            distribution.customActivityType
              ? distribution.customActivityType
              : distribution.activityType}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Name/Description
          </Label>
          <p className="text-lg">{distribution.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Project</Label>
          <p>{distribution.project}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Quarter</Label>
          <p>{distribution.quarter}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">District</Label>
          <p>{distribution.district}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Village</Label>
          <p>{distribution.village}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Block</Label>
          <p>{distribution.block}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Target</Label>
          <p className="text-lg font-semibold text-gray-600">
            {distribution.target}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Achieved</Label>
          <p className="text-lg font-semibold text-green-600">
            {distribution.achieved}
          </p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Units</Label>
          <p>{distribution.units}</p>
        </div>
      </div>

      {distribution.remarks && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Remarks</Label>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
            {distribution.remarks}
          </p>
        </div>
      )}
    </div>
  );
}

function InputDistributionForm({
  distribution,
  onSave,
  onClose,
  isEdit = false
}: InputDistributionFormProps) {
  const [selectedActivityType, setSelectedActivityType] = useState<string>(
    distribution?.activityType || ""
  );
  const [showCustomInput, setShowCustomInput] = useState<boolean>(
    distribution?.activityType === "Other"
  );

  const handleActivityTypeChange = (value: string): void => {
    setSelectedActivityType(value);
    setShowCustomInput(value === "Other");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    onSave(formData);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="inputDistId">Distribution ID</Label>
          <Input
            id="inputDistId"
            name="inputDistId"
            placeholder="IND-2024-XXX"
            defaultValue={distribution?.inputDistId || ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="activityType">Activity Type</Label>
          <Select
            value={selectedActivityType}
            onValueChange={handleActivityTypeChange}
            name="activityType"
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Seed Distribution">
                Seed Distribution
              </SelectItem>
              <SelectItem value="Fertilizers">Fertilizers</SelectItem>
              <SelectItem value="Pesticides">Pesticides</SelectItem>
              <SelectItem value="Planting Materials">
                Planting Materials
              </SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conditional Custom Activity Type Input */}
      {showCustomInput && (
        <div>
          <Label htmlFor="customActivityType">Custom Activity Type</Label>
          <Input
            id="customActivityType"
            name="customActivityType"
            placeholder="Enter custom activity type"
            defaultValue={distribution?.customActivityType || ""}
            required={selectedActivityType === "Other"}
          />
        </div>
      )}

      <div>
        <Label htmlFor="name">Name/Description</Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter distribution name (max 200 characters)"
          maxLength={200}
          defaultValue={distribution?.name || ""}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="project">Project</Label>
          <Select
            name="project"
            defaultValue={distribution?.project || ""}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Crop Improvement Program">
                Crop Improvement Program
              </SelectItem>
              <SelectItem value="Sustainable Agriculture Initiative">
                Sustainable Agriculture Initiative
              </SelectItem>
              <SelectItem value="Organic Farming Initiative">
                Organic Farming Initiative
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="quarter">Quarter</Label>
          <Select
            name="quarter"
            defaultValue={distribution?.quarter || ""}
            required
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
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="target">Target</Label>
          <Input
            id="target"
            name="target"
            type="number"
            placeholder="Enter target"
            defaultValue={distribution?.target || ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="achieved">Achieved</Label>
          <Input
            id="achieved"
            name="achieved"
            type="number"
            placeholder="Enter achieved"
            defaultValue={distribution?.achieved || ""}
          />
        </div>
        <div>
          <Label htmlFor="units">Units</Label>
          <Input
            id="units"
            name="units"
            placeholder="kg, bags, packets"
            maxLength={20}
            defaultValue={distribution?.units || ""}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="district">District</Label>
          <Input
            id="district"
            name="district"
            placeholder="District name"
            maxLength={100}
            defaultValue={distribution?.district || ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="village">Village</Label>
          <Input
            id="village"
            name="village"
            placeholder="Village name"
            maxLength={100}
            defaultValue={distribution?.village || ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="block">Block</Label>
          <Input
            id="block"
            name="block"
            placeholder="Block name"
            maxLength={100}
            defaultValue={distribution?.block || ""}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          name="remarks"
          placeholder="Additional remarks (max 300 characters)"
          maxLength={300}
          defaultValue={distribution?.remarks || ""}
        />
      </div>

      <div>
        <Label htmlFor="image">Distribution Image</Label>
        <div className="flex items-center space-x-2">
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
          {isEdit ? "Update Distribution" : "Save Distribution"}
        </Button>
      </div>
    </form>
  );
}
