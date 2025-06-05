"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpen, Plus, Search, Download, FileText, Calendar, Eye, Edit } from "lucide-react"

// TypeScript interfaces
interface Publication {
  id: string
  title: string
  description: string
  author: string
  publicationType: string
  publicationDate: string
  category: string
  fileSize: string
  downloadCount: number
  status: "Published" | "Draft" | "Under Review"
}

interface PublicationFormData {
  title: string
  description: string
  author: string
  publicationDate: string
  category: string
  publicationType: string
}

interface PublicationFormProps {
  publication?: Publication
  onSave: (data: PublicationFormData) => void
  onClose: () => void
  isEdit?: boolean
}

interface PublicationViewProps {
  publication: Publication
}

const publications: Publication[] = [
  {
    id: "1",
    title: "Sustainable Agriculture Practices in Northeast India",
    description: "Comprehensive guide on sustainable farming techniques suitable for the northeastern region",
    author: "Dr. John Smith, Dr. Jane Doe",
    publicationType: "Research Paper",
    publicationDate: "2024-05-15",
    category: "Research",
    fileSize: "2.4 MB",
    downloadCount: 245,
    status: "Published",
  },
  {
    id: "2",
    title: "Organic Farming Manual for Small Farmers",
    description: "Step-by-step manual for transitioning to organic farming methods",
    author: "Agricultural Extension Team",
    publicationType: "Manual",
    publicationDate: "2024-04-20",
    category: "Training Material",
    fileSize: "1.8 MB",
    downloadCount: 189,
    status: "Published",
  },
  {
    id: "3",
    title: "Climate-Smart Agriculture Newsletter - Q2 2024",
    description: "Quarterly newsletter featuring latest developments in climate-smart agriculture",
    author: "ICAR-NRCB Editorial Team",
    publicationType: "Newsletter",
    publicationDate: "2024-06-01",
    category: "Newsletter",
    fileSize: "3.2 MB",
    downloadCount: 156,
    status: "Published",
  },
]

export default function PublicationsAdPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)

  const filteredPublications: Publication[] = publications.filter((publication: Publication) => {
    const matchesSearch: boolean =
      publication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publication.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      publication.author.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory: boolean =
      !selectedCategory || selectedCategory === "all" || publication.category === selectedCategory
    const matchesType: boolean = !selectedType || selectedType === "all" || publication.publicationType === selectedType

    return matchesSearch && matchesCategory && matchesType
  })

  const handleView = (publication: Publication): void => {
    setSelectedPublication(publication)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (publication: Publication): void => {
    setSelectedPublication(publication)
    setIsEditDialogOpen(true)
  }

  const handleSave = (formData: PublicationFormData): void => {
    console.log("Saving publication:", formData)
    setIsDialogOpen(false)
    setIsEditDialogOpen(false)
  }

  const handleDownload = (publicationId: string): void => {
    console.log("Downloading publication:", publicationId)
    // In a real app, this would trigger file download
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BookOpen className="h-8 w-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
              <p className="text-sm text-gray-600">Manage research papers, manuals, and educational materials</p>
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
                <DialogDescription>Upload a new publication or document</DialogDescription>
              </DialogHeader>
              <PublicationForm onSave={handleSave} onClose={() => setIsDialogOpen(false)} />
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
                  placeholder="Search publications..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Training Material">Training Material</SelectItem>
                  <SelectItem value="Newsletter">Newsletter</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Policy">Policy</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Publication Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Research Paper">Research Paper</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Newsletter">Newsletter</SelectItem>
                  <SelectItem value="Technical Bulletin">Technical Bulletin</SelectItem>
                  <SelectItem value="Policy Brief">Policy Brief</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Publications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPublications.map((publication: Publication) => (
            <Card key={publication.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{publication.title}</CardTitle>
                    <div className="flex space-x-2 mb-2">
                      <Badge variant="outline">{publication.category}</Badge>
                      <Badge variant="secondary">{publication.publicationType}</Badge>
                    </div>
                  </div>
                  <Badge variant="default">{publication.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{publication.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="h-4 w-4 mr-2" />
                    Author: {publication.author}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    Published: {publication.publicationDate}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Size: {publication.fileSize}</span>
                    <span>Downloads: {publication.downloadCount}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleDownload(publication.id)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(publication)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleView(publication)}>
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPublications.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No publications found matching your criteria</p>
            </CardContent>
          </Card>
        )}

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View Publication</DialogTitle>
              <DialogDescription>View publication details</DialogDescription>
            </DialogHeader>
            {selectedPublication && <PublicationView publication={selectedPublication} />}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Publication</DialogTitle>
              <DialogDescription>Edit publication details</DialogDescription>
            </DialogHeader>
            {selectedPublication && (
              <PublicationForm
                publication={selectedPublication}
                onSave={handleSave}
                onClose={() => setIsEditDialogOpen(false)}
                isEdit={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function PublicationView({ publication }: PublicationViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Publication Title</Label>
        <p className="text-gray-800">{publication.title}</p>
      </div>
      <div>
        <Label>Description</Label>
        <p className="text-gray-800">{publication.description}</p>
      </div>
      <div>
        <Label>Author(s)</Label>
        <p className="text-gray-800">{publication.author}</p>
      </div>
      <div>
        <Label>Publication Date</Label>
        <p className="text-gray-800">{publication.publicationDate}</p>
      </div>
      <div>
        <Label>Category</Label>
        <p className="text-gray-800">{publication.category}</p>
      </div>
      <div>
        <Label>Publication Type</Label>
        <p className="text-gray-800">{publication.publicationType}</p>
      </div>
      <div>
        <Label>File Size</Label>
        <p className="text-gray-800">{publication.fileSize}</p>
      </div>
      <div>
        <Label>Download Count</Label>
        <p className="text-gray-800">{publication.downloadCount}</p>
      </div>
    </div>
  )
}

function PublicationForm({ publication, onSave, onClose, isEdit = false }: PublicationFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(publication?.category || "")
  const [selectedType, setSelectedType] = useState<string>(publication?.publicationType || "")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data: PublicationFormData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      author: formData.get("author") as string,
      publicationDate: formData.get("publicationDate") as string,
      category: selectedCategory,
      publicationType: selectedType,
    }
    onSave(data)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="title">Publication Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter publication title"
          defaultValue={publication?.title || ""}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter publication description"
          defaultValue={publication?.description || ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="author">Author(s)</Label>
          <Input
            id="author"
            name="author"
            placeholder="Enter author names"
            defaultValue={publication?.author || ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="publicationDate">Publication Date</Label>
          <Input
            id="publicationDate"
            name="publicationDate"
            type="date"
            defaultValue={publication?.publicationDate || ""}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Research">Research</SelectItem>
              <SelectItem value="Training Material">Training Material</SelectItem>
              <SelectItem value="Newsletter">Newsletter</SelectItem>
              <SelectItem value="Technical">Technical</SelectItem>
              <SelectItem value="Policy">Policy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="publicationType">Publication Type</Label>
          <Select value={selectedType} onValueChange={setSelectedType} required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Research Paper">Research Paper</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Newsletter">Newsletter</SelectItem>
              <SelectItem value="Technical Bulletin">Technical Bulletin</SelectItem>
              <SelectItem value="Policy Brief">Policy Brief</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="file">Upload File</Label>
        <div className="flex items-center space-x-2">
          <Button type="button" variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Choose File
          </Button>
          <span className="text-sm text-gray-500">PDF, DOC, DOCX (Max 10MB)</span>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {isEdit ? "Update Publication" : "Upload Publication"}
        </Button>
      </div>
    </form>
  )
}
