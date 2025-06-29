import { Calendar, MapPin } from "lucide-react";

interface ProjectSkeletonProps {
  count?: number;
}

export function ProjectSkeleton({ count = 4 }: ProjectSkeletonProps) {
  return (
    <div className="grid gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-md animate-pulse"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              {/* Title Skeleton */}
              <div className="flex-1 pr-4">
                <div className="h-6 bg-gray-200 rounded-md mb-2 shimmer"></div>
                <div className="h-6 bg-gray-200 rounded-md w-3/4 shimmer"></div>
              </div>
              {/* Badge Skeleton */}
              <div className="h-6 w-20 bg-gray-200 rounded-full shimmer flex-shrink-0"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Year Skeleton */}
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" />
                <div className="h-4 w-20 bg-gray-200 rounded shimmer"></div>
              </div>
              {/* Center Skeleton */}
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1 shimmer"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 shimmer"></div>
                </div>
              </div>
            </div>

            {/* View Details Button Skeleton */}
            <div className="h-10 bg-gray-200 rounded-md shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Add shimmer CSS animation
const shimmerStyles = `
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  .shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = shimmerStyles;
  document.head.appendChild(styleSheet);
}
