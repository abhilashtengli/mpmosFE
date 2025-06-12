"use client";

import { TableRow, TableCell } from "@/components/ui/table";

export default function EnhancedShimmerTableRows() {
  // Create an array of 6 skeleton rows
  const skeletonRows = Array.from({ length: 6 }, (_, index) => index);

  return (
    <>
      {skeletonRows.map((index) => (
        <TableRow key={index}>
          {/* Training ID */}
          <TableCell className="font-medium">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-16"></div>
          </TableCell>

          {/* Title */}
          <TableCell>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-32"></div>
          </TableCell>

          {/* Project Title */}
          <TableCell className="text-sm">
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-24"></div>
          </TableCell>

          {/* Quarter Badge */}
          <TableCell>
            <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded-full w-20 border border-gray-300"></div>
          </TableCell>

          {/* District, Village */}
          <TableCell className="text-sm">
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-28"></div>
          </TableCell>

          {/* Achieved/Target */}
          <TableCell>
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-1">
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-8"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-4"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-8"></div>
              </div>
            </div>
          </TableCell>

          {/* Beneficiary Male/Female */}
          <TableCell>
            <div className="text-sm space-y-1">
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-12"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-10"></div>
            </div>
          </TableCell>

          {/* Action Buttons */}
          <TableCell>
            <div className="flex space-x-2">
              <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-16 border border-gray-300"></div>
              <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-16 border border-gray-300"></div>
              <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded w-18 border border-gray-300"></div>
            </div>
          </TableCell>
        </TableRow>
      ))}

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
    </>
  );
}
