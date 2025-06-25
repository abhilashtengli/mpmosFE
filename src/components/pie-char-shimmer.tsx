export default function ShimmerPieChart() {
  return <div className="bg-white rounded-lg p-4 shadow-sm">
      {/* Pie Chart Container */}
      <div className="flex justify-center items-center h-[245px] mb-4">
        <div className="relative">
          {/* Outer Circle */}
          <div className="w-44 h-44 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] border-4 border-white shadow-sm" />

          {/* Inner Circle (donut hole) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-inner" />

          {/* Legend Labels */}
          <div className="absolute -right-22 top-0 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-20" />
            </div>
          </div>
          <div className="absolute -left-28 top-40 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]" />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Project Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-2">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-12 mx-auto" />
          </div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-20 mx-auto" />
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-2">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-12 mx-auto" />
          </div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-24 mx-auto" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>;
}
