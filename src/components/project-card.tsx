"use client";

import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: number;
  title: string;
  year: string;
  budget: string;
  centre: string;
  location: string;
  objectives: string[];
  director: string;
  coDirectors: string[];
  achievements: string[];
  image: string;
}

interface ProjectCardProps {
  project: Project;
  color?: "amber" | "green";
}

export function ProjectCard({ project, color = "amber" }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const textColor = color === "amber" ? "text-amber-800" : "text-green-800";
  const iconColor = color === "amber" ? "text-amber-600" : "text-green-600";
  const badgeColor =
    color === "amber"
      ? "bg-amber-600 hover:bg-amber-700"
      : "bg-green-600 hover:bg-green-700";
  const hoverBgColor =
    color === "amber"
      ? "hover:bg-amber-50 hover:text-amber-900"
      : "hover:bg-green-50 hover:text-green-900";

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-3">
          <div className="relative h-64 md:h-full">
            <img
              src={project.image || "/placeholder.svg"}
              alt={project.title}
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <Badge className={badgeColor}>
                {project.location}
              </Badge>
            </div>
          </div>

          <div className="md:col-span-2 p-6">
            <div className="flex flex-col h-full">
              <h2 className={`text-xl font-bold ${textColor} mb-2`}>
                {project.title}
              </h2>

              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="flex items-center">
                  <Calendar className={`h-5 w-5 ${iconColor} mr-2`} />
                  <span className="text-sm text-gray-600">
                    Year: {project.year}
                  </span>
                </div>
                <div className="flex items-center">
                  <Coins className={`h-5 w-5 ${iconColor} mr-2`} />
                  <span className="text-sm text-gray-600">
                    Budget: {project.budget}
                  </span>
                </div>
                <div className="flex items-center col-span-2">
                  <MapPin className={`h-5 w-5 ${iconColor} mr-2`} />
                  <span className="text-sm text-gray-600">
                    Centre: {project.centre}
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                <Button
                  onClick={toggleExpand}
                  variant="ghost"
                  className={`w-full justify-between ${textColor} ${hoverBgColor} group`}
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
              <div className="border-t border-gray-100 p-6">
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h3
                      className={`flex items-center text-lg font-semibold ${textColor} mb-4`}
                    >
                      <Target className="h-5 w-5 mr-2" />
                      Objectives
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
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

                    <h3
                      className={`flex items-center text-lg font-semibold ${textColor} mt-6 mb-4`}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Project Team
                    </h3>
                    <p className="font-medium text-gray-800">
                      Project Director: {project.director}
                    </p>
                    <p className="mt-2 font-medium text-gray-800">
                      Co-Project Directors:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
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
                    <h3
                      className={`flex items-center text-lg font-semibold ${textColor} mb-4`}
                    >
                      <Award className="h-5 w-5 mr-2" />
                      Salient Achievements
                    </h3>
                    {project.achievements.length > 0
                      ? <ul className="list-disc pl-5 space-y-2 text-gray-700">
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
                      : <p className="text-gray-500 italic">
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
