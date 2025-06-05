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
import { Building, Plus, Search, ImageIcon, Eye, Pencil } from "lucide-react";

// Define the interface for infrastructure data
interface Infrastructure {
  id: string;
  infraDevId: string;
  project: string;
  quarter: string;
  target: number;
  achieved: number;
  district: string;
  village: string;
  block: string;
  remarks: string;
  status: string;
}

interface InfrastructureFormProps {
  onClose: () => void;
  onSave: (data: Partial<Infrastructure>) => void;
  infra?: Infrastructure;
}

interface InfrastructureViewProps {
  infra: Infrastructure;
  onClose: () => void;
}

const infrastructures: Infrastructure[] = [
  {
    id: "1",
    infraDevId: "INF-2024-001",
    project: "Rural Infrastructure Development",
    quarter: "Q2 2024",
    target: 10,
    achieved: 8,
    district: "Guwahati",
    village: "Khanapara",
    block: "Dispur",
    remarks: "Storage facility construction completed",
    status: "In Progress"
  },
  {
    id: "2",
    infraDevId: "INF-2024-002",
    project: "Water Management Infrastructure",
    quarter: "Q2 2024",
    target: 5,
    achieved: 5,
    district: "Jorhat",
    village: "Teok",
    block: "Jorhat",
    remarks: "Irrigation system installation completed",
    status: "Completed"
  }
];

export default function InfrastructureAdPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedInfra, setSelectedInfra] = useState<Infrastructure | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [quarterFilter, setQuarterFilter] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");

  const handleView = (infra: Infrastructure) => {
    setSelectedInfra(infra);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (infra: Infrastructure) => {
    setSelectedInfra(infra);
    setIsEditDialogOpen(true);
  };

  const handleSave = (updatedInfra: Partial<Infrastructure>) => {
    // Logic to save the updated infrastructure data
    console.log("Saving infrastructure:", updatedInfra);
    setIsEditDialogOpen(false);
  };

  const filteredInfrastructures = infrastructures.filter((infra) => {
    const matchesSearch =
      infra.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infra.infraDevId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infra.remarks.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQuarter =
      quarterFilter === "" ||
      quarterFilter === "all" ||
      infra.quarter === quarterFilter;
    const matchesProject =
      projectFilter === "" ||
      projectFilter === "all" ||
      infra.project === projectFilter;
    const matchesDistrict =
      districtFilter === "" ||
      districtFilter === "all" ||
      infra.district.toLowerCase() === districtFilter.toLowerCase();

    return matchesSearch && matchesQuarter && matchesProject && matchesDistrict;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Infrastructure Development
              </h1>
              <p className="text-sm text-gray-600">
                Manage infrastructure projects and track progress
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Infrastructure Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Infrastructure Development</DialogTitle>
                <DialogDescription>
                  Create a new infrastructure development entry
                </DialogDescription>
              </DialogHeader>
              <InfrastructureForm
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSave}
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
                  placeholder="Search infrastructure..."
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
                  <SelectItem value="Rural Infrastructure Development">
                    Rural Infrastructure Development
                  </SelectItem>
                  <SelectItem value="Water Management Infrastructure">
                    Water Management Infrastructure
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
            <CardTitle>Infrastructure Development Projects</CardTitle>
            <CardDescription>
              List of all infrastructure development projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Infrastructure ID</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Quarter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Target/Achieved</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInfrastructures.map((infra) => (
                  <TableRow key={infra.id}>
                    <TableCell className="font-medium">
                      {infra.infraDevId}
                    </TableCell>
                    <TableCell className="text-sm">{infra.project}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{infra.quarter}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {infra.district}, {infra.village}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">
                          {infra.achieved}
                        </span>
                        <span className="text-gray-400"> / {infra.target}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {infra.remarks}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={` ${
                          infra.status === "Completed"
                            ? "bg-green-500 text-white"
                            : "secondary"
                        }`}
                      >
                        {infra.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(infra)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(infra)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
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
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Infrastructure Details</DialogTitle>
            <DialogDescription>
              View details of the selected infrastructure project
            </DialogDescription>
          </DialogHeader>
          {selectedInfra && (
            <InfrastructureView
              infra={selectedInfra}
              onClose={() => setIsViewDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Infrastructure Development</DialogTitle>
            <DialogDescription>
              Edit an existing infrastructure development entry
            </DialogDescription>
          </DialogHeader>
          {selectedInfra && (
            <InfrastructureForm
              infra={selectedInfra}
              onClose={() => setIsEditDialogOpen(false)}
              onSave={handleSave}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfrastructureView({ infra, onClose }: InfrastructureViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Infrastructure ID</Label>
        <p className="font-medium">{infra.infraDevId}</p>
      </div>
      <div>
        <Label>Project</Label>
        <p className="font-medium">{infra.project}</p>
      </div>
      <div>
        <Label>Quarter</Label>
        <Badge variant="outline">{infra.quarter}</Badge>
      </div>
      <div>
        <Label>Location</Label>
        <p className="font-medium">
          {infra.district}, {infra.village}, {infra.block}
        </p>
      </div>
      <div>
        <Label>Target / Achieved</Label>
        <p className="font-medium">
          {infra.achieved} / {infra.target}
        </p>
      </div>
      <div>
        <Label>Remarks</Label>
        <p className="font-medium">{infra.remarks}</p>
      </div>
      <div>
        <Label>Status</Label>
        <Badge
          className={` ${
            infra.status === "Completed"
              ? "bg-green-500 text-white"
              : "secondary"
          }`}
        >
          {infra.status}
        </Badge>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

function InfrastructureForm({
  onClose,
  onSave,
  infra
}: InfrastructureFormProps) {
  const [formData, setFormData] = useState<Partial<Infrastructure>>({
    infraDevId: infra?.infraDevId || "",
    project: infra?.project || "",
    quarter: infra?.quarter || "",
    target: infra?.target || 0,
    achieved: infra?.achieved || 0,
    district: infra?.district || "",
    village: infra?.village || "",
    block: infra?.block || "",
    remarks: infra?.remarks || "",
    status: infra?.status || "In Progress"
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: Number.parseInt(value) || 0
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
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
          <Label htmlFor="infraDevId">Infrastructure ID</Label>
          <Input
            id="infraDevId"
            placeholder="INF-2024-XXX"
            value={formData.infraDevId}
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
              <SelectItem value="Rural Infrastructure Development">
                Rural Infrastructure Development
              </SelectItem>
              <SelectItem value="Water Management Infrastructure">
                Water Management Infrastructure
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="quarter">Quarter</Label>
        <Select
          value={formData.quarter}
          onValueChange={(value) => handleSelectChange("quarter", value)}
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

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          placeholder="Additional remarks (max 300 characters)"
          maxLength={300}
          value={formData.remarks}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor="image">Project Image</Label>
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
          Save Infrastructure Project
        </Button>
      </div>
    </form>
  );
}
