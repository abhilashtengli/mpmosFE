import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
}

export function EventCard({
  title,
  date,
  location,
  description,
  image
}: EventCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-60 mt-0 w-full overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="object-fill transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardContent className="px-4">
        <h3 className="mb-2 text-lg font-bold text-green-800">
          {title}
        </h3>
        <div className="mb-3 space-y-1">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2 h-4 w-4 text-green-600" />
            <span>
              {date}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="mr-2 h-4 w-4 text-green-600" />
            <span>
              {location}
            </span>
          </div>
        </div>
        <p className="mb-4 text-sm text-gray-600">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
