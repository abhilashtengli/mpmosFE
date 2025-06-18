"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  BookOpen,
  Plus,
  Search,
  Download,
  FileText,
  Eye,
  Edit,
  Trash2,
  Loader2,
  UploadCloud,
  ImageIcon
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import axios, { type AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { getSignedUrl } from "@/services/cloudflare/getSignedUrl";
import deleteFileFromCloudflare from "@/services/cloudflare/deleteFileFromCloudflare";
import uploadFileToCloudflare from "@/services/cloudflare/uploadFileToCloudFlare";
import { Base_Url } from "@/lib/constants";

// Base publication schema - matching backend exactly
const basePublicationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title cannot exceed 100 characters" }),
  type: z
    .string()
    .trim()
    .min(2, { message: "Type must be at least 2 characters" })
    .max(100, { message: "Type cannot exceed 100 characters" }),
  category: z
    .string()
    .trim()
    .min(2, { message: "Category must be at least 2 characters" })
    .max(100, { message: "Category cannot exceed 100 characters" })
    .optional()
    .nullable(),
  thumbnailUrl: z
    .string()
    .trim()
    .url({ message: "Invalid thumbnail URL format" })
    .optional()
    .nullable(),
  thumbnailKey: z.string().trim().optional().nullable(),
  pdfUrl: z
    .string()
    .trim()
    .url({ message: "Invalid PDF URL format" })
    .optional()
    .nullable(),
  pdfKey: z.string().trim().optional().nullable()
});

// Create publication validation with refinements - matching backend exactly
const createPublicationValidation = basePublicationSchema
  .refine(
    (data) => {
      // Ensure thumbnailKey is present if thumbnailUrl is provided
      if (data.thumbnailUrl && !data.thumbnailKey) {
        return false;
      }
      return true;
    },
    {
      message: "Thumbnail key is required when thumbnail URL is provided",
      path: ["thumbnailKey"]
    }
  )
  .refine(
    (data) => {
      // Ensure pdfKey is present if pdfUrl is provided
      if (data.pdfUrl && !data.pdfKey) {
        return false;
      }
      return true;
    },
    {
      message: "PDF key is required when PDF URL is provided",
      path: ["pdfKey"]
    }
  )
  .refine(
    (data) => {
      // Ensure BOTH thumbnail and PDF are provided
      if (!data.thumbnailUrl || !data.pdfUrl) {
        return false;
      }
      return true;
    },
    {
      message: "Both thumbnail and PDF must be provided",
      path: ["thumbnailUrl", "pdfUrl"] // Show error on both fields
    }
  );

// Update publication validation - matching backend exactly
const updatePublicationValidation = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, { message: "Title must be at least 5 characters" })
      .max(100, { message: "Title cannot exceed 100 characters" })
      .optional(),
    type: z
      .string()
      .trim()
      .min(2, { message: "Type must be at least 2 characters" })
      .max(100, { message: "Type cannot exceed 100 characters" })
      .optional(),
    category: z
      .string()
      .trim()
      .min(2, { message: "Category must be at least 2 characters" })
      .max(100, { message: "Category cannot exceed 100 characters" })
      .optional()
      .nullable(),
    thumbnailUrl: z
      .string()
      .trim()
      .url({ message: "Invalid thumbnail URL format" })
      .optional()
      .nullable(),
    thumbnailKey: z.string().trim().optional().nullable(),
    pdfUrl: z
      .string()
      .trim()
      .url({ message: "Invalid PDF URL format" })
      .optional()
      .nullable(),
    pdfKey: z.string().trim().optional().nullable()
  })
  .refine(
    (data) => {
      // ✅ GOOD: Handles undefined (not being updated)
      if (data.thumbnailUrl === undefined) {
        return true;
      }
      // ✅ GOOD: Handles null (removing thumbnail)
      if (data.thumbnailUrl === null) {
        return true;
      }
      // ✅ GOOD: Ensures key is provided when URL is set
      if (data.thumbnailUrl && !data.thumbnailKey) {
        return false;
      }
      return true;
    },
    {
      message: "Thumbnail key is required when thumbnail URL is provided",
      path: ["thumbnailKey"]
    }
  )
  .refine(
    (data) => {
      // ✅ GOOD: Same logic for PDF
      if (data.pdfUrl === undefined) {
        return true;
      }
      if (data.pdfUrl === null) {
        return true;
      }
      if (data.pdfUrl && !data.pdfKey) {
        return false;
      }
      return true;
    },
    {
      message: "PDF key is required when PDF URL is provided",
      path: ["pdfKey"]
    }
  );

// TypeScript interfaces
interface Publication {
  id: string;
  title: string;
  type: string;
  category?: string | null;
  thumbnailUrl?: string | null;
  thumbnailKey?: string | null;
  pdfUrl?: string | null;
  pdfKey?: string | null;
  createdAt: string;
  updatedAt?: string;
  User?: {
    id: string;
    name: string;
  };
}

interface PublicationFormData {
  title: string;
  type: string;
  category: string;
  thumbnailUrl: string | null;
  thumbnailKey: string | null;
  pdfUrl: string | null;
  pdfKey: string | null;
  thumbnailFile?: File | null;
  pdfFile?: File | null;
}

interface PublicationFormProps {
  publication?: Publication;
  onSave: (data: PublicationFormData) => Promise<boolean>;
  onClose: () => void;
  isEdit?: boolean;
}

interface PublicationViewProps {
  publication: Publication;
}

interface FormErrors {
  [key: string]: string;
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  code: string;
  errors?: unknown;
  path?: string[];
}

interface ApiSuccessResponse {
  success: true;
  message: string;
  data: Publication;
  code: string;
}

interface SignedUrlResponse {
  signedUrl: string;
  publicUrl: string;
  key: string;
}

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const userRole = useAuthStore((state) => state.user);

  // Fetch publications data
  const fetchPublications = async () => {
    try {
      setIsLoading(true);

      const endpoint =
        userRole?.role === "admin"
          ? "get-all-publications"
          : "get-user-publications";
      const response = await axios.get(`${Base_Url}/${endpoint}`, {
        withCredentials: true
      });

      const data = response.data;

      if (!data.success || response.status !== 200) {
        throw new Error(data.message || "Failed to fetch publications");
      }

      setPublications(data.data || []);
    } catch (error: unknown) {
      const defaultMessage =
        "An unexpected error occurred while fetching data.";
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<ApiErrorResponse>;
        const apiErrorMessage = err.response?.data?.message || err.message;

        toast.error("Fetch Failed", {
          description: apiErrorMessage || defaultMessage
        });
      } else {
        toast.error("Failed", {
          description:
            "An unexpected error occurred while fetching publications"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  // Filter publications based on search and filter criteria
  const filteredPublications: Publication[] = publications.filter(
    (publication: Publication) => {
      const matchesSearch: boolean =
        publication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publication.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Boolean(
          publication.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory: boolean =
        !selectedCategory ||
        selectedCategory === "all" ||
        publication.category === selectedCategory;
      const matchesType: boolean =
        !selectedType ||
        selectedType === "all" ||
        publication.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    }
  );

  const uniqueCategories = useMemo(() => {
    if (!publications || publications.length === 0) return [];
    return Array.from(
      new Set(publications.map((pub) => pub.category).filter(Boolean))
    );
  }, [publications]);

  const uniqueTypes = useMemo(() => {
    if (!publications || publications.length === 0) return [];
    return Array.from(new Set(publications.map((pub) => pub.type)));
  }, [publications]);

  const handleView = (publication: Publication): void => {
    setSelectedPublication(publication);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (publication: Publication): void => {
    setSelectedPublication(publication);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (publication: Publication): void => {
    setSelectedPublication(publication);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (
    formData: PublicationFormData,
    operation: "create" | "update" = "create",
    publicationId?: string
  ): Promise<boolean> => {
    if (operation === "update" && !publicationId) {
      toast.error("Publication ID is required for update operation");
      return false;
    }

    // Validate required fields for creation
    if (operation === "create") {
      if (!formData.title?.trim()) {
        toast.error("Publication title is required");
        return false;
      }

      if (!formData.type?.trim()) {
        toast.error("Publication type is required");
        return false;
      }
    }

    // Show loading toast
    const loadingToast = toast.loading(
      `${operation === "create" ? "Creating" : "Updating"} publication...`
    );

    try {
      let response;
      const config = {
        withCredentials: true,
        timeout: 30000,
        headers: {
          "Content-Type": "application/json"
        }
      };

      // Prepare request data
      const requestData = {
        title: formData.title,
        type: formData.type,
        category: formData.category || null,
        thumbnailUrl: formData.thumbnailUrl || null,
        thumbnailKey: formData.thumbnailKey || null,
        pdfUrl: formData.pdfUrl || null,
        pdfKey: formData.pdfKey || null
      };

      if (operation === "create") {
        response = await axios.post(
          `${Base_Url}/add-publication`,
          requestData,
          config
        );
      } else {
        response = await axios.put(
          `${Base_Url}/update-publication/${publicationId}`,
          requestData,
          config
        );
      }

      // Handle successful response
      if (response?.status === 201 || response?.status === 200) {
        const data = response.data as ApiSuccessResponse;

        toast.success(
          data.message || `Publication ${operation}d successfully`,
          {
            description: `${data.data.title}`,
            duration: 6000
          }
        );

        // Update local state
        if (operation === "create") {
          const newPublication: Publication = {
            id: data.data.id,
            title: data.data.title,
            type: data.data.type,
            category: data.data.category,
            thumbnailUrl: data.data.thumbnailUrl,
            thumbnailKey: data.data.thumbnailKey,
            pdfUrl: data.data.pdfUrl,
            pdfKey: data.data.pdfKey,
            createdAt: data.data.createdAt,
            updatedAt: data.data.updatedAt,
            User: data.data.User
          };
          setPublications((prev) => [newPublication, ...prev]);
        } else if (operation === "update" && publicationId) {
          setPublications((prev) =>
            prev.map((p) =>
              p.id === publicationId
                ? {
                    ...p,
                    title: data.data.title,
                    type: data.data.type,
                    category: data.data.category,
                    thumbnailUrl: data.data.thumbnailUrl,
                    thumbnailKey: data.data.thumbnailKey,
                    pdfUrl: data.data.pdfUrl,
                    pdfKey: data.data.pdfKey,
                    updatedAt: data.data.updatedAt
                  }
                : p
            )
          );
        }

        // Close dialogs on success
        setIsDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedPublication(null);

        return true;
      } else {
        toast.error(`Unexpected response status: ${response?.status}`);
        return false;
      }
    } catch (error) {
      console.error(`Error ${operation}ing publication:`, error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        let description = "An error occurred.";
        if (errorData) {
          description = errorData.message || description;
        } else if (axiosError.request) {
          description = "No response from server.";
        }
        toast.error(`Failed to ${operation}`, { description });
        if (axiosError.response?.status === 401 && logout) {
          logout();
          navigate("/signin");
        }
      } else {
        toast.error(`Failed to ${operation}`, {
          description: (error as Error).message || "An unexpected error."
        });
      }

      return false;
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleDeletePublication = async () => {
    if (!selectedPublication) {
      toast.error("No Publication selected", {
        description: "Please select a publication to delete"
      });
      return;
    }

    setDeleting(true);

    const loadingToast = toast.loading(
      `Deleting "${selectedPublication.title}"...`
    );

    try {
      const response = await axios.delete(
        `${Base_Url}/delete-publication/${selectedPublication.id}`,
        {
          withCredentials: true,
          timeout: 30000
        }
      );
      console.log("Resoposne : ", response.data);

      if (response.status === 200 && response.data.success) {
        if (response.data.warning) {
          toast.warning("Publication deleted with file issues", {
            description: `${selectedPublication.title} was removed from your account, but ${response.data.warning}`,
            duration: 6000
          });
        } else {
          toast.success("Publication deleted", {
            description: selectedPublication.title + " deleted successfully",
            duration: 5000
          });
        }
        setPublications((prevPublications) =>
          prevPublications.filter(
            (publication) => publication.id !== selectedPublication.id
          )
        );
        setSelectedPublication(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Deletion failed", {
          description:
            response.data?.message || "Publication deletion was not completed"
        });
      }
    } catch (error: unknown) {
      console.error("Delete publication error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        const errorMap: Record<number, { title: string; fallback: string }> = {
          400: {
            title: "Invalid request",
            fallback: "The publication ID is invalid"
          },
          401: { title: "Authentication required", fallback: "Please sign in" },
          403: { title: "Access denied", fallback: "Permission denied" },
          404: {
            title: "Publication not found",
            fallback: "Publication may already be deleted"
          },
          409: {
            title: "Conflict",
            fallback: "Cannot delete due to dependencies"
          },
          500: {
            title: "Server error",
            fallback: "Something went wrong on our end"
          }
        };

        if (status && errorMap[status]) {
          const { title, fallback } = errorMap[status];
          toast.error(title, { description: message || fallback });
        } else if (error.code === "ECONNABORTED") {
          toast.error("Timeout", {
            description: "Request took too long. Please try again"
          });
        } else {
          toast.error("Network error", {
            description: "Check your internet connection"
          });
        }
      } else {
        toast.error("Unexpected error", {
          description: "Something went wrong. Please try again"
        });
      }
    } finally {
      setDeleting(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleDownload = (publication: Publication): void => {
    if (publication.pdfUrl) {
      window.open(publication.pdfUrl, "_blank");
    } else {
      toast.error("No PDF available for download");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
              <p className="text-sm text-gray-600">
                Manage research papers, manuals, and educational materials
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Publication
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Publication</DialogTitle>
                <DialogDescription>
                  Upload a new publication or document
                </DialogDescription>
              </DialogHeader>
              <PublicationForm
                onSave={(formData) => handleSave(formData, "create")}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-4.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search publications..."
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
                  {uniqueCategories
                    .filter(
                      (category): category is string =>
                        category != null && category.trim() !== ""
                    )
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Publication Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Publications Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader></CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="w-full h-32 md:h-48 bg-gray-200 rounded-md"></div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="flex space-x-2 mb-2">
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredPublications.map((publication: Publication) => (
              <Card
                key={publication.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className=" flex flex-col justify-between h-full border-red-400">
                  {publication.thumbnailUrl && (
                    <div className="mb-4  border-red-600 ">
                      <img
                        src={publication.thumbnailUrl || "/placeholder.svg"}
                        alt={publication.title}
                        className="w-full h-32 md:h-48 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {publication.title}
                      </CardTitle>
                      <div className="flex space-x-2 mb-2">
                        {publication.category && (
                          <Badge variant="outline">
                            {publication.category}
                          </Badge>
                        )}
                        <Badge variant="secondary">{publication.type}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="h-4 w-4 mr-2" />
                      Type : {publication.type}
                    </div>
                    {publication.User && (
                      <div className="flex items-center text-sm text-gray-500">
                        Created by : {publication.User.name}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      Created :{" "}
                      {new Date(publication.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 space-y-2  space-x-2">
                    {publication.pdfUrl && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleDownload(publication)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(publication)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(publication)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(publication)}
                    >
                      <Trash2 className="h-3 w-3 mr-1 text-red-600" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredPublications.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                No publications found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Publication Details</DialogTitle>
              <DialogDescription>
                View complete publication information
              </DialogDescription>
            </DialogHeader>
            {selectedPublication && (
              <PublicationView publication={selectedPublication} />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Publication</DialogTitle>
              <DialogDescription>
                Update publication information
              </DialogDescription>
            </DialogHeader>
            {selectedPublication && (
              <PublicationForm
                publication={selectedPublication}
                onSave={(formData) =>
                  handleSave(formData, "update", selectedPublication.id)
                }
                onClose={() => setIsEditDialogOpen(false)}
                isEdit={true}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-black">
                ⚠️ Confirm Publication Deletion
              </DialogTitle>
              <DialogDescription>
                <br />
                <span className="block mt-2">
                  Are you sure you want to delete this publication?
                </span>
                <span className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </span>
              </DialogDescription>
            </DialogHeader>

            {selectedPublication && (
              <div className="grid gap-2 py-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Title: </span>
                  {selectedPublication?.title}
                </div>
                <div>
                  <span className="font-medium text-foreground">Type: </span>
                  {selectedPublication?.type}
                </div>
                {selectedPublication?.category && (
                  <div>
                    <span className="font-medium text-foreground">
                      Category:{" "}
                    </span>
                    {selectedPublication?.category}
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeletePublication();
                }}
                disabled={isDeleting}
                className="cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function PublicationView({ publication }: PublicationViewProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Publication Title
          </Label>
          <p className="text-md font-semibold">{publication.title}</p>
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">Type</Label>
          <p>{publication.type}</p>
        </div>
        {publication.category && (
          <div>
            <Label className="text-sm font-medium text-gray-500">
              Category
            </Label>
            <p>{publication.category}</p>
          </div>
        )}
      </div>
      <hr />
      {publication.thumbnailUrl && (
        <div>
          <Label className="text-sm font-medium text-gray-500">Thumbnail</Label>
          <div className="mt-2">
            <img
              src={publication.thumbnailUrl || "/placeholder.svg"}
              alt={publication.title}
              className="w-full max-w-md h-auto rounded-md"
            />
          </div>
        </div>
      )}
      {publication.pdfUrl && (
        <div>
          <Label className="text-sm font-medium text-gray-500">
            PDF Document
          </Label>
          <div className="mt-2">
            <Button
              onClick={() => window.open(publication.pdfUrl!, "_blank")}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      )}
      <hr />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
        <div>
          <Label className="flex items-center">
            Created At{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>
          <p className="tracking-wider mt-2">
            {new Date(publication.createdAt).toLocaleString()}
          </p>
        </div>
        {publication.updatedAt && (
          <div>
            <Label className="flex items-center">
              Last Updated{" "}
              <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
            </Label>
            <p className="tracking-wider mt-2">
              {new Date(publication.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
        {publication.User && (
          <div>
            <Label>Created By</Label>
            <p className="tracking-wider mt-2">{publication.User.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PublicationForm({
  publication,
  onSave,
  onClose,
  isEdit = false
}: PublicationFormProps) {
  const [formData, setFormData] = useState<PublicationFormData>({
    title: publication?.title || "",
    type: publication?.type || "",
    category: publication?.category || "",
    thumbnailUrl: publication?.thumbnailUrl || null,
    thumbnailKey: publication?.thumbnailKey || null,
    pdfUrl: publication?.pdfUrl || null,
    pdfKey: publication?.pdfKey || null,
    thumbnailFile: null,
    pdfFile: null
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<SignedUrlResponse | null>(
    null
  );
  const [pdfUrl, setPdfUrl] = useState<SignedUrlResponse | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    null
  );
  const [pdfPreviewInfo, setPdfPreviewInfo] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [thumbnailToBeRemovedKey, setThumbnailToBeRemovedKey] = useState<
    string | null
  >(null);
  const [pdfToBeRemovedKey, setPdfToBeRemovedKey] = useState<string | null>(
    null
  );
  const [isProcessingThumbnail, setIsProcessingThumbnail] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(true);

  useEffect(() => {
    if (isEdit && publication?.thumbnailUrl) {
      setThumbnailPreviewUrl(publication.thumbnailUrl);
      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: publication.thumbnailUrl ?? null,
        thumbnailKey: publication.thumbnailKey ?? null
      }));
    }
    if (isEdit && publication?.pdfUrl) {
      setPdfPreviewInfo({
        name: publication.pdfUrl || "Publication Document.pdf",
        size: 0
      });
      setFormData((prev) => ({
        ...prev,
        pdfUrl: publication.pdfUrl ?? null,
        pdfKey: publication.pdfKey ?? null
      }));
    }
  }, [isEdit, publication]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }

    if (!file) {
      toast.warning("File is missing", {
        description: "Please select a thumbnail image to upload."
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        thumbnailFile: "File size must be less than 5MB"
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,
        thumbnailFile: "Please select a valid image file"
      }));
      return;
    }

    setIsProcessingThumbnail(true);

    const localPreviewUrl = URL.createObjectURL(file);
    setThumbnailPreviewUrl(localPreviewUrl);
    setFormData((prev) => ({
      ...prev,
      thumbnailFile: file,
      thumbnailUrl: "",
      thumbnailKey: ""
    }));
    setThumbnailToBeRemovedKey(null);
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      // Clear thumbnail-related errors when a new file is selected
      delete newErrors.thumbnailFile;
      delete newErrors.thumbnailUrl;
      delete newErrors.thumbnailKey;
      return newErrors;
    });

    try {
      const signedUrlData = await getSignedUrl({
        fileName: file.name,
        contentType: file.type
      });

      setThumbnailUrl(signedUrlData);
      toast.success("Thumbnail selected", {
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB)`
      });
    } catch {
      toast.error("Failed to get upload URL", {
        description: "Could not prepare thumbnail for upload. Please try again."
      });
      URL.revokeObjectURL(localPreviewUrl);
      setThumbnailPreviewUrl(
        isEdit && publication?.thumbnailUrl ? publication.thumbnailUrl : null
      );
      setFormData((prev) => ({ ...prev, thumbnailFile: null }));
      setThumbnailUrl(null);
    } finally {
      setIsProcessingThumbnail(false);
    }
  };

  const handlePdfChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }

    if (!file) {
      toast.warning("File is missing", {
        description: "Please select a PDF file to upload."
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        pdfFile: "File size must be less than 20MB"
      }));
      return;
    }

    if (file.type !== "application/pdf") {
      setFormErrors((prev) => ({
        ...prev,
        pdfFile: "Please select a valid PDF file"
      }));
      return;
    }

    setIsProcessingPdf(true);

    setPdfPreviewInfo({
      name: file.name,
      size: file.size
    });
    setFormData((prev) => ({
      ...prev,
      pdfFile: file,
      pdfUrl: "",
      pdfKey: ""
    }));
    setPdfToBeRemovedKey(null);
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      // Clear PDF-related errors when a new file is selected
      delete newErrors.pdfFile;
      delete newErrors.pdfUrl;
      delete newErrors.pdfKey;
      return newErrors;
    });

    try {
      const signedUrlData = await getSignedUrl({
        fileName: file.name,
        contentType: file.type
      });

      setPdfUrl(signedUrlData);
      toast.success("PDF selected", {
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB)`
      });
    } catch {
      toast.error("Failed to get upload URL", {
        description: "Could not prepare PDF for upload. Please try again."
      });
      setPdfPreviewInfo(null);
      setFormData((prev) => ({ ...prev, pdfFile: null }));
      setPdfUrl(null);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleRemoveThumbnail = (): void => {
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailPreviewUrl(null);
    setFormData((prev) => ({
      ...prev,
      thumbnailFile: null,
      thumbnailUrl: "",
      thumbnailKey: ""
    }));
    setThumbnailUrl(null);

    if (isEdit && publication?.thumbnailKey) {
      setThumbnailToBeRemovedKey(publication.thumbnailKey);
    } else {
      setThumbnailToBeRemovedKey(null);
    }

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
    toast.info("Thumbnail removed");
  };

  const handleRemovePdf = (): void => {
    setPdfPreviewInfo(null);
    setFormData((prev) => ({
      ...prev,
      pdfFile: null,
      pdfUrl: "",
      pdfKey: ""
    }));
    setPdfUrl(null);

    if (isEdit && publication?.pdfKey) {
      setPdfToBeRemovedKey(publication.pdfKey);
    } else {
      setPdfToBeRemovedKey(null);
    }

    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
    toast.info("PDF removed");
  };

  const isSubmitDisabled = (): boolean => {
    if (isSubmitting === true) return true;
    if (isProcessingThumbnail === true || isProcessingPdf === true) return true;
    if (formData.thumbnailFile && (!thumbnailUrl || !thumbnailUrl.signedUrl))
      return true;
    if (formData.pdfFile && (!pdfUrl || !pdfUrl.signedUrl)) return true;
    return false;
  };

  const validateForm = (): boolean => {
    try {
      const dataToValidate = {
        title: formData.title,
        type: formData.type,
        category: formData.category || null,
        // If files are selected, they will generate URLs, so we should validate accordingly
        thumbnailUrl: formData.thumbnailFile
          ? "https://www.w3.org/WAI/ER/testspdf/dummy.pdf"
          : formData.thumbnailUrl || null,
        thumbnailKey: formData.thumbnailFile
          ? "https://www.w3.org/WAI/ER/testspdf/dummy.pdf"
          : formData.thumbnailKey || null,
        pdfUrl: formData.pdfFile
          ? "https://www.w3.org/WAI/ER/testspdf/dummy.pdf"
          : formData.pdfUrl || null,
        pdfKey: formData.pdfFile
          ? "https://www.w3.org/WAI/ER/testspdf/dummy.pdf"
          : formData.pdfKey || null
      };

      if (isEdit) {
        updatePublicationValidation.parse(dataToValidate);
      } else {
        createPublicationValidation.parse(dataToValidate);
      }
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0].toString();
          // Don't show URL/key errors if files are selected
          if (path === "thumbnailUrl" && formData.thumbnailFile) return;
          if (path === "thumbnailKey" && formData.thumbnailFile) return;
          if (path === "pdfUrl" && formData.pdfFile) return;
          if (path === "pdfKey" && formData.pdfFile) return;
          newErrors[path] = err.message;
        });
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Validation Error", {
        description: "Please fix the errors in the form before submitting."
      });
      return;
    }

    setIsSubmitting(true);
    let finalThumbnailUrl: string | null = publication?.thumbnailUrl || null;
    let finalThumbnailKey: string | null = publication?.thumbnailKey || null;
    let finalPdfUrl: string | null = publication?.pdfUrl || null;
    let finalPdfKey: string | null = publication?.pdfKey || null;

    try {
      // Handle thumbnail removal
      if (thumbnailToBeRemovedKey) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const deleted = await deleteFileFromCloudflare(thumbnailToBeRemovedKey);
        if (deleted) {
          finalThumbnailUrl = null;
          finalThumbnailKey = null;
          toast.success("Previous thumbnail deleted from storage.");
        } else {
          toast.warning("Previous thumbnail deletion failed", {
            description:
              "The old thumbnail couldn't be removed from storage, but your changes will still be saved."
          });
        }
      }

      // Handle PDF removal
      if (pdfToBeRemovedKey) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const deleted = await deleteFileFromCloudflare(pdfToBeRemovedKey);
        if (deleted) {
          finalPdfUrl = null;
          finalPdfKey = null;
          toast.success("Previous PDF deleted from storage.");
        } else {
          toast.warning("Previous PDF deletion failed", {
            description:
              "The old PDF couldn't be removed from storage, but your changes will still be saved."
          });
        }
      }

      // Handle thumbnail upload
      if (formData.thumbnailFile && thumbnailUrl?.signedUrl) {
        if (
          isEdit &&
          publication?.thumbnailKey &&
          !thumbnailToBeRemovedKey &&
          formData.thumbnailFile
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const oldKeyDeleted = await deleteFileFromCloudflare(
            publication.thumbnailKey
          );
          if (!oldKeyDeleted) {
            toast.warning("Old Thumbnail Deletion Issue", {
              description:
                "Could not delete the previously existing thumbnail from storage."
            });
          }
        }

        const uploadResult = await uploadFileToCloudflare(
          formData.thumbnailFile,
          thumbnailUrl.signedUrl
        );
        if (
          uploadResult.success &&
          thumbnailUrl.publicUrl &&
          thumbnailUrl.key
        ) {
          finalThumbnailUrl = thumbnailUrl.publicUrl;
          finalThumbnailKey = thumbnailUrl.key;
          toast.success("Thumbnail uploaded successfully");
        } else {
          toast.error("Thumbnail Upload Failed", {
            description:
              uploadResult.error || "Could not upload the new thumbnail."
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Handle PDF upload
      if (formData.pdfFile && pdfUrl?.signedUrl) {
        if (
          isEdit &&
          publication?.pdfKey &&
          !pdfToBeRemovedKey &&
          formData.pdfFile
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const oldKeyDeleted = await deleteFileFromCloudflare(
            publication.pdfKey
          );
          if (!oldKeyDeleted) {
            toast.warning("Old PDF Deletion Issue", {
              description:
                "Could not delete the previously existing PDF from storage."
            });
          }
        }

        const uploadResult = await uploadFileToCloudflare(
          formData.pdfFile,
          pdfUrl.signedUrl
        );
        if (uploadResult.success && pdfUrl.publicUrl && pdfUrl.key) {
          finalPdfUrl = pdfUrl.publicUrl;
          finalPdfKey = pdfUrl.key;
          toast.success("PDF uploaded successfully");
        } else {
          toast.error("PDF Upload Failed", {
            description: uploadResult.error || "Could not upload the new PDF."
          });
          setIsSubmitting(false);
          return;
        }
      }

      const dataToSave: PublicationFormData = {
        ...formData,
        thumbnailUrl: finalThumbnailUrl || "",
        thumbnailKey: finalThumbnailKey || "",
        pdfUrl: finalPdfUrl || "",
        pdfKey: finalPdfKey || ""
      };

      const success = await onSave(dataToSave);
      if (!success) {
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Submission Error", {
        description: "An unexpected error occurred while saving."
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="title">
            Publication Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Enter publication title (max 100 characters)"
            value={formData.title}
            onChange={handleInputChange}
            maxLength={100}
            className={formErrors.title ? "border-red-500" : ""}
            required={!isEdit}
          />
          {formErrors.title && (
            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">
            Type <span className="text-red-500">*</span>
          </Label>
          <Input
            id="type"
            name="type"
            placeholder="e.g., Research Paper, Manual, Newsletter"
            value={formData.type}
            onChange={handleInputChange}
            maxLength={100}
            className={formErrors.type ? "border-red-500" : ""}
            required={!isEdit}
          />
          {formErrors.type && (
            <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>
          )}
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            placeholder="e.g., Research, Training Material, Technical"
            value={formData.category}
            onChange={handleInputChange}
            maxLength={100}
            className={formErrors.category ? "border-red-500" : ""}
          />
          {formErrors.category && (
            <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Label htmlFor="thumbnailFile">
            Thumbnail Image {!isEdit && <span className="text-red-500">*</span>}
          </Label>
          <div
            className={`mt-3 p-4 border-2 ${
              formErrors.thumbnailFile || formErrors.thumbnailUrl
                ? "border-red-500"
                : "border-gray-300"
            } border-dashed rounded-md`}
          >
            {thumbnailPreviewUrl ? (
              <div className="space-y-2">
                <div className="relative group w-full h-auto max-h-60 md:max-h-80 rounded-md overflow-hidden">
                  {isThumbnailLoading && (
                    <div className="absolute inset-0 z-10 shimmer-effect rounded-md">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-[pulse_2s_ease-in-out_infinite_alternate]"></div>
                    </div>
                  )}
                  <img
                    src={thumbnailPreviewUrl || "/placeholder.svg"}
                    alt="Thumbnail preview"
                    onLoad={() => setIsThumbnailLoading(false)}
                    onError={() => setIsThumbnailLoading(false)}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                      isThumbnailLoading ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveThumbnail}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-red-600/80 text-white"
                    aria-label="Remove thumbnail"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {formData.thumbnailFile && (
                  <p className="text-xs text-green-600">
                    New thumbnail selected: {formData.thumbnailFile.name} (
                    {(formData.thumbnailFile.size / (1024 * 1024)).toFixed(2)}{" "}
                    MB)
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4 mr-2" /> Change Thumbnail
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-600">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-medium text-green-600 hover:text-green-500"
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    Click to upload a thumbnail
                  </Button>
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
            <Input
              id="thumbnailFile"
              name="thumbnailFile"
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
            {(formErrors.thumbnailFile || formErrors.thumbnailUrl) && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.thumbnailFile || formErrors.thumbnailUrl}
              </p>
            )}
            {isProcessingThumbnail && (
              <div className="text-sm text-green-600 mt-2 text-center">
                <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                Preparing thumbnail for upload...
              </div>
            )}
            {formData.thumbnailFile &&
              !thumbnailUrl?.signedUrl &&
              !isProcessingThumbnail && (
                <div className="text-sm text-amber-600 mt-2 text-center">
                  ⚠️ Thumbnail selected but not ready for upload. Please wait or
                  try selecting again.
                </div>
              )}
          </div>
        </div>

        <div>
          <Label htmlFor="pdfFile">
            Publication Document (PDF){" "}
            {!isEdit && <span className="text-red-500">*</span>}
          </Label>
          <div
            className={`mt-3 p-4 border-2 ${
              formErrors.pdfFile || formErrors.pdfUrl
                ? "border-red-500"
                : "border-gray-300"
            } border-dashed rounded-md`}
          >
            {pdfPreviewInfo ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {pdfPreviewInfo.name}
                      </p>
                      {pdfPreviewInfo.size > 0 && (
                        <p className="text-xs text-gray-500">
                          {(pdfPreviewInfo.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemovePdf}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    aria-label="Remove PDF"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {formData.pdfFile && (
                  <p className="text-xs text-green-600">
                    New PDF selected: {formData.pdfFile.name} (
                    {(formData.pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => pdfInputRef.current?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" /> Change PDF
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-600">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto font-medium text-green-600 hover:text-green-500"
                    onClick={() => pdfInputRef.current?.click()}
                  >
                    Click to upload a PDF
                  </Button>
                </p>
                <p className="text-xs text-gray-500">PDF files up to 20MB</p>
              </div>
            )}
            <Input
              id="pdfFile"
              name="pdfFile"
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              onChange={handlePdfChange}
              className="hidden"
            />
            {(formErrors.pdfFile || formErrors.pdfUrl) && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.pdfFile || formErrors.pdfUrl}
              </p>
            )}
            {isProcessingPdf && (
              <div className="text-sm text-green-600 mt-2 text-center">
                <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                Preparing PDF for upload...
              </div>
            )}
            {formData.pdfFile && !pdfUrl?.signedUrl && !isProcessingPdf && (
              <div className="text-sm text-amber-600 mt-2 text-center">
                ⚠️ PDF selected but not ready for upload. Please wait or try
                selecting again.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitDisabled()}
          className={`${
            isSubmitDisabled() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className={`bg-green-600 hover:bg-green-700 ${
            isSubmitDisabled() ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isSubmitDisabled()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
              Saving...
            </>
          ) : isProcessingThumbnail || isProcessingPdf ? (
            <>
              <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
              Processing...
            </>
          ) : isEdit ? (
            "Update Publication"
          ) : (
            "Save Publication"
          )}
        </Button>
      </div>
    </form>
  );
}
