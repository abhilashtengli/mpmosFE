import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import millet1 from "@/assets/millet_1.jpg";
import millet2 from "@/assets/millet_2.jpg";
import millet3 from "@/assets/millet_3.jpg";
import millet4 from "@/assets/millet_4.jpg";
import millet5 from "@/assets/millet_5.jpg";
import millet6 from "@/assets/millet_6.jpg";
import { Base_Url } from "@/lib/constants";
import axios from "axios";
// Gallery data
const milletVarieties = [
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
  }
];
interface GalleryItem {
  id: string | number;
  title: string;
  image: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  User?: {
    id: string;
    name: string;
  };
}

interface MilletVariety {
  id: number;
  category: string;
  title: string;
  description: string;
  image: string;
  location: string;
}

type SelectedImageType = GalleryItem | MilletVariety | null;

// Shimmer skeleton for gallery items
const GalleryItemSkeleton = ({ index }: { index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-lg shadow-md h-72 w-full animate-pulse"
    >
      <div className="relative h-full w-full bg-gray-400"></div>
    </motion.div>
  );
};

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("millet");
  const [selectedImage, setSelectedImage] = useState<SelectedImageType>(null);
  const [nehGalleryItems, setNehGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchNehGalleryItems();
  }, []);

  const fetchNehGalleryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${Base_Url}/get-all-gallery`);
      const result = response.data;

      if (result.success) {
        setNehGalleryItems(result.data);
      } else {
        setError("Failed to fetch gallery items");
      }
    } catch (err) {
      setError("Error connecting to server. Please try again later.");
      console.error("Error fetching gallery items:", err);
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = () => {
    fetchNehGalleryItems();
  };

  // Get filtered items based on selected category
  const getFilteredItems = (): (MilletVariety | GalleryItem)[] => {
    if (selectedCategory === "millet") {
      return milletVarieties;
    } else {
      return nehGalleryItems;
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900 to-green-200" />
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
              <TabsList className="grid w-full grid-cols-2 bg-green-800/80 backdrop-blur-sm">
                <TabsTrigger
                  value="millet"
                  className="data-[state=active]:bg-green-100 cursor-pointer data-[state=active]:text-green-900 text-white font-medium"
                >
                  Millet Types
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
      <section className="py-16 bg-white px-4 md:px-8 lg:px-20">
        <div className="container mx-auto">
          {/* Error State for NEH items */}
          {error && selectedCategory === "neh" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Error Loading Gallery
                </h3>
                <p className="text-red-600 mb-4">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={retryFetch}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </motion.button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {/* Show loading skeletons for NEH category when loading */}
              {loading && selectedCategory === "neh" && !error ? (
                [1, 2, 3, 4, 5, 6].map((index) => (
                  <GalleryItemSkeleton
                    key={`skeleton-${index}`}
                    index={index}
                  />
                ))
              ) : (
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="contents"
                >
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={`${selectedCategory}-${item.id}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedImage(item)}
                    >
                      <div className="relative h-72 w-full">
                        <img
                          src={
                            selectedCategory === "millet"
                              ? (item as MilletVariety).image
                              : (item as GalleryItem).imageUrl ||
                                "/placeholder.svg"
                          }
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "/placeholder.svg?height=300&width=400&text=Image+Not+Found";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="text-lg font-bold line-clamp-2">
                              {item.title}
                            </h3>
                            {selectedCategory === "millet" &&
                              (item as MilletVariety).location && (
                                <p className="text-sm text-gray-200">
                                  {(item as MilletVariety).location}
                                </p>
                              )}
                          </div>
                          <div className="absolute top-4 right-4">
                            <ZoomIn className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* No items message */}
          {!loading && !error && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500"
              >
                <div className="h-16 w-16 mx-auto text-gray-300 mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <ZoomIn className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No images found</h3>
                <p>
                  No gallery items available for this category at the moment.
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
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
              className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-5 w-5" />
              </Button>

              <div className="relative flex-1 min-h-0">
                <img
                  src={
                    selectedCategory === "millet"
                      ? (selectedImage as MilletVariety).image
                      : (selectedImage as GalleryItem).imageUrl ||
                        "/placeholder.svg"
                  }
                  alt={selectedImage.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-6 bg-white">
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  {selectedImage.title}
                </h2>
                {selectedCategory === "millet" &&
                  (selectedImage as MilletVariety).location && (
                    <p className="text-sm text-gray-500 mb-4">
                      {(selectedImage as MilletVariety).location}
                    </p>
                  )}
                {selectedCategory === "millet" &&
                  (selectedImage as MilletVariety).description && (
                    <p className="text-gray-700">
                      {(selectedImage as MilletVariety).description}
                    </p>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
    </div>
  );
}
