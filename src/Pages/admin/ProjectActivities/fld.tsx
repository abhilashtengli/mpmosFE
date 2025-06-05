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
import { Sprout, Plus, Search, Eye, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the interface for FLD data
interface FLD {
  id: string;
  fldId: string;
  description: string;
  project: string;
  quarter: string;
  target: number;
  achieved: number;
  district: string;
  village: string;
  block: string;
  units: string;
  status: string;
}
interface FLDViewProps {
  fld: FLD;
}
interface FLDFormProps { 
  onClose: () => void;
  onSave: (data: Partial<FLD>) => void;
  fld?: FLD;
}
const flds: FLD[] = [
  {
    id: "1",
    fldId: "FLD-2024-001",
    description: "Rice Cultivation Demonstration",
    project: "Crop Improvement Program",
    quarter: "Q2 2024",
    target: 5,
    achieved: 5,
    district: "Guwahati",
    village: "Khanapara",
    block: "Dispur",
    units: "Plots",
    status: "Completed"
  },
  {
    id: "2",
    fldId: "FLD-2024-002",
    description: "Organic Vegetable Farming",
    project: "Sustainable Agriculture Initiative",
    quarter: "Q2 2024",
    target: 3,
    achieved: 3,
    district: "Jorhat",
    village: "Teok",
    block: "Jorhat",
    units: "Plots",
    status: "Completed"
  }
];

export default function FLDAdPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedFLD, setSelectedFLD] = useState<FLD | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [quarterFilter, setQuarterFilter] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [districtFilter, setDistrictFilter] = useState<string>("");

  const handleView = (fld: FLD) => {
    setSelectedFLD(fld);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (fld: FLD) => {
    setSelectedFLD(fld);
    setIsEditDialogOpen(true);
  };

  const handleSave = (updatedFLD: Partial<FLD>) => {
    // Implement save logic here (e.g., update state, API call)
    console.log("Saving FLD:", updatedFLD);
    setIsEditDialogOpen(false);
  };

  const filteredFLDs = flds.filter((fld) => {
    const matchesSearch =
      fld.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fld.fldId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fld.project.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesQuarter =
      quarterFilter === "" ||
      quarterFilter === "all" ||
      fld.quarter === quarterFilter;
    const matchesProject =
      projectFilter === "" ||
      projectFilter === "all" ||
      fld.project === projectFilter;
    const matchesDistrict =
      districtFilter === "" ||
      districtFilter === "all" ||
      fld.district.toLowerCase() === districtFilter.toLowerCase();

    return matchesSearch && matchesQuarter && matchesProject && matchesDistrict;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Sprout className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Field Level Demonstrations
              </h1>
              <p className="text-sm text-gray-600">
                Manage field demonstrations and track progress
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New FLD
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Field Level Demonstration</DialogTitle>
                <DialogDescription>
                  Create a new FLD entry with target and achievement data
                </DialogDescription>
              </DialogHeader>
              <FLDForm
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
                  placeholder="Search FLDs..."
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
                  <SelectItem value="Crop Improvement Program">
                    Crop Improvement Program
                  </SelectItem>
                  <SelectItem value="Sustainable Agriculture Initiative">
                    Sustainable Agriculture Initiative
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
            <CardTitle>Field Level Demonstrations</CardTitle>
            <CardDescription>
              List of all FLDs with target vs achievement tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>FLD ID</TableHead>
                  <TableHead>Description</TableHead>
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
                {filteredFLDs.map((fld) => (
                  <TableRow key={fld.id}>
                    <TableCell className="font-medium">{fld.fldId}</TableCell>
                    <TableCell>{fld.description}</TableCell>
                    <TableCell className="text-sm">{fld.project}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{fld.quarter}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {fld.district}, {fld.village}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">
                          {fld.achieved}
                        </span>
                        <span className="text-gray-400"> / {fld.target}</span>
                      </div>
                    </TableCell>
                    <TableCell>{fld.units}</TableCell>
                    <TableCell>
                      <Badge
                          className={` ${
                            fld.status === "Completed"
                              ? "bg-green-500 text-white"
                              : "secondary"
                          }`}
                      >
                        {fld.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(fld)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(fld)}
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
            <DialogTitle>View Field Level Demonstration</DialogTitle>
            <DialogDescription>
              View details of the selected FLD
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[80vh] w-full">
            {selectedFLD && <FLDView fld={selectedFLD} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Field Level Demonstration</DialogTitle>
            <DialogDescription>
              Edit details of the selected FLD
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[80vh] w-full">
            {selectedFLD && (
              <FLDForm
                fld={selectedFLD}
                onClose={() => setIsEditDialogOpen(false)}
                onSave={handleSave}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FLDView({ fld }: FLDViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>FLD ID</Label>
        <div className="text-gray-800">{fld.fldId}</div>
      </div>
      <div>
        <Label>Project</Label>
        <div className="text-gray-800">{fld.project}</div>
      </div>
      <div>
        <Label>Description</Label>
        <div className="text-gray-800">{fld.description}</div>
      </div>
      <div>
        <Label>Quarter</Label>
        <div className="text-gray-800">{fld.quarter}</div>
      </div>
      <div>
        <Label>Units</Label>
        <div className="text-gray-800">{fld.units}</div>
      </div>
      <div>
        <Label>Target</Label>
        <div className="text-gray-800">{fld.target}</div>
      </div>
      <div>
        <Label>Achieved</Label>
        <div className="text-gray-800">{fld.achieved}</div>
      </div>
      <div>
        <Label>District</Label>
        <div className="text-gray-800">{fld.district}</div>
      </div>
      <div>
        <Label>Village</Label>
        <div className="text-gray-800">{fld.village}</div>
      </div>
      <div>
        <Label>Block</Label>
        <div className="text-gray-800">{fld.block}</div>
      </div>
    </div>
  );
}

function FLDForm({ onClose, onSave, fld }: FLDFormProps) {
  const [formData, setFormData] = useState<Partial<FLD>>({
    fldId: fld?.fldId || "",
    project: fld?.project || "",
    description: fld?.description || "",
    quarter: fld?.quarter || "",
    units: fld?.units || "",
    target: fld?.target || 0,
    achieved: fld?.achieved || 0,
    district: fld?.district || "",
    village: fld?.village || "",
    block: fld?.block || "",
    status: fld?.status || "In Progress"
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: Number.parseInt(value) || 0
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
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
          <Label htmlFor="fldId">FLD ID</Label>
          <Input
            id="fldId"
            placeholder="FLD-2024-XXX"
            value={formData.fldId}
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
              <SelectItem value="Crop Improvement Program">
                Crop Improvement Program
              </SelectItem>
              <SelectItem value="Sustainable Agriculture Initiative">
                Sustainable Agriculture Initiative
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter FLD description (max 200 characters)"
          maxLength={200}
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div>
          <Label htmlFor="units">Units</Label>
          <Input
            id="units"
            placeholder="e.g., Plots, Hectares"
            value={formData.units}
            onChange={handleChange}
          />
        </div>
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

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Save FLD
        </Button>
      </div>
    </form>
  );
}
