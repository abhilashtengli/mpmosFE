"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ExternalLink,
  Search,
  X,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Base_Url } from "@/lib/constants";

interface Publication {
  id: string;
  title: string;
  type: string;
  category: string;
  thumbnailUrl: string;
  thumbnailKey: string;
  pdfUrl: string;
  pdfKey: string;
  createdAt: string;
  updatedAt: string;
  User: {
    id: string;
    name: string;
  };
}

// Shimmer skeleton for publication cards
const PublicationCardSkeleton = ({ index }: { index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl overflow-hidden shadow-md h-full animate-pulse"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-200"></div>
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </motion.div>
  );
};

// Publication component
const PublicationCard = ({
  publication,
  index
}: {
  publication: Publication;
  index: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleViewPublication = () => {
    window.open(publication.pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-md h-full transition-all duration-300 hover:shadow-xl border border-gray-100">
        <div className="relative aspect-[16/9] overflow-hidden">
          {!imageError ? (
            <img
              src={publication.thumbnailUrl || "/placeholder.svg"}
              alt={publication.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <FileText className="h-12 w-12 text-green-600" />
            </div>
          )}

          {/* Overlay on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-green-900/80 via-green-800/50 to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            } flex flex-col justify-end p-4`}
          >
            <div className="flex items-center text-white mb-2">
              <FileText className="h-5 w-5 mr-2" />
              <span className="font-medium">View Publication</span>
            </div>
            <div className="flex items-center text-white/80 text-sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              <span>Opens in new tab</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 leading-tight">
            {publication.title}
          </h3>
          <p className="text-sm text-gray-500 mb-3">{publication.type}</p>

          <div className="flex items-center justify-between">
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {publication.category}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewPublication}
              className="flex items-center gap-1 cursor-pointer text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
            >
              View
              <ExternalLink className="h-3 w-3" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Animated indicator on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-3 right-3 bg-amber-500 text-white p-1.5 rounded-full z-10 shadow-lg"
          >
            <ExternalLink className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function Publications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${Base_Url}/get-all-publications`);
      const result = await response.json();

      if (result.success) {
        setPublications(result.data);
      } else {
        setError("Failed to fetch publications");
      }
    } catch (err) {
      setError("Error connecting to server. Please try again later.");
      console.error("Error fetching publications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from publications
  const categories = Array.from(
    new Set(publications.map((pub) => pub.category))
  );

  // Filter publications based on search term and category
  const filteredPublications = publications.filter((pub) => {
    const matchesSearch =
      pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pub.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || pub.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Clear search input
  const clearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const retryFetch = () => {
    fetchPublications();
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
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
              Publications
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="inline-block ml-3"
              >
                <Sparkles className="h-8 w-8 text-amber-400" />
              </motion.span>
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-base text-white font-medium drop-shadow-sm">
              Educational resources and guides on millet cultivation and
              nutrition
            </p>
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

      <main className="flex-grow py-16 bg-gray-50 lg:px-20">
        <div className="container mx-auto px-4">
          {/* Search and Filter Section */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Search Input */}
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search publications..."
                  className="pl-10 pr-10 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  </button>
                )}
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === "all"
                      ? "bg-green-700 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-green-50 border border-gray-200"
                  }`}
                >
                  All Publications
                </motion.button>
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeFilter === category
                        ? "bg-green-700 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-green-50 border border-gray-200"
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Error Loading Publications
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

          {/* Loading State */}
          {loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <PublicationCardSkeleton key={index} index={index} />
              ))}
            </div>
          )}

          {/* Publications Grid */}
          {!loading && !error && (
            <>
              {filteredPublications.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredPublications.map((publication, index) => (
                    <PublicationCard
                      key={publication.id}
                      publication={publication}
                      index={index}
                    />
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500"
                  >
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No publications found
                    </h3>
                    <p>Try adjusting your search or filter criteria</p>
                    {searchTerm && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearSearch}
                        className="mt-4 text-green-600 hover:text-green-700 font-medium"
                      >
                        Clear search
                      </motion.button>
                    )}
                  </motion.div>
                </div>
              )}
            </>
          )}

          {/* Results Count */}
          {!loading && !error && publications.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center text-gray-600"
            >
              <p>
                Showing {filteredPublications.length} of {publications.length}{" "}
                publications
                {searchTerm && (
                  <span className="ml-1">
                    for "
                    <span className="font-medium text-green-700">
                      {searchTerm}
                    </span>
                    "
                  </span>
                )}
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
