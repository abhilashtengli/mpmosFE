import type React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  ImageIcon,
  Plus,
  Search,
  Calendar,
  MapPin,
  Eye,
  Edit
} from "lucide-react";

// TypeScript interfaces
interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category:
    | "Training"
    | "Field Work"
    | "Event"
    | "Infrastructure"
    | "Distribution"
    | "Technology";
  location: string;
  date: string;
  photographer: string;
  tags: string[];
}

interface PhotoFormData {
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  photographer: string;
  tags: string;
}

interface PhotoUploadFormProps {
  onSave: (data: PhotoFormData) => void;
  onClose: () => void;
}

interface PhotoEditFormProps {
  initialValues: GalleryItem;
  onSave: (data: PhotoFormData) => void;
  onClose: () => void;
}

interface ImageViewDialogProps {
  selectedImage: GalleryItem;
  onEdit: (item: GalleryItem) => void;
}

const galleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "Organic Farming Training Session",
    description: "Farmers participating in hands-on organic farming training",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Training",
    location: "Guwahati, Assam",
    date: "2024-05-15",
    photographer: "Extension Team",
    tags: ["training", "organic farming", "farmers"]
  },
  {
    id: "2",
    title: "Rice Field Demonstration",
    description:
      "Field level demonstration of improved rice cultivation techniques",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Field Work",
    location: "Jorhat, Assam",
    date: "2024-05-20",
    photographer: "Dr. John Smith",
    tags: ["rice", "demonstration", "field work"]
  },
  {
    id: "3",
    title: "Farmer's Market Exhibition",
    description:
      "Annual exhibition showcasing local agricultural products and innovations",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Event",
    location: "Dibrugarh, Assam",
    date: "2024-04-10",
    photographer: "Media Team",
    tags: ["exhibition", "market", "products"]
  },
  {
    id: "4",
    title: "Infrastructure Development Project",
    description:
      "Construction of new storage facility for agricultural products",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Infrastructure",
    location: "Tezpur, Assam",
    date: "2024-03-25",
    photographer: "Project Team",
    tags: ["infrastructure", "storage", "development"]
  },
  {
    id: "5",
    title: "Seed Distribution Program",
    description: "Distribution of high-quality seeds to local farmers",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Distribution",
    location: "Silchar, Assam",
    date: "2024-06-01",
    photographer: "Field Officer",
    tags: ["seeds", "distribution", "farmers"]
  },
  {
    id: "6",
    title: "Water Management System",
    description: "Installation of drip irrigation system in demonstration plot",
    imageUrl: "/placeholder.svg?height=300&width=400",
    category: "Technology",
    location: "Nagaon, Assam",
    date: "2024-05-30",
    photographer: "Technical Team",
    tags: ["irrigation", "water management", "technology"]
  }
];

export default function GalleryAdPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const filteredItems: GalleryItem[] = galleryItems.filter(
    (item: GalleryItem) => {
      const matchesSearch: boolean =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory: boolean =
        !selectedCategory ||
        selectedCategory === "all" ||
        item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }
  );

  const handleViewImage = (item: GalleryItem): void => {
    setSelectedImage(item);
    setIsViewDialogOpen(true);
  };

  const handleEditImage = (item: GalleryItem): void => {
    setSelectedImage(item);
    setIsEditDialogOpen(true);
    setIsViewDialogOpen(false);
  };

  const handleSavePhoto = (data: PhotoFormData): void => {
    console.log("Saving photo:", data);
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ImageIcon className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
              <p className="text-sm text-gray-600">
                Photo gallery of agricultural activities and projects
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Photo</DialogTitle>
                <DialogDescription>
                  Add a new photo to the gallery
                </DialogDescription>
              </DialogHeader>
              <PhotoUploadForm
                onSave={handleSavePhoto}
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
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Field Work">Field Work</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Distribution">Distribution</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item: GalleryItem) => (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewImage(item)}
            >
              <div className="relative">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {item.location}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {item.date}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    By: {item.photographer}
                  </span>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                No photos found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* Image View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedImage?.title}</DialogTitle>
              <DialogDescription>
                Photo details and information
              </DialogDescription>
            </DialogHeader>
            {selectedImage && (
              <ImageViewDialog
                selectedImage={selectedImage}
                onEdit={handleEditImage}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Image Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Photo</DialogTitle>
              <DialogDescription>
                Edit the details of the photo
              </DialogDescription>
            </DialogHeader>
            {selectedImage && (
              <PhotoEditForm
                initialValues={selectedImage}
                onSave={handleSavePhoto}
                onClose={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ImageViewDialog({ selectedImage, onEdit }: ImageViewDialogProps) {
  return (
    <div className="space-y-4">
      <img
        src={selectedImage.imageUrl || "/placeholder.svg"}
        alt={selectedImage.title}
        className="w-full h-96 object-cover rounded-lg"
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Description
          </Label>
          <p>{selectedImage.description}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Category</Label>
          <Badge variant="outline" className="mt-1">
            {selectedImage.category}
          </Badge>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Location</Label>
          <p>{selectedImage.location}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Date</Label>
          <p>{selectedImage.date}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Photographer
          </Label>
          <p>{selectedImage.photographer}</p>
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-500">Tags</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedImage.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onEdit(selectedImage)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>
    </div>
  );
}

function PhotoUploadForm({ onSave, onClose }: PhotoUploadFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: PhotoFormData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: selectedCategory,
      date: formData.get("date") as string,
      location: formData.get("location") as string,
      photographer: formData.get("photographer") as string,
      tags: formData.get("tags") as string
    };
    onSave(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="title">Photo Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter photo title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter photo description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Training">Training</SelectItem>
              <SelectItem value="Field Work">Field Work</SelectItem>
              <SelectItem value="Event">Event</SelectItem>
              <SelectItem value="Infrastructure">Infrastructure</SelectItem>
              <SelectItem value="Distribution">Distribution</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="Enter location"
            required
          />
        </div>
        <div>
          <Label htmlFor="photographer">Photographer</Label>
          <Input
            id="photographer"
            name="photographer"
            placeholder="Enter photographer name"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="Enter tags separated by commas"
        />
      </div>

      <div>
        <Label htmlFor="image">Upload Image</Label>
        <div className="flex items-center space-x-2">
          <Button type="button" variant="outline" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Choose Image
          </Button>
          <span className="text-sm text-gray-500">JPG, PNG, GIF (Max 5MB)</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Upload Photo
        </Button>
      </div>
    </form>
  );
}

function PhotoEditForm({ onClose, initialValues, onSave }: PhotoEditFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialValues.category
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: PhotoFormData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: selectedCategory,
      date: formData.get("date") as string,
      location: formData.get("location") as string,
      photographer: formData.get("photographer") as string,
      tags: formData.get("tags") as string
    };
    onSave(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="title">Photo Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter photo title"
          defaultValue={initialValues.title}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter photo description"
          defaultValue={initialValues.description}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Training">Training</SelectItem>
              <SelectItem value="Field Work">Field Work</SelectItem>
              <SelectItem value="Event">Event</SelectItem>
              <SelectItem value="Infrastructure">Infrastructure</SelectItem>
              <SelectItem value="Distribution">Distribution</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={initialValues.date}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="Enter location"
            defaultValue={initialValues.location}
            required
          />
        </div>
        <div>
          <Label htmlFor="photographer">Photographer</Label>
          <Input
            id="photographer"
            name="photographer"
            placeholder="Enter photographer name"
            defaultValue={initialValues.photographer}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="Enter tags separated by commas"
          defaultValue={initialValues.tags.join(", ")}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Update Photo
        </Button>
      </div>
    </form>
  );
}
