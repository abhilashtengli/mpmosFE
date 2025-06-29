"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import type React from "react";

import { z } from "zod";
import { toast } from "sonner";
import axios, { type AxiosError } from "axios";
import { format, parseISO, isPast } from "date-fns";

import {
  Card,
  CardContent,
  CardFooter,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Plus,
  Search,
  MapPin,
  Edit,
  Eye,
  Trash2,
  AlertCircle,
  UserCircle
} from "lucide-react";

import { useAuthStore } from "@/stores/useAuthStore"; // Assuming you have this store
import { Base_Url } from "@/lib/constants"; // Assuming you have this
import EnhancedShimmerCard from "@/components/shimmer-card"; // Assuming a shimmer component
import iimr from "@/assets/IIMR_logo.jpg";
import aicrp from "@/assets/AICRP_logo.png";
import cpgs from "@/assets/CPGS_logo.jpg";
// Zod Validation Schemas (as provided by user)
const upcomingEventValidation = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: "Title must be at least 5 characters" })
    .max(100, { message: "Title cannot exceed 100 characters" }),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .refine(
      (date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)),
      "Date must be today or in the future"
    ) // Allow today
    .transform((date) => new Date(date)),
  location: z
    .string()
    .trim()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(100, { message: "Location cannot exceed 100 characters" }),
  description: z
    .string()
    .trim()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(300, { message: "Description cannot exceed 300 characters" })
    .optional()
});

const upcomingEventUpdateValidation = z.object({
  title: z
    .string()
    .trim()
    .optional()
    .refine((val) => val === undefined || val.length === 0 || val.length >= 5, {
      message: "Title must be at least 5 characters if provided"
    })
    .refine(
      (val) => val === undefined || val.length === 0 || val.length <= 100,
      {
        message: "Title cannot exceed 100 characters if provided"
      }
    ),
  date: z
    .string()
    .optional()
    .refine(
      (date) =>
        date === undefined || date.length === 0 || !isNaN(Date.parse(date)),
      "Invalid date format if provided"
    )
    .refine(
      (date) =>
        date === undefined ||
        date.length === 0 ||
        new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)),
      "Date must be today or in the future if provided"
    ) // Allow today
    .transform((date) => (date ? new Date(date) : undefined)),
  location: z
    .string()
    .trim()
    .optional()
    .refine((val) => val === undefined || val.length === 0 || val.length >= 2, {
      message: "Location must be at least 2 characters if provided"
    })
    .refine(
      (val) => val === undefined || val.length === 0 || val.length <= 100,
      {
        message: "Location cannot exceed 100 characters if provided"
      }
    ),
  description: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => val === undefined || val.length === 0 || val.length >= 10,
      {
        message: "Description must be at least 10 characters if provided"
      }
    )
    .refine(
      (val) => val === undefined || val.length === 0 || val.length <= 300,
      {
        message: "Description cannot exceed 300 characters if provided"
      }
    )
});

// Interfaces
interface RawUpcomingEvent {
  id: string;
  title: string;
  date: string; // ISO string from backend
  location: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  User?: {
    id: string;
    name: string;
  } | null;
}

interface UpcomingEvent extends Omit<RawUpcomingEvent, "date" | "User"> {
  date: Date; // Date object for frontend
  status: "Upcoming" | "Completed";
  user?: {
    id: string;
    name: string;
  } | null;
}

interface UpcomingEventFormData {
  title: string;
  date: string; // Keep as string for form input, convert on submit
  location: string;
  description?: string;
}

type FormErrors = Partial<Record<keyof UpcomingEventFormData, string>>;

interface EventViewProps {
  event: UpcomingEvent;
}

interface EventFormProps {
  event?: UpcomingEvent;
  onSave: (data: UpcomingEventFormData, eventId?: string) => Promise<boolean>;
  onClose: () => void;
  isEdit?: boolean;
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  code: string;
  errors?: { _errors: string[] } & { [key: string]: { _errors: string[] } };
}

export default function EventsAdPage() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<UpcomingEvent | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all"); // "all", "upcoming", "past"

  const user = useAuthStore((state) => state.user);

  const transformEvent = useCallback(
    (rawEvent: RawUpcomingEvent): UpcomingEvent => {
      const eventDate = parseISO(rawEvent.date);
      return {
        ...rawEvent,
        date: eventDate,
        status:
          isPast(eventDate) && !isToday(eventDate) ? "Completed" : "Upcoming",
        user: rawEvent.User,
        description: rawEvent.description ?? undefined
      };
    },
    []
  );

  const isToday = (someDate: Date) => {
    const today = new Date();
    return (
      someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear()
    );
  };

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint =
        user?.role === "admin" ? "get-all-events" : "get-user-events";
      const response = await axios.get<{
        success: boolean;
        data: RawUpcomingEvent[];
        message?: string;
      }>(`${Base_Url}/${endpoint}`, { withCredentials: true });

      if (response.data.success) {
        setEvents(response.data.data.map(transformEvent));
      } else {
        throw new Error(response.data.message || "Failed to fetch events");
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "An unexpected error occurred";
      setError(message);
      toast.error("Fetch Error", { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, transformEvent]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSaveEvent = async (
    formData: UpcomingEventFormData,
    eventId?: string
  ): Promise<boolean> => {
    const loadingToast = toast.loading(
      eventId ? "Updating event..." : "Creating event..."
    );
    try {
      const url = eventId
        ? `${Base_Url}/update-event/${eventId}`
        : `${Base_Url}/add-event`;
      const method = eventId ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: formData,
        withCredentials: true
      });

      if (response.data.success) {
        toast.success("Success", {
          description: `Event ${eventId ? "updated" : "created"} successfully.`,
          id: loadingToast
        });
        fetchEvents(); // Refresh list
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
        return true;
      } else {
        throw new Error(response.data.message || "Operation failed");
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "An error occurred.";
      toast.error("Error", { description: message, id: loadingToast });
      return false;
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    const loadingToast = toast.loading("Deleting event...");
    try {
      setDeleting(true);
      const response = await axios.delete(
        `${Base_Url}/delete-event/${selectedEvent.id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Success", {
          description: "Event deleted successfully.",
          id: loadingToast
        });
        // fetchEvents(); // Refresh list
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== selectedEvent.id)
        );
        setIsDeleteDialogOpen(false);
        setSelectedEvent(null);
      } else {
        throw new Error(response.data.message || "Deletion failed");
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "An error occurred.";
      toast.error("Error", { description: message, id: loadingToast });
    } finally {
      setDeleting(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        searchTerm === "" ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description &&
          event.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLocation =
        locationFilter === "all" || event.location === locationFilter;

      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "upcoming" && event.status === "Upcoming") ||
        (dateFilter === "past" && event.status === "Completed");

      return matchesSearch && matchesLocation && matchesDate;
    });
  }, [events, searchTerm, locationFilter, dateFilter]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(events.map((event) => event.location));
    return Array.from(locations);
  }, [events]);

  const handleViewEvent = (event: UpcomingEvent) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const handleEditEvent = (event: UpcomingEvent) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDeleteConfirmation = (event: UpcomingEvent) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <header className="bg-white border-b border-gray-200 px-6 py-4 mb-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
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
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Upcoming Events
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Manage and track agricultural events and workshops.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)} // This will trigger the main dialog
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </header>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-700">
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-6.5 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past/Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <EnhancedShimmerCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && filteredEvents.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="text-center py-12">
            <CalendarDays className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No events found.</p>
            <p className="text-gray-400 text-sm">
              Try adjusting your filters or create a new event.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-800 leading-tight">
                    {event.title}
                  </CardTitle>
                  <Badge
                    variant={
                      event.status === "Completed" ? "secondary" : "default"
                    }
                    className={`capitalize text-xs px-2 py-1 ${
                      event.status === "Completed"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-xs sm:text-sm">
                {event.description && (
                  <p className="text-gray-600 line-clamp-2">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center text-gray-500">
                  <CalendarDays className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                  <span>{format(event.date, "PPP")}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
                {event.user?.name && user?.role === "admin" && (
                  <div className="flex items-center text-gray-500 pt-1">
                    <UserCircle className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    <span>Created by : {event.user.name}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-3 pb-3 px-4">
                <div className="flex w-full justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewEvent(event)}
                    className="text-xs px-2 py-1"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                  {/* Only allow edit/delete if user created it or is admin */}
                  {(event.user?.id === user?.id || user?.role === "admin") && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditEvent(event)}
                        className="text-xs px-2 py-1"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteConfirmation(event)}
                        className="text-xs px-2 py-1"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1 text-red-600" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={
          isAddDialogOpen ? setIsAddDialogOpen : setIsEditDialogOpen
        }
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? "Edit Event" : "Add New Event"}
            </DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Update the details of the event."
                : "Fill in the details to create a new event."}
            </DialogDescription>
          </DialogHeader>
          <EventForm
            event={isEditDialogOpen ? selectedEvent ?? undefined : undefined} // Ensure null becomes undefined
            onSave={handleSaveEvent}
            onClose={() => {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedEvent(null);
            }}
            isEdit={isEditDialogOpen}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Event Details
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && <EventView event={selectedEvent} />}
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete the event "
              <strong>{selectedEvent?.title}</strong>"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDeleteEvent}
            >
              {deleting ? "Deleting.." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventView({ event }: EventViewProps) {
  return (
    <div className="space-y-5 p-2 pt-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{event.title}</h2>{" "}
        <Badge
          variant={event.status === "Completed" ? "secondary" : "default"}
          className={`capitalize text-xs px-2 py-0.5 ${
            event.status === "Completed"
              ? "bg-gray-200 text-gray-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {event.status}
        </Badge>
      </div>

      {event.description && (
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Description
          </Label>
          <p className="text-gray-700 mt-1 text-sm leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-200">
            {event.description}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
          </Label>
          <div className="flex items-center text-gray-700 mt-1 text-sm">
            <CalendarDays className="h-4 w-4 mr-2 text-green-600" />
            {format(event.date, "EEEE, MMMM d, yyyy")}
          </div>
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Location
          </Label>
          <div className="flex items-center text-gray-700 mt-1 text-sm">
            <MapPin className="h-4 w-4 mr-2 text-green-600" />
            {event.location}
          </div>
        </div>
      </div>

      {event.user?.name && (
        <div>
          <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Created By
          </Label>
          <div className="flex items-center text-gray-700 mt-1 text-sm">
            <UserCircle className="h-4 w-4 mr-2 text-green-600" />
            {event.user.name}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-3 mt-5">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">Created:</span>{" "}
            {format(parseISO(event.createdAt), "PPp")}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span>{" "}
            {format(parseISO(event.updatedAt), "PPp")}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventForm({ event, onSave, onClose, isEdit = false }: EventFormProps) {
  const [formData, setFormData] = useState<UpcomingEventFormData>({
    title: event?.title || "",
    // Format date to YYYY-MM-DD for input type="date"
    date: event?.date ? format(event.date, "yyyy-MM-dd") : "",
    location: event?.location || "",
    description: event?.description || ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const validationSchema = isEdit
      ? upcomingEventUpdateValidation
      : upcomingEventValidation;

    // For updates, filter out empty fields so they are not sent and validated if not intended for update
    let dataToValidateForZod: Partial<UpcomingEventFormData>;
    if (isEdit) {
      dataToValidateForZod = {};
      // For edit, only include fields that have a value or are explicitly being cleared (like description)
      (Object.keys(formData) as Array<keyof UpcomingEventFormData>).forEach(
        (key) => {
          const value = formData[key];
          if (value !== "" && value !== undefined && value !== null) {
            (dataToValidateForZod as UpcomingEventFormData)[key] = value;
          } else if (
            key === "description" &&
            (value === "" || value === null || value === undefined) &&
            event?.description !== value
          ) {
            // Allow description to be explicitly cleared if it was previously set
            // Send empty string to signify clearing, or null/undefined if API handles it
            (dataToValidateForZod as UpcomingEventFormData)[key] = ""; // Zod optional will handle empty string if transformed
          }
          // For other fields, if they are empty, they won't be included.
          // Zod's .optional() will treat them as not present.
        }
      );
    } else {
      dataToValidateForZod = formData; // For create, all fields in formData are relevant
    }
    const result = validationSchema.safeParse(dataToValidateForZod);

    if (!result.success) {
      const newErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0] as keyof UpcomingEventFormData] = err.message;
      });
      setErrors(newErrors);
      setIsSubmitting(false);
      toast.error("Validation Error", {
        description: "Please check the form fields for errors."
      });
      return;
    }

    // Ensure date is in ISO format if present for update, or always for create
    const dataToSave = {
      ...result.data,
      date: result.data.date
        ? format(result.data.date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
        : undefined
    };

    // If it's an update and a field is empty, we might not want to send it
    // The backend validation for update is optional, so empty strings might be fine if not undefined
    // However, the current Zod transform makes them undefined if empty.
    // Let's ensure we send the validated data (which might have undefined fields for optional ones)
    const finalDataToSend = isEdit
      ? dataToSave
      : {
          ...dataToSave,
          date: format(result.data.date as Date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx") // date is required for create
        };

    const success = await onSave(
      finalDataToSend as UpcomingEventFormData, // Cast because date might be Date object from Zod
      event?.id
    );
    if (success) {
      onClose();
    }
    setTimeout(() => {
      setIsSubmitting(false);
    }, 30000); // 30000 milliseconds = 30 seconds
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 py-2">
      <div>
        <Label htmlFor="title">
          Event Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g., Workshop on Modern Irrigation"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">
            Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            className={errors.date ? "border-red-500" : ""}
            min={format(new Date(), "yyyy-MM-dd")} // Prevent past dates
          />
          {errors.date && (
            <p className="text-xs text-red-500 mt-1">{errors.date}</p>
          )}
        </div>
        <div>
          <Label htmlFor="location">
            Location <span className="text-red-500">*</span>
          </Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g., District Training Hall"
            value={formData.location}
            onChange={handleChange}
            className={errors.location ? "border-red-500" : ""}
          />
          {errors.location && (
            <p className="text-xs text-red-500 mt-1">{errors.location}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Provide a brief overview of the event (optional)"
          value={formData.description}
          onChange={handleChange}
          className={`h-24 ${
            errors.description ? "border-red-500 mt-2" : "mt-2"
          }`}
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1">{errors.description}</p>
        )}
      </div>

      <DialogFooter className="pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
            ? "Update Event"
            : "Create Event"}
        </Button>
      </DialogFooter>
    </form>
  );
}
