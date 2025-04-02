import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  MapPin,
  Calendar,
  Coins,
  Users,
  Target,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// This is a placeholder for AICRP NEH projects
// You would replace this with actual project data
const projects = [
  {
    id: 1,
    title: "AICRP on Small Millets - Arunachal Pradesh Centre",
    year: "2023",
    budget: "12 Lakhs",
    centre: "College of Agriculture, Pasighat",
    location: "Arunachal Pradesh",
    objectives: [
      "Evaluation of small millets germplasm for yield and quality traits",
      "Development of high yielding varieties of small millets",
      "Standardization of production technologies for small millets",
      "Demonstration of improved technologies through frontline demonstrations"
    ],
    director: "Dr. Rajesh Kumar",
    coDirectors: ["Dr. Anita Singh", "Dr. Manoj Patel"],
    achievements: [
      "Released 2 high-yielding varieties of finger millet",
      "Conducted 15 frontline demonstrations covering 50 hectares",
      "Trained 200 farmers on improved cultivation practices"
    ],
    image: "/placeholder.svg?height=300&width=500&text=AICRP+Arunachal+Pradesh"
  },
  {
    id: 2,
    title: "AICRP on Sorghum - Manipur Centre",
    year: "2022",
    budget: "15 Lakhs",
    centre: "College of Agriculture, Imphal",
    location: "Manipur",
    objectives: [
      "Evaluation of sorghum germplasm for fodder and grain yield",
      "Development of dual-purpose sorghum varieties",
      "Management of major pests and diseases of sorghum",
      "Promotion of sorghum cultivation in tribal areas"
    ],
    director: "Dr. Sanjay Sharma",
    coDirectors: ["Dr. Priya Gupta", "Dr. Rahul Verma"],
    achievements: [
      "Identified 3 promising lines for dual-purpose use",
      "Developed integrated pest management package",
      "Established seed production chain involving 50 farmers"
    ],
    image: "/placeholder.svg?height=300&width=500&text=AICRP+Manipur"
  },
  {
    id: 3,
    title: "AICRP on Pearl Millet - Meghalaya Centre",
    year: "2021",
    budget: "14 Lakhs",
    centre: "ICAR Research Complex for NEH Region, Umiam",
    location: "Meghalaya",
    objectives: [
      "Evaluation of pearl millet germplasm for high altitude adaptation",
      "Development of biofortified pearl millet varieties",
      "Standardization of organic production technologies",
      "Promotion of pearl millet as a climate-resilient crop"
    ],
    director: "Dr. Neelam Patel",
    coDirectors: ["Dr. Vikram Singh", "Dr. Meena Kumari"],
    achievements: [
      "Identified 5 high-iron and zinc lines suitable for the region",
      "Developed organic package of practices",
      "Established 10 demonstration units in farmers' fields"
    ],
    image: "/placeholder.svg?height=300&width=500&text=AICRP+Meghalaya"
  },
  {
    id: 4,
    title: "AICRP on Small Millets - Tripura Centre",
    year: "2023",
    budget: "13 Lakhs",
    centre: "College of Agriculture, Tripura",
    location: "Tripura",
    objectives: [
      "Evaluation of small millets for drought tolerance",
      "Development of early maturing varieties",
      "Standardization of intercropping systems with small millets",
      "Value addition and product development from small millets"
    ],
    director: "Dr. Amit Kumar",
    coDirectors: ["Dr. Sunita Devi", "Dr. Rajesh Yadav"],
    achievements: [
      "Identified 3 drought-tolerant finger millet lines",
      "Standardized millet-legume intercropping system",
      "Developed 5 value-added products from finger millet"
    ],
    image: "/placeholder.svg?height=300&width=500&text=AICRP+Tripura"
  }
];

// Get unique locations
const locations = [
  "All",
  ...Array.from(new Set(projects.map(project => project.location)))
];

export default function AICRPProjectsPage() {
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  useEffect(
    () => {
      if (selectedLocation === "All") {
        setFilteredProjects(projects);
      } else {
        setFilteredProjects(
          projects.filter(project => project.location === selectedLocation)
        );
      }
      // Reset expanded project when changing location
      setExpandedProject(null);
    },
    [selectedLocation]
  );

  const toggleProject = (id: number) => {
    setExpandedProject(expandedProject === id ? null : id);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900 to-green-50" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_left,#ffffff,transparent_70%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl drop-shadow-md">
              AICRP NEH Projects
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-base text-white font-medium drop-shadow-sm">
              All India Coordinated Research Projects on Millets in the North
              Eastern Hilly Region
            </p>
          </motion.div>

          {/* Location Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs
              defaultValue="All"
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              className="mx-auto max-w-3xl"
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-green-800/80 backdrop-blur-sm">
                {locations.map(location =>
                  <TabsTrigger
                    key={location}
                    value={location}
                    className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-white font-medium"
                  >
                    {location}
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid gap-8"
          >
            <AnimatePresence>
              {filteredProjects.map((project, index) =>
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  layout
                >
                  <ProjectCard
                    project={project}
                    isExpanded={expandedProject === project.id}
                    onToggle={() => toggleProject(project.id)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {filteredProjects.length === 0 &&
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto my-16 text-center"
              >
                <p className="text-xl text-zinc-500">
                  No projects found for this location.
                </p>
              </motion.div>}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-zinc-800 to-zinc-900 py-12 text-zinc-100 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Millets-Project Monitoring System. All rights reserved.</p>
          <p className="mt-2">
            Funded by the Ministry of Agriculture and Farmers' Welfare,
            Government of India.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface ProjectCardProps {
  project: (typeof projects)[0];
  isExpanded: boolean;
  onToggle: () => void;
}

function ProjectCard({ project, isExpanded, onToggle }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-green-800">
              {project.title}
            </h2>
            <Badge className="bg-zinc-800 hover:bg-zinc-900 text-white">
              {project.location}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">
                Year: {project.year}
              </span>
            </div>
            <div className="flex items-center">
              <Coins className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">
                Budget: {project.budget}
              </span>
            </div>
            <div className="flex items-center col-span-2">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-600">
                Centre: {project.centre}
              </span>
            </div>
          </div>

          <div className="mt-auto">
            <Button
              onClick={onToggle}
              variant="ghost"
              className="w-full justify-between text-green-800 hover:bg-green-50 hover:text-green-900 group"
            >
              <span>
                View {isExpanded ? "Less" : "Details"}
              </span>
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-300 ${isExpanded
                  ? "rotate-180"
                  : ""}`}
              />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded &&
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-zinc-100 pt-6 mt-2">
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-green-800 mb-4">
                      <Target className="h-5 w-5 mr-2" />
                      Objectives
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                      {project.objectives.map((objective, index) =>
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          {objective}
                        </motion.li>
                      )}
                    </ul>

                    <h3 className="flex items-center text-lg font-semibold text-green-800 mt-6 mb-4">
                      <Users className="h-5 w-5 mr-2" />
                      Project Team
                    </h3>
                    <p className="font-medium text-zinc-800">
                      Project Director: {project.director}
                    </p>
                    <p className="mt-2 font-medium text-zinc-800">
                      Co-Project Directors:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-700">
                      {project.coDirectors.map((director, index) =>
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.3 + index * 0.1
                          }}
                        >
                          {director}
                        </motion.li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-green-800 mb-4">
                      <Award className="h-5 w-5 mr-2" />
                      Salient Achievements
                    </h3>
                    {project.achievements.length > 0
                      ? <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                          {project.achievements.map((achievement, index) =>
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: 0.6 + index * 0.1
                              }}
                            >
                              {achievement}
                            </motion.li>
                          )}
                        </ul>
                      : <p className="text-zinc-500 italic">
                          Project is in progress. Achievements will be updated
                          soon.
                        </p>}
                  </div>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
