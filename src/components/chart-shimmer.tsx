export default function ChartShimmerLoader() {
  // Create bars with varying heights to simulate chart data
  const bars = [
    { target: 60, achieved: 45 },
    { target: 80, achieved: 70 },
    { target: 45, achieved: 40 },
    { target: 90, achieved: 85 },
    { target: 70, achieved: 55 }
  ];

  return (
    <div className="bg-white rounded-lg pt-4 shadow-sm border-red-400">
      <div className="w-full h-[350px] p-5">
       

        {/* Chart Area */}
        <div className="relative h-64">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-2">
            {[100, 80, 60, 40, 20, 0].map((_value, index) => (
              <div
                key={index}
                className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-6"
              />
            ))}
          </div>

          {/* Chart bars container */}
          <div className="ml-12 mr-4 h-full flex items-end justify-between border-l border-b border-gray-200">
            {bars.map((bar, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-1 flex-1 max-w-16"
              >
                {/* Bars container */}
                <div className="flex space-x-1 items-end h-48 w-full justify-center">
                  {/* Target bar */}
                  <div
                    className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded-t w-4"
                    style={{ height: `${bar.target}%` }}
                  />
                  {/* Achieved bar */}
                  <div
                    className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded-t w-4"
                    style={{
                      height: `${bar.achieved}%`,
                      animationDelay: "0.2s"
                    }}
                  />
                </div>

                {/* X-axis label */}
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-12 mt-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded" />
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-12" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded" />
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-16" />
          </div>
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
    </div>
  );
}
