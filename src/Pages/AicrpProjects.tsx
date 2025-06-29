"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  MapPin,
  Calendar,
  Users,
  Target,
  Award,
  AlertCircle
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProjectSkeleton } from "@/components/public-components/project-skeleton";
import axios from "axios";
import { Base_Url } from "@/lib/constants";

// Types based on API response
interface Project {
  id: string;
  title: string;
  region: string;
  year: number;
  center: string;
  location: string;
  objectives: string[];
  director: string;
  coDirectors: string[];
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Project[];
  code: string;
}

// Fixed locations for AICRP NEH region
const FIXED_LOCATIONS = [
  "All",
  "Arunachal Pradesh",
  "Meghalaya",
  "Tripura",
  "Manipur"
];

// Extract location from center name or location field for filtering
const extractLocationFromProject = (project: Project): string => {
  const locationText = `${project.center} ${project.location}`.toLowerCase();

  const locationMap: { [key: string]: string } = {
    arunachal: "Arunachal Pradesh",
    pasighat: "Arunachal Pradesh",
    manipur: "Manipur",
    imphal: "Manipur",
    tripura: "Tripura",
    lembucherra: "Tripura",
    meghalaya: "Meghalaya",
    umiam: "Meghalaya"
  };

  for (const [key, value] of Object.entries(locationMap)) {
    if (locationText.includes(key)) {
      return value;
    }
  }
  return "Other";
};

export default function AICRPProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Fetch projects from API
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${Base_Url}/get-all-aicrp-project-details`
        );

        if (!response.data.success) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.data;

        if (result.success && result.data) {
          setProjects(result.data);
        } else {
          throw new Error("Failed to fetch AICRP projects data");
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching AICRP projects"
        );
        console.error("Error fetching AICRP projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects based on selected location
  useEffect(() => {
    if (projects.length > 0) {
      const projectsWithLocations = projects.map((project) => ({
        ...project,
        derivedLocation: extractLocationFromProject(project)
      }));

      if (selectedLocation === "All") {
        setFilteredProjects(projectsWithLocations);
      } else {
        setFilteredProjects(
          projectsWithLocations.filter(
            (project) => project.derivedLocation === selectedLocation
          )
        );
      }

      // Reset expanded project when changing location
      setExpandedProject(null);
    }
  }, [selectedLocation, projects]);

  // Use fixed locations
  const locations = FIXED_LOCATIONS;

  const toggleProject = (id: string) => {
    setExpandedProject(expandedProject === id ? null : id);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error loading AICRP projects:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900 to-green-50" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_bottom_left,#ffffff,transparent_70%)]" />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          {loading ? (
            <div className="text-center">
              <div className="h-10 w-80 bg-white/20 rounded-md mx-auto mb-4 shimmer"></div>
              <div className="h-6 w-96 bg-white/20 rounded-md mx-auto shimmer"></div>
            </div>
          ) : (
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
          )}

          {/* Location Tabs */}
          {loading ? (
            <div className="mx-auto max-w-4xl grid place-content-center mt-6">
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-10 w-20 bg-white/20 rounded-md shimmer"
                  ></div>
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tabs
                defaultValue="All"
                value={selectedLocation}
                onValueChange={setSelectedLocation}
                className="mx-auto max-w-4xl grid place-content-center"
              >
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-green-800/80 backdrop-blur-sm">
                  {locations.map((location) => (
                    <TabsTrigger
                      key={location}
                      value={location}
                      className="data-[state=active]:bg-green-100 cursor-pointer data-[state=active]:text-green-900 text-white font-medium text-xs md:text-sm"
                    >
                      {location}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </motion.div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 65"
            className="w-full"
          >
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L60,58.7C120,53,240,43,360,48C480,53,600,75,720,80C840,85,960,75,1080,64C1200,53,1320,43,1380,37.3L1440,32L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
            />
          </svg>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 px-4 md:px-8 lg:px-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <ProjectSkeleton count={4} />
          ) : (
            <div className="grid gap-6">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <ProjectCard
                      project={project}
                      isExpanded={expandedProject === project.id}
                      onToggle={() => toggleProject(project.id)}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mx-auto my-16 text-center"
                >
                  <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                    <div className="text-gray-400 mb-4">
                      <MapPin className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Projects Found
                    </h3>
                    <p className="text-gray-500">
                      {selectedLocation === "All"
                        ? "No AICRP projects are currently available."
                        : `There are no AICRP projects in ${selectedLocation} as of now.`}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

interface ProjectCardProps {
  project: Project & { derivedLocation?: string };
  isExpanded: boolean;
  onToggle: () => void;
}

function ProjectCard({ project, isExpanded, onToggle }: ProjectCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-green-800 flex-1 pr-4">
            {project.title}
          </h2>
          <Badge className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0">
            {project.derivedLocation || "AICRP"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
            <span className="text-sm text-gray-600">Year: {project.year}</span>
          </div>
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600 leading-tight">
              {project.center}
              {project.location &&
                project.location !== "NA" &&
                `, ${project.location}`}
            </span>
          </div>
        </div>

        <Button
          onClick={onToggle}
          variant="ghost"
          className="w-full justify-between text-green-800 border hover:bg-green-50 hover:text-green-900 transition-colors duration-150"
        >
          <span>View {isExpanded ? "Less" : "Details"}</span>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-150 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </Button>
      </div>

      {/* Improved Animation for Expansion */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        {isExpanded && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="flex items-center text-lg font-semibold text-green-800 mb-4">
                  <Target className="h-5 w-5 mr-2" />
                  Objectives
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                  {project.objectives.map((objective, index) => (
                    <li key={index} className="leading-relaxed">
                      {objective}
                    </li>
                  ))}
                </ul>

                <h3 className="flex items-center text-lg font-semibold text-green-800 mt-6 mb-4">
                  <Users className="h-5 w-5 mr-2" />
                  Project Team
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-zinc-800">
                    <span className="text-green-700">Project Director:</span>{" "}
                    {project.director}
                  </p>
                  <div>
                    <p className="font-medium text-zinc-800 mb-2">
                      <span className="text-green-700">
                        Co-Project Directors:
                      </span>
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-700">
                      {project.coDirectors.map((director, index) => (
                        <li key={index}>{director}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="flex items-center text-lg font-semibold text-green-800 mb-4">
                  <Award className="h-5 w-5 mr-2" />
                  Salient Achievements
                </h3>
                {project.achievements.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                    {project.achievements.map((achievement, index) => (
                      <li key={index} className="leading-relaxed">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-zinc-500 italic">
                    Project is in progress. Achievements will be updated soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
