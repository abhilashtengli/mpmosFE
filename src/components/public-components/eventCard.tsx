"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  description: string;
  organizer?: string;
}

export function EventCard({
  title,
  date,
  location,
  description,
  
}: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden h-full shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
        <CardContent className="p-2">
          <div className="space-y-1">
            <div>
              <h3 className="text-xl font-bold text-green-800 mb-2 line-clamp-2">
                {title}
              </h3>
            </div>
            <div className="flex gap-x-8">
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm font-medium">{date}</span>
                </div>

                <div className="flex items-start text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                  <span className="text-sm  tracking-wider">{location}</span>
                </div>
              </div>

              <div className="">
               
                <p className="text-gray-700 pl-6 text-sm tracking-wider leading-relaxed line-clamp-4">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
