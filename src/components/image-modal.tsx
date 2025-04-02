"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ImageModalProps {
  images: {
    id: number;
    title: string;
    description: string;
    image: string;
    location: string;
  }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageModal({
  images,
  currentIndex,
  isOpen,
  onClose
}: ImageModalProps) {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        setIndex(
          (prevIndex) => (prevIndex - 1 + images.length) % images.length
        );
      } else if (e.key === "ArrowRight") {
        setIndex((prevIndex) => (prevIndex + 1) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length, onClose]);

  const currentImage = images[index];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="relative h-[50vh] md:h-[60vh] w-full">
              <img
                src={currentImage.image || "/placeholder.svg"}
                alt={currentImage.title}
                className="object-contain"
              />

              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                {currentImage.title}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {currentImage.location}
              </p>
              <p className="text-gray-700">{currentImage.description}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
