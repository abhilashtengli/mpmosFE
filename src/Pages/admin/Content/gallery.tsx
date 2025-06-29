"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ImageIcon,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  UploadCloud
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import axios, { type AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { getSignedUrl } from "@/services/cloudflare/getSignedUrl";
import deleteFileFromCloudflare from "@/services/cloudflare/deleteFileFromCloudflare";
import uploadFileToCloudflare from "@/services/cloudflare/uploadFileToCloudFlare";
import { Base_Url } from "@/lib/constants";
import iimr from "@/assets/IIMR_logo.jpg";
import aicrp from "@/assets/AICRP_logo.png";
import cpgs from "@/assets/CPGS_logo.jpg";
// Validation schemas matching backend
const createGalleryValidation = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, { message: "Title must be at least 5 characters" })
      .max(100, { message: "Title cannot exceed 100 characters" }),
    imageUrl: z.string().trim().url({ message: "Invalid image URL format" }),
    imageKey: z.string().trim().min(1, { message: "Image key is required" })
  })
  .refine(
    (data) => {
      if (data.imageUrl && !data.imageKey) {
        return false;
      }
      return true;
    },
    {
      message: "Image key is required when image URL is provided",
      path: ["imageKey"]
    }
  );

const updateGalleryValidation = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, { message: "Title must be at least 5 characters" })
      .max(100, { message: "Title cannot exceed 100 characters" })
      .optional(),
    imageUrl: z
      .string()
      .trim()
      .url({ message: "Invalid image URL format" })
      .optional(),
    imageKey: z.string().trim().optional()
  })
  .refine(
    (data) => {
      if (data.imageUrl === undefined) {
        return true;
      }
      if (data.imageUrl && !data.imageKey) {
        return false;
      }
      return true;
    },
    {
      message: "Image key is required when image URL is provided",
      path: ["imageKey"]
    }
  );

// TypeScript interfaces
interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  imageKey: string;
  createdAt: string;
  updatedAt?: string;
  User?: {
    id: string;
    name: string;
  };
}

interface GalleryFormData {
  title: string;
  imageUrl: string | null;
  imageKey: string | null;
  imageFile?: File | null;
}

interface GalleryFormProps {
  gallery?: GalleryItem;
  onSave: (data: GalleryFormData) => Promise<boolean>;
  onClose: () => void;
  isEdit?: boolean;
}

interface ImageViewProps {
  gallery: GalleryItem;
}

interface FormErrors {
  [key: string]: string;
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  code: string;
  errors?: unknown;
}

interface ApiSuccessResponse {
  success: true;
  message: string;
  data: GalleryItem;
  code: string;
}

interface SignedUrlResponse {
  signedUrl: string;
  publicUrl: string;
  key: string;
}

export default function GalleryAdPage() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const userRole = useAuthStore((state) => state.user);

  // Fetch gallery data
  const fetchGalleries = async () => {
    try {
      setIsLoading(true);

      const endpoint =
        userRole?.role === "admin" ? "get-all-gallery" : "get-user-gallery";
      const response = await axios.get(`${Base_Url}/${endpoint}`, {
        withCredentials: true
      });

      const data = response.data;

      if (!data.success || response.status !== 200) {
        throw new Error(data.message || "Failed to fetch gallery items");
      }

      setGalleries(data.data || []);
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
            "An unexpected error occurred while fetching gallery items"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  // Filter galleries based on search
  const filteredGalleries: GalleryItem[] = galleries.filter(
    (gallery: GalleryItem) => {
      const matchesSearch: boolean = gallery.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    }
  );

  const handleView = (gallery: GalleryItem): void => {
    setSelectedGallery(gallery);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (gallery: GalleryItem): void => {
    setSelectedGallery(gallery);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (gallery: GalleryItem): void => {
    setSelectedGallery(gallery);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (
    formData: GalleryFormData,
    operation: "create" | "update" = "create",
    galleryId?: string
  ): Promise<boolean> => {
    if (operation === "update" && !galleryId) {
      toast.error("Gallery ID is required for update operation");
      return false;
    }

    // Validate required fields for creation
    if (operation === "create") {
      if (!formData.title?.trim()) {
        toast.error("Gallery title is required");
        return false;
      }
    }

    // Show loading toast
    const loadingToast = toast.loading(
      `${operation === "create" ? "Creating" : "Updating"} gallery item...`
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
        imageUrl: formData.imageUrl || null,
        imageKey: formData.imageKey || null
      };

      if (operation === "create") {
        response = await axios.post(
          `${Base_Url}/add-gallery`,
          requestData,
          config
        );
      } else {
        response = await axios.put(
          `${Base_Url}/update-gallery/${galleryId}`,
          requestData,
          config
        );
      }

      // Handle successful response
      if (response?.status === 201 || response?.status === 200) {
        const data = response.data as ApiSuccessResponse;

        toast.success(
          data.message || `Gallery item ${operation}d successfully`,
          {
            description: `${data.data.title}`,
            duration: 6000
          }
        );

        // Update local state
        if (operation === "create") {
          const newGallery: GalleryItem = {
            id: data.data.id,
            title: data.data.title,
            imageUrl: data.data.imageUrl,
            imageKey: data.data.imageKey,
            createdAt: data.data.createdAt,
            updatedAt: data.data.updatedAt,
            User: data.data.User
          };
          setGalleries((prev) => [newGallery, ...prev]);
        } else if (operation === "update" && galleryId) {
          setGalleries((prev) =>
            prev.map((g) =>
              g.id === galleryId
                ? {
                    ...g,
                    title: data.data.title,
                    imageUrl: data.data.imageUrl,
                    imageKey: data.data.imageKey,
                    updatedAt: data.data.updatedAt
                  }
                : g
            )
          );
        }

        // Close dialogs on success
        setIsDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedGallery(null);

        return true;
      } else {
        toast.error(`Unexpected response status: ${response?.status}`);
        return false;
      }
    } catch (error) {
      console.error(`Error ${operation}ing gallery:`, error);

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

  const handleDeleteGallery = async () => {
    if (!selectedGallery) {
      toast.error("No Gallery item selected", {
        description: "Please select a gallery item to delete"
      });
      return;
    }

    setDeleting(true);

    const loadingToast = toast.loading(
      `Deleting "${selectedGallery.title}"...`
    );

    try {
      const response = await axios.delete(
        `${Base_Url}/delete-gallery/${selectedGallery.id}`,
        {
          withCredentials: true,
          timeout: 30000
        }
      );

      if (response.status === 200 && response.data.success) {
        if (response.data.warning) {
          toast.warning("Gallery item deleted with file issues", {
            description: `${selectedGallery.title} was removed from your account, but ${response.data.warning}`,
            duration: 6000
          });
        } else {
          toast.success("Gallery item deleted", {
            description: selectedGallery.title + " deleted successfully",
            duration: 5000
          });
        }
        setGalleries((prevGalleries) =>
          prevGalleries.filter((gallery) => gallery.id !== selectedGallery.id)
        );
        setSelectedGallery(null);
        setIsDeleteDialogOpen(false);
      } else {
        toast.error("Deletion failed", {
          description:
            response.data?.message || "Gallery deletion was not completed"
        });
      }
    } catch (error: unknown) {
      console.error("Delete gallery error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        const errorMap: Record<number, { title: string; fallback: string }> = {
          400: {
            title: "Invalid request",
            fallback: "The gallery ID is invalid"
          },
          401: { title: "Authentication required", fallback: "Please sign in" },
          403: { title: "Access denied", fallback: "Permission denied" },
          404: {
            title: "Gallery item not found",
            fallback: "Gallery item may already be deleted"
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
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
              <GalleryForm
                onSave={(formData) => handleSave(formData, "create")}
                onClose={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {/* Search */}
        <div className="mb-3  w-full">
          <div className="mb-3">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 w-full"
              />
            </div>
          </div>
          <hr />
        </div>
        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGalleries.map((gallery: GalleryItem) => (
              <Card
                key={gallery.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="mb-4">
                    <img
                      src={gallery.imageUrl || "/placeholder.svg"}
                      alt={gallery.title}
                      className="w-full h-48 object-cover rounded-md cursor-pointer"
                      onClick={() => handleView(gallery)}
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">
                    {gallery.title}
                  </h3>

                  <div className="space-y-1 mb-4">
                    {gallery.User && (
                      <div className="text-sm text-gray-500">
                        Created by: {gallery.User.name}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      Created:{" "}
                      {new Date(gallery.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(gallery)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(gallery)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(gallery)}
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

        {filteredGalleries.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                No photos found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Photo Details</DialogTitle>
              <DialogDescription>
                View complete photo information
              </DialogDescription>
            </DialogHeader>
            {selectedGallery && <ImageView gallery={selectedGallery} />}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Photo</DialogTitle>
              <DialogDescription>Update photo information</DialogDescription>
            </DialogHeader>
            {selectedGallery && (
              <GalleryForm
                gallery={selectedGallery}
                onSave={(formData) =>
                  handleSave(formData, "update", selectedGallery.id)
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
                ⚠️ Confirm Photo Deletion
              </DialogTitle>
              <DialogDescription>
                <br />
                <span className="block mt-2">
                  Are you sure you want to delete this photo?
                </span>
                <span className="text-xs text-muted-foreground">
                  This action cannot be undone.
                </span>
              </DialogDescription>
            </DialogHeader>

            {selectedGallery && (
              <div className="grid gap-2 py-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Title: </span>
                  {selectedGallery?.title}
                </div>
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
                  handleDeleteGallery();
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

function ImageView({ gallery }: ImageViewProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-500">
            Photo Title
          </Label>
          <p className="text-md font-semibold">{gallery.title}</p>
        </div>
      </div>
      <hr />
      <div>
        <Label className="text-sm font-medium text-gray-500">Image</Label>
        <div className="mt-2">
          <img
            src={gallery.imageUrl || "/placeholder.svg"}
            alt={gallery.title}
            className="w-full h-auto max-h-96 object-contain rounded-md"
          />
        </div>
      </div>
      <hr />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
        <div>
          <Label className="flex items-center">
            Created At{" "}
            <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
          </Label>
          <p className="tracking-wider mt-2">
            {new Date(gallery.createdAt).toLocaleString()}
          </p>
        </div>
        {gallery.updatedAt && (
          <div>
            <Label className="flex items-center">
              Last Updated{" "}
              <p className="text-[10px] text-gray-400">( MM/DD/YYYY )</p>
            </Label>
            <p className="tracking-wider mt-2">
              {new Date(gallery.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
        {gallery.User && (
          <div>
            <Label>Created By</Label>
            <p className="tracking-wider mt-2">{gallery.User.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryForm({
  gallery,
  onSave,
  onClose,
  isEdit = false
}: GalleryFormProps) {
  const [formData, setFormData] = useState<GalleryFormData>({
    title: gallery?.title || "",
    imageUrl: gallery?.imageUrl || null,
    imageKey: gallery?.imageKey || null,
    imageFile: null
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<SignedUrlResponse | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageToBeRemovedKey, setImageToBeRemovedKey] = useState<string | null>(
    null
  );
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (isEdit && gallery?.imageUrl) {
      setImagePreviewUrl(gallery.imageUrl);
      setFormData((prev) => ({
        ...prev,
        imageUrl: gallery.imageUrl,
        imageKey: gallery.imageKey
      }));
    }
  }, [isEdit, gallery]);

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

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (!file) {
      toast.warning("File is missing", {
        description: "Please select an image to upload."
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        imageFile: "File size must be less than 5MB"
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,
        imageFile: "Please select a valid image file"
      }));
      return;
    }

    setIsProcessingImage(true);

    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localPreviewUrl);
    setFormData((prev) => ({
      ...prev,
      imageFile: file,
      imageUrl: "",
      imageKey: ""
    }));
    setImageToBeRemovedKey(null);
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.imageFile;
      delete newErrors.imageUrl;
      delete newErrors.imageKey;
      return newErrors;
    });

    try {
      const signedUrlData = await getSignedUrl({
        fileName: file.name,
        contentType: file.type
      });

      setImageUrl(signedUrlData);
      toast.success("Image selected", {
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB)`
      });
    } catch {
      toast.error("Failed to get upload URL", {
        description: "Could not prepare image for upload. Please try again."
      });
      URL.revokeObjectURL(localPreviewUrl);
      setImagePreviewUrl(isEdit && gallery?.imageUrl ? gallery.imageUrl : null);
      setFormData((prev) => ({ ...prev, imageFile: null }));
      setImageUrl(null);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveImage = (): void => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imageUrl: "",
      imageKey: ""
    }));
    setImageUrl(null);

    if (isEdit && gallery?.imageKey) {
      setImageToBeRemovedKey(gallery.imageKey);
    } else {
      setImageToBeRemovedKey(null);
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    toast.info("Image removed");
  };

  const isSubmitDisabled = (): boolean => {
    if (isSubmitting === true) return true;
    if (isProcessingImage === true) return true;
    if (formData.imageFile && (!imageUrl || !imageUrl.signedUrl)) return true;
    return false;
  };

  const validateForm = (): boolean => {
    try {
      const dataToValidate = {
        title: formData.title,
        imageUrl: formData.imageFile
          ? "https://example.com/dummy.jpg"
          : formData.imageUrl || "",
        imageKey: formData.imageFile ? "dummy-key" : formData.imageKey || ""
      };

      if (isEdit) {
        updateGalleryValidation.parse(dataToValidate);
      } else {
        createGalleryValidation.parse(dataToValidate);
      }
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0].toString();
          if (path === "imageUrl" && formData.imageFile) return;
          if (path === "imageKey" && formData.imageFile) return;
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
    let finalImageUrl: string | null = gallery?.imageUrl || null;
    let finalImageKey: string | null = gallery?.imageKey || null;

    try {
      // Handle image removal
      if (imageToBeRemovedKey) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const deleted = await deleteFileFromCloudflare(imageToBeRemovedKey);
        if (deleted) {
          finalImageUrl = null;
          finalImageKey = null;
          toast.success("Previous image deleted from storage.");
        } else {
          toast.warning("Previous image deletion failed", {
            description:
              "The old image couldn't be removed from storage, but your changes will still be saved."
          });
        }
      }

      // Handle image upload
      if (formData.imageFile && imageUrl?.signedUrl) {
        if (
          isEdit &&
          gallery?.imageKey &&
          !imageToBeRemovedKey &&
          formData.imageFile
        ) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const oldKeyDeleted = await deleteFileFromCloudflare(
            gallery.imageKey
          );
          if (!oldKeyDeleted) {
            toast.warning("Old Image Deletion Issue", {
              description:
                "Could not delete the previously existing image from storage."
            });
          }
        }

        const uploadResult = await uploadFileToCloudflare(
          formData.imageFile,
          imageUrl.signedUrl
        );
        if (uploadResult.success && imageUrl.publicUrl && imageUrl.key) {
          finalImageUrl = imageUrl.publicUrl;
          finalImageKey = imageUrl.key;
          toast.success("Image uploaded successfully");
        } else {
          toast.error("Image Upload Failed", {
            description: uploadResult.error || "Could not upload the new image."
          });
          setIsSubmitting(false);
          return;
        }
      }

      const dataToSave: GalleryFormData = {
        ...formData,
        imageUrl: finalImageUrl || "",
        imageKey: finalImageKey || ""
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
      <div>
        <Label htmlFor="title">
          Photo Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter photo title (max 100 characters)"
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

      <div>
        <Label htmlFor="imageFile">
          Image {!isEdit && <span className="text-red-500">*</span>}
        </Label>
        <div
          className={`mt-3 p-4 border-2 ${
            formErrors.imageFile || formErrors.imageUrl
              ? "border-red-500"
              : "border-gray-300"
          } border-dashed rounded-md`}
        >
          {imagePreviewUrl ? (
            <div className="space-y-2">
              <div className="relative group w-full h-auto max-h-60 md:max-h-80 rounded-md overflow-hidden">
                {isImageLoading && (
                  <div className="absolute inset-0 z-10 shimmer-effect rounded-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-[pulse_2s_ease-in-out_infinite_alternate]"></div>
                  </div>
                )}
                <img
                  src={imagePreviewUrl || "/placeholder.svg"}
                  alt="Image preview"
                  onLoad={() => setIsImageLoading(false)}
                  onError={() => setIsImageLoading(false)}
                  className={`w-full h-full object-contain transition-opacity duration-300 ${
                    isImageLoading ? "opacity-0" : "opacity-100"
                  }`}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-red-600/80 text-white"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {formData.imageFile && (
                <p className="text-xs text-green-600">
                  New image selected: {formData.imageFile.name} (
                  {(formData.imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" /> Change Image
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
                  onClick={() => imageInputRef.current?.click()}
                >
                  Click to upload an image
                </Button>
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
          <Input
            id="imageFile"
            name="imageFile"
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {(formErrors.imageFile || formErrors.imageUrl) && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.imageFile || formErrors.imageUrl}
            </p>
          )}
          {isProcessingImage && (
            <div className="text-sm text-green-600 mt-2 text-center">
              <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
              Preparing image for upload...
            </div>
          )}
          {formData.imageFile && !imageUrl?.signedUrl && !isProcessingImage && (
            <div className="text-sm text-amber-600 mt-2 text-center">
              ⚠️ Image selected but not ready for upload. Please wait or try
              selecting again.
            </div>
          )}
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
          ) : isProcessingImage ? (
            <>
              <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
              Processing...
            </>
          ) : isEdit ? (
            "Update Photo"
          ) : (
            "Save Photo"
          )}
        </Button>
      </div>
    </form>
  );
}
