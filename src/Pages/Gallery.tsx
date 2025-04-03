"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import millet1 from "@/assets/millet_1.jpg";
import millet2 from "@/assets/millet_2.jpg";
import millet3 from "@/assets/millet_3.jpg";
import millet4 from "@/assets/millet_4.jpg";
import millet5 from "@/assets/millet_5.jpg";
import millet6 from "@/assets/millet_6.jpg";

import ph1 from "@/assets/ph1.jpg";
import ph2 from "@/assets/ph2.jpg";
import ph3 from "@/assets/ph3.jpg";
import ph4 from "@/assets/ph4.jpg";
import ph5 from "@/assets/ph5.jpg";
import ph6 from "@/assets/ph6.jpg";
// Gallery data
const galleryItems = [
  // Millet Varieties
  {
    id: 1,
    category: "millet",
    title: "Finger Millet (Eleusine coracana)",
    description:
      "Rich in calcium and protein, finger millet is drought-resistant and widely grown in the NEH region.",
    image: millet1,
    location: "Arunachal Pradesh"
  },
  {
    id: 2,
    category: "millet",
    title: "Foxtail Millet (Setaria italica)",
    description:
      "A nutritious millet variety with high iron content and excellent drought tolerance.",
    image: millet2,
    location: "Manipur"
  },
  {
    id: 3,
    category: "millet",
    title: "Pearl Millet (Pennisetum glaucum)",
    description:
      "Known for its high protein content and ability to grow in poor soil conditions.",
    image: millet3,
    location: "Tripura"
  },
  {
    id: 4,
    category: "millet",
    title: "Proso Millet (Panicum miliaceum)",
    description:
      "Fast-growing millet variety with excellent nutritional profile and low water requirements.",
    image: millet4,
    location: "Meghalaya"
  },
  {
    id: 5,
    category: "millet",
    title: "Barnyard Millet (Echinochloa frumentacea)",
    description:
      "High in fiber and micronutrients, this variety is excellent for sustainable farming.",
    image: millet5,
    location: "Sikkim"
  },
  {
    id: 6,
    category: "millet",
    title: "Kodo Millet (Paspalum scrobiculatum)",
    description:
      "Drought-resistant variety with excellent storage properties and nutritional benefits.",
    image: millet6,
    location: "Nagaland"
  },

  // NEH Region Work
  {
    id: 7,
    category: "neh",
    title: "Farmer Training Program",
    description:
      "Capacity building workshop for local farmers on improved millet cultivation techniques.",
    image: ph1,
    location: "Imphal, Manipur"
  },
  {
    id: 8,
    category: "neh",
    title: "Millet Processing Unit",
    description:
      "Installation of modern millet processing equipment to support local value addition.",
    image: ph2,
    location: "Pasighat, Arunachal Pradesh"
  },
  {
    id: 9,
    category: "neh",
    title: "Field Demonstration",
    description:
      "Demonstration of improved millet varieties and cultivation practices for local farmers.",
    image: ph3,
    location: "Kohima, Nagaland"
  },
  {
    id: 10,
    category: "neh",
    title: "Millet Awareness Campaign",
    description:
      "Community outreach program promoting nutritional benefits of millets.",
    image: ph4,
    location: "Gangtok, Sikkim"
  },
  {
    id: 11,
    category: "neh",
    title: "Seed Distribution Program",
    description:
      "Distribution of high-quality millet seeds to farmers in remote villages.",
    image: ph5,
    location: "Agartala, Tripura"
  },
  {
    id: 12,
    category: "neh",
    title: "Millet Value Addition Training",
    description:
      "Training women farmers on preparing value-added millet products for market.",
    image: ph6,
    location: "Shillong, Meghalaya"
  }
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("millet");
  const [selectedImage, setSelectedImage] = useState<
    (typeof galleryItems)[0] | null
  >(null);

  const filteredItems = galleryItems.filter(
    item => item.category === selectedCategory
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900 to-green-0" />
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
              Gallery
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-base text-white font-medium drop-shadow-sm">
              Explore our collection of millet varieties and project activities
              across the North Eastern Hilly Region
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Tabs
              defaultValue="millet"
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              className="mx-auto max-w-md"
            >
              <TabsList className=" grid w-full grid-cols-2 bg-green-800/80 backdrop-blur-sm">
                <TabsTrigger
                  value="millet"
                  className="data-[state=active]:bg-green-100 cursor-pointer data-[state=active]:text-green-900 text-white font-medium"
                >
                  Millet Varieties
                </TabsTrigger>
                <TabsTrigger
                  value="neh"
                  className="data-[state=active]:bg-green-100 cursor-pointer data-[state=active]:text-green-900 text-white font-medium"
                >
                  NEH Region Work
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 80"
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

      {/* Gallery Grid */}
      <section className="py-16 bg-white px-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {filteredItems.map(item =>
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedImage(item)}
                >
                  <div className="relative h-72 w-full">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="object- transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="text-lg font-bold">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-200">
                          {item.location}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4">
                        <ZoomIn className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-5 w-5" />
              </Button>

              <div className="relative h-[50vh] md:h-[60vh] w-full">
                <img
                  src={selectedImage.image || "/placeholder.svg"}
                  alt={selectedImage.title}
                  className="object-contain"
                />
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  {selectedImage.title}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedImage.location}
                </p>
                <p className="text-gray-700">
                  {selectedImage.description}
                </p>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>

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
