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
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Project data
const projects = [
  {
    id: 1,
    title:
      "An initiative of small millets promotion through technological interventions and value addition in the hilly tracts of Arunachal Pradesh (NEH-I)",
    year: "2024",
    budget: "15 Lakhs",
    centre: "College of Agriculture Pasighat",
    location: "Arunachal Pradesh",
    objectives: [
      "Germplasm collection and documentation of small millets in Arunachal Pradesh.",
      "To disseminate scientific knowledge about millets among the farmers in the region.",
      "Establishment of primary processing units (Custom hiring) through farmers club/SHG/FPO.",
      "To popularize the millets-based value-added products and create awareness among the consumers."
    ],
    director: "Dr. Premaradhya, N.",
    coDirectors: ["Dr. Senpon Ngomle", "Dr. Rajib Das", "Dr. Ajaykumara K.M."],
    achievements: [
      "10 germplasm were collected and multiplication for submission to get IC number and further Breeding work and biochemical studies is going on.",
      "Improved varieties of Finger Millet (GPU 67, ML 365, KMR 630, VR 847 and CFMV-01) and Foxtail Millet (SIA 3156 and SIA 3085), recommended by ICAR-IIMR-Hyderabad and ICAR-VPKAS, Almora (VL 378 & VL 380) were distributed-in 20 different villages in the aspirational districts, more than 500 beneficiaries including farm women were get benefited.",
      "The field days were organized under FLDs on Improved varieties of finger millet GPU 67 and Direct seeding line sowing techniques grown at farmers field - 06 No's, there were more than 300 farmers participated in five different villages of two districts.",
      "Conducted 10 numbers of awareness programme on various topics such as nutritional health benefits of millets, high yielding varieties of seeds, improved agro techniques, Community seed bank approach to conserve the land races, as it helps to minimize the yield gap between lab and land.",
      "Post harvest millet processing machineries have been procured under the project for farmer's on custom hiring basis."
    ],
    image:
      "/placeholder.svg?height=300&width=500&text=Arunachal+Pradesh+Project"
  },
  {
    id: 2,
    title:
      "Entrepreneurship based processing and valued addition of Nutri-cereals (small millets) in the state of Manipur",
    year: "2025",
    budget: "5.0 Lakhs",
    centre: "College of Agriculture, Imphal",
    location: "Manipur",
    objectives: [
      "To disseminate scientific knowledge about millets among the farmers in the state",
      "To develop the entrepreneurship skills through value added products of millets among the farm women"
    ],
    director: "Dr. Punabati Heisnam",
    coDirectors: [
      "Prof. K Nandini Devi",
      "Dr. Joseph Koireng",
      "Dr. Y. Linthoingambi Devi",
      "Dr. Abhinash Moirangthem",
      "Dr. Premaradhya N.",
      "Dr. Kh. Stina"
    ],
    achievements: [],
    image: "/placeholder.svg?height=300&width=500&text=Manipur+Project"
  },
  {
    id: 3,
    title:
      "Development of Millets based Nutri-economic Model for Tripura: Addressing Nutrition of Consumers & Livelihood Security of Farmers",
    year: "2020",
    budget: "18.9 Lakhs",
    centre:
      "Multi Technology Testing Centre & Vocational Training Centre Central Agricultural University (I), Lembucherra, Tripura (West) 799 210",
    location: "Tripura",
    objectives: [
      "To assess the awareness regarding millets & millet-based products among the prospective consumers of Tripura.",
      "Expansion and standardization of millet-based modules for Tripura farmers through farmers club/ FPO.",
      "Establishment of primary processing units at farmers club/ FPO.",
      "To popularize the value-added millet-based processed products among the consumers"
    ],
    director: "Dr. Vinodakumar S. Naik",
    coDirectors: ["Dr. Ashok Chhetri", "Dr. Vijay Kumar (CI)"],
    achievements: [
      "Created awareness regarding millets & millet-based products among the prospective consumers of Tripura.",
      "Expansion and standardization of millet-based crop modules for Tripura farmers at Lalchuri village of Dhalai Dist, Tripura.",
      "Established primary processing unit at KVK, Dhalai.",
      "Promoted the value-added millet-based processed products among the consumers of Tripura"
    ],
    image: "/placeholder.svg?height=300&width=500&text=Tripura+Project+1"
  },
  {
    id: 4,
    title:
      "Identification of various stresses and standardization of Fodder Sorghum (Sorghum bicolor L.) under Agro-climatic condition of Tripura funded by ICAR-IIMR, Hyderabad",
    year: "2024",
    budget: "8.9 Lakhs",
    centre: "College of Agriculture, Tripura",
    location: "Tripura",
    objectives: [
      "To standardize package of practices for fodder sorghum cultivation.",
      "To identify and characterize major pathogens of fodder sorghum.",
      "To analyze nutritional profile of fodder sorghum.",
      "To promote fodder sorghum cultivation through FLD & training to farmers."
    ],
    director: "Dr Durga Prasad Awasthi",
    coDirectors: ["Dr Utpal Giri", "Dr Dipak Sinha", "Mr Partha Das"],
    achievements: [
      "Research trials and experiments in the field as well as in the laboratory are going on to standardize a package of practices for fodder sorghum cultivation and to identify and characterize pathogens causing diseases in the agro-climatic condition of Tripura.",
      "Three training programmes comprising 90 participants were conducted till now. 1.0 quintal hybrid seeds of fodder Sorghum CSH24 MF provided by ICAR-IIMR, Hyderabad were distributed among farmers of Sepahijala District of Tripura."
    ],
    image: "/placeholder.svg?height=300&width=500&text=Tripura+Project+2"
  },
  {
    id: 5,
    title:
      "Promotion of Millets for Sustainable Agriculture and Nutrition Security in Meghalaya",
    year: "2023",
    budget: "10 Lakhs",
    centre: "ICAR Research Complex for NEH Region, Umiam",
    location: "Meghalaya",
    objectives: [
      "To introduce and evaluate high-yielding millet varieties suitable for Meghalaya's agro-climatic conditions",
      "To develop and promote sustainable cultivation practices for millets in hilly terrains",
      "To enhance farmers' knowledge and skills on millet cultivation and post-harvest management",
      "To promote millet consumption through awareness and value-added product development"
    ],
    director: "Dr. Samantha Roy",
    coDirectors: ["Dr. Michael Kharbamon", "Dr. Elizabeth Syiem"],
    achievements: [
      "Introduced 5 improved varieties of finger millet and foxtail millet in 10 villages",
      "Established 3 demonstration plots showcasing improved cultivation practices",
      "Trained 150 farmers on millet cultivation techniques and post-harvest management"
    ],
    image: "/placeholder.svg?height=300&width=500&text=Meghalaya+Project"
  }
];

// Get unique locations
const locations = [
  "All",
  ...Array.from(new Set(projects.map((project) => project.location)))
];

export default function NEHProjectsPage() {
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  useEffect(() => {
    if (selectedLocation === "All") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(
        projects.filter((project) => project.location === selectedLocation)
      );
    }
    // Reset expanded project when changing location
    setExpandedProject(null);
  }, [selectedLocation]);

  const toggleProject = (id: number) => {
    setExpandedProject(expandedProject === id ? null : id);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900 to-green-50" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,#ffffff,transparent_70%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl drop-shadow-md">
              NEH Projects
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-base text-white font-medium drop-shadow-sm">
              Explore our ongoing millet promotion projects across the North
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
                {locations.map((location) => (
                  <TabsTrigger
                    key={location}
                    value={location}
                    className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900 text-white font-medium"
                  >
                    {location}
                  </TabsTrigger>
                ))}
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
              {filteredProjects.map((project, index) => (
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
              ))}
            </AnimatePresence>

            {filteredProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto my-16 text-center"
              >
                <p className="text-xl text-zinc-500">
                  No projects found for this location.
                </p>
              </motion.div>
            )}
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
              <span>View {isExpanded ? "Less" : "Details"}</span>
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
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
                      {project.objectives.map((objective, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          {objective}
                        </motion.li>
                      ))}
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
                      {project.coDirectors.map((director, index) => (
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
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="flex items-center text-lg font-semibold text-green-800 mb-4">
                      <Award className="h-5 w-5 mr-2" />
                      Salient Achievements
                    </h3>
                    {project.achievements.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-2 text-zinc-700">
                        {project.achievements.map((achievement, index) => (
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
                        ))}
                      </ul>
                    ) : (
                      <p className="text-zinc-500 italic">
                        Project is in progress. Achievements will be updated
                        soon.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
