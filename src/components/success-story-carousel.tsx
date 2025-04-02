"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Sample success stories
const successStories = [
  {
    id: 1,
    name: "Rajesh Kumar",
    location: "Imphal, Manipur",
    image: "/placeholder.svg?height=300&width=300&text=Farmer+1",
    quote:
      "Switching to finger millet cultivation has doubled my income and improved my family's nutrition. The training provided by the project team was invaluable.",
    impact: "200% increase in income, soil health improved"
  },
  {
    id: 2,
    name: "Lakshmi Devi",
    location: "Kohima, Nagaland",
    image: "/placeholder.svg?height=300&width=300&text=Farmer+2",
    quote:
      "The millet processing equipment provided by the project has saved us countless hours of manual labor. Now we can produce value-added products.",
    impact: "Started a small business selling millet products"
  },
  {
    id: 3,
    name: "Tenzin Norbu",
    location: "Gangtok, Sikkim",
    image: "/placeholder.svg?height=300&width=300&text=Farmer+3",
    quote:
      "Growing traditional millet varieties has connected me with my cultural heritage while providing a sustainable livelihood in these changing climate conditions.",
    impact: "Crops survived extreme weather events"
  },
  {
    id: 4,
    name: "Meena Gogoi",
    location: "Jorhat, Assam",
    image: "/placeholder.svg?height=300&width=300&text=Farmer+4",
    quote:
      "The market linkages established through this project have ensured fair prices for our millet crops. I no longer worry about selling my harvest.",
    impact: "30% higher prices through direct market access"
  }
];

export function SuccessStoryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToNext = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % successStories.length);
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [isAnimating]);

  const goToPrevious = useCallback(() => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex(
        (prevIndex) =>
          (prevIndex - 1 + successStories.length) % successStories.length
      );
      setTimeout(() => setIsAnimating(false), 500);
    }
  }, [isAnimating]);

  useEffect(() => {
    const interval = setInterval(goToNext, 8000);
    return () => clearInterval(interval);
  }, [goToNext]);

  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {successStories.map((story) => (
            <div key={story.id} className="min-w-full">
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="relative h-64 overflow-hidden rounded-lg md:h-full">
                      <img
                        src={story.image || "/placeholder.svg"}
                        alt={story.name}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-6">
                      <Quote className="mb-4 h-10 w-10 text-green-300" />
                      <p className="mb-6 text-lg italic text-gray-700">
                        {story.quote}
                      </p>
                      <div className="mt-auto">
                        <h3 className="text-xl font-bold text-green-800">
                          {story.name}
                        </h3>
                        <p className="text-gray-600">{story.location}</p>
                        <div className="mt-4 rounded-md bg-green-50 p-2 text-sm text-green-800">
                          <span className="font-medium">Impact: </span>
                          {story.impact}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-md hover:bg-white"
        onClick={goToPrevious}
        disabled={isAnimating}
      >
        <ChevronLeft className="h-6 w-6" />
        <span className="sr-only">Previous</span>
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-md hover:bg-white"
        onClick={goToNext}
        disabled={isAnimating}
      >
        <ChevronRight className="h-6 w-6" />
        <span className="sr-only">Next</span>
      </Button>

      <div className="mt-4 flex justify-center space-x-2">
        {successStories.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentIndex ? "bg-green-600" : "bg-gray-300"
            }`}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrentIndex(index);
                setTimeout(() => setIsAnimating(false), 500);
              }
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
