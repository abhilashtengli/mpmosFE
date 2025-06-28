"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  MapPin,
  Award,
  Target,
  Briefcase
} from "lucide-react";

interface PromoMeterData {
  trainings: { target: number; achieved: number };
  awarenessProgram: { target: number; achieved: number };
  inputDistribution: { target: number; achieved: number };
  fld: { target: number; achieved: number };
  infrastructure: { target: number; achieved: number };
  otherActivities: { target: number; achieved: number };
  totalFarmers: number;
  projectCount: number;
}

interface PromoMeterProps {
  data: PromoMeterData | null;
}

export function PromoMeter({ data }: PromoMeterProps) {
  if (!data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  const calculatePercentage = (achieved: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((achieved / target) * 100, 100);
  };

  const staticData = [
    { label: "States in NEH", value: 4, icon: MapPin, color: "bg-blue-300" },
    {
      label: "Hectare Area Covered",
      value: 349,
      icon: Target,
      color: "bg-green-400"
    },
    {
      label: "Master Trainers",
      value: 23,
      icon: Award,
      color: "bg-purple-300"
    },
    {
      label: "Districts in NEH",
      value: 22,
      icon: Briefcase,
      color: "bg-orange-300"
    }
  ];

  const activities = [
    {
      label: "Trainings",
      achieved: data.trainings.achieved,
      target: data.trainings.target,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-100"
    },
    {
      label: "Awareness Programs",
      achieved: data.awarenessProgram.achieved,
      target: data.awarenessProgram.target,
      color: "bg-blue-500",
      lightColor: "bg-blue-100"
    },
    {
      label: "Input Distribution",
      achieved: data.inputDistribution.achieved,
      target: data.inputDistribution.target,
      color: "bg-purple-500",
      lightColor: "bg-purple-100"
    },
    {
      label: "FLD",
      achieved: data.fld.achieved,
      target: data.fld.target,
      color: "bg-orange-500",
      lightColor: "bg-orange-100"
    },
    {
      label: "Infrastructure",
      achieved: data.infrastructure.achieved,
      target: data.infrastructure.target,
      color: "bg-teal-500",
      lightColor: "bg-teal-100"
    },
    {
      label: "Other Activities",
      achieved: data.otherActivities.achieved,
      target: data.otherActivities.target,
      color: "bg-pink-500",
      lightColor: "bg-pink-100"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Key Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {staticData.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`p-2 md:p-3 rounded-lg ${item.color} bg-opacity-10`}
                >
                  <Icon
                    className={`h-5 w-5 md:h-6 md:w-6 ${item.color.replace(
                      "bg-",
                      "text-"
                    )}`}
                  />
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                {item.value.toLocaleString()}
              </div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">
                {item.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {data.totalFarmers.toLocaleString()}
              </div>
              <div className="text-green-100 font-medium">
                Total Farmers Reached
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="h-8 w-8" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {data.projectCount}
              </div>
              <div className="text-blue-100 font-medium">Active Projects</div>
            </div>
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Activity Progress */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
          Activity Progress Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {activities.map((activity, index) => {
            const percentage = calculatePercentage(
              activity.achieved,
              activity.target
            );

            return (
              <motion.div
                key={activity.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className={`${activity.lightColor} rounded-lg p-4 hover:shadow-md transition-all duration-300 cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm md:text-base">
                    {activity.label}
                  </h4>
                  <span className="text-xs md:text-sm font-bold text-gray-600">
                    {percentage.toFixed(0)}%
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs md:text-sm text-gray-600 mb-1">
                    <span>Achieved: {activity.achieved}</span>
                    <span>Target: {activity.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${activity.color} transition-all duration-300`}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      percentage === 100
                        ? "bg-green-100 text-green-800"
                        : percentage >= 80
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {percentage === 100
                      ? "Completed"
                      : percentage >= 80
                      ? "Near Target"
                      : "In Progress"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
