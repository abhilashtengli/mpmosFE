"use client";

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
  Calendar,
  Plus,
  Search,
  MapPin,
  Clock,
  Users,
  Edit,
  Eye
} from "lucide-react";

// TypeScript interfaces
interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  organizer: string;
  expectedParticipants: number;
  registeredParticipants: number;
  status: "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
  category: "Training" | "Workshop" | "Conference" | "Exhibition" | "Seminar";
}

interface EventFormData {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  organizer: string;
  category: string;
  expectedParticipants: string;
}

interface EventViewProps {
  event: Event;
}

interface EventFormProps {
  event?: Event;
  onSave: (data: EventFormData) => void;
  onClose: () => void;
  isEdit?: boolean;
}

const events: Event[] = [
  {
    id: "1",
    title: "Organic Farming Workshop",
    description:
      "Comprehensive workshop on organic farming techniques and best practices",
    eventDate: "2024-06-15",
    eventTime: "09:00",
    location: "Agricultural Training Center, Guwahati",
    organizer: "ICAR-NRCB",
    expectedParticipants: 50,
    registeredParticipants: 42,
    status: "Upcoming",
    category: "Training"
  },
  {
    id: "2",
    title: "Farmer's Market Exhibition",
    description:
      "Annual exhibition showcasing local agricultural products and innovations",
    eventDate: "2024-06-20",
    eventTime: "10:00",
    location: "District Collectorate Ground, Jorhat",
    organizer: "State Agriculture Department",
    expectedParticipants: 200,
    registeredParticipants: 185,
    status: "Upcoming",
    category: "Exhibition"
  },
  {
    id: "3",
    title: "Sustainable Agriculture Conference",
    description:
      "Conference on sustainable farming practices and climate-smart agriculture",
    eventDate: "2024-05-25",
    eventTime: "09:30",
    location: "Convention Center, Dibrugarh",
    organizer: "Agricultural University",
    expectedParticipants: 150,
    registeredParticipants: 148,
    status: "Completed",
    category: "Conference"
  }
];

export default function EventsAdPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const filteredEvents: Event[] = events.filter((event: Event) => {
    const matchesSearch: boolean =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus: boolean =
      !selectedStatus ||
      selectedStatus === "all" ||
      event.status === selectedStatus;
    const matchesCategory: boolean =
      !selectedCategory ||
      selectedCategory === "all" ||
      event.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleViewEvent = (event: Event): void => {
    setSelectedEvent(event);
    setViewDialogOpen(true);
  };

  const handleEditEvent = (event: Event): void => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const handleSaveEvent = (data: EventFormData): void => {
    console.log("Saving event:", data);
    setIsDialogOpen(false);
    setEditDialogOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const getStatusBadgeVariant = (
    status: Event["status"]
  ): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "Upcoming":
        return "default";
      case "Completed":
        return "secondary";
      default:
        return "destructive";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Upcoming Events
              </h1>
              <p className="text-sm text-gray-600">
                Manage agricultural events and workshops
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Create a new agricultural event or workshop
                </DialogDescription>
              </DialogHeader>
              <EventForm
                onSave={handleSaveEvent}
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
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Exhibition">Exhibition</SelectItem>
                  <SelectItem value="Seminar">Seminar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event: Event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant="outline" className="mt-2">
                      {event.category}
                    </Badge>
                  </div>
                  <Badge variant={getStatusBadgeVariant(event.status)}>
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.eventDate}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    {event.eventTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-2" />
                    {event.registeredParticipants} /{" "}
                    {event.expectedParticipants} registered
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Organized by: {event.organizer}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditEvent(event)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewEvent(event)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                No events found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* View Event Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Event</DialogTitle>
              <DialogDescription>
                View details of the selected event
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && <EventView event={selectedEvent} />}
          </DialogContent>
        </Dialog>

        {/* Edit Event Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Edit details of the selected event
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <EventForm
                event={selectedEvent}
                onSave={handleSaveEvent}
                onClose={() => setEditDialogOpen(false)}
                isEdit={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function EventView({ event }: EventViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-500">Event Title</Label>
        <p className="text-gray-800">{event.title}</p>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-500">Description</Label>
        <p className="text-gray-800">{event.description}</p>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-500">Event Date</Label>
        <p className="text-gray-800">{event.eventDate}</p>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-500">Event Time</Label>
        <p className="text-gray-800">{event.eventTime}</p>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-500">Location</Label>
        <p className="text-gray-800">{event.location}</p>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-500">Organizer</Label>
        <p className="text-gray-800">{event.organizer}</p>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-500">Category</Label>
        <Badge variant="outline">{event.category}</Badge>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-500">
          Expected Participants
        </Label>
        <p className="text-gray-800">{event.expectedParticipants}</p>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-500">
          Registered Participants
        </Label>
        <p className="text-gray-800">{event.registeredParticipants}</p>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-500">Status</Label>
        <Badge variant="outline">{event.status}</Badge>
      </div>
    </div>
  );
}

function EventForm({ event, onSave, onClose, isEdit = false }: EventFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    event?.category || ""
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: EventFormData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      eventDate: formData.get("eventDate") as string,
      eventTime: formData.get("eventTime") as string,
      location: formData.get("location") as string,
      organizer: formData.get("organizer") as string,
      category: selectedCategory,
      expectedParticipants: formData.get("expectedParticipants") as string
    };
    onSave(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter event title"
          defaultValue={event?.title || ""}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter event description"
          defaultValue={event?.description || ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="eventDate">Event Date</Label>
          <Input
            id="eventDate"
            name="eventDate"
            type="date"
            defaultValue={event?.eventDate || ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="eventTime">Event Time</Label>
          <Input
            id="eventTime"
            name="eventTime"
            type="time"
            defaultValue={event?.eventTime || ""}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          placeholder="Enter event location"
          defaultValue={event?.location || ""}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="organizer">Organizer</Label>
          <Input
            id="organizer"
            name="organizer"
            placeholder="Enter organizer name"
            defaultValue={event?.organizer || ""}
            required
          />
        </div>
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
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="Conference">Conference</SelectItem>
              <SelectItem value="Exhibition">Exhibition</SelectItem>
              <SelectItem value="Seminar">Seminar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="expectedParticipants">Expected Participants</Label>
        <Input
          id="expectedParticipants"
          name="expectedParticipants"
          type="number"
          placeholder="Enter expected number of participants"
          defaultValue={event?.expectedParticipants?.toString() || ""}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {isEdit ? "Update Event" : "Save Event"}
        </Button>
      </div>
    </form>
  );
}
