import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Users, MapPin, Package, Home, Award } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Real data from the project
const initialData = [
  { name: "Trainings", value: 0, target: 80, color: "#4CAF50" },
  { name: "Awareness", value: 0, target: 100, color: "#2196F3" },
  { name: "Input Distribution", value: 0, target: 70, color: "#FF9800" },
  { name: "Area (ha)", value: 0, target: 500, color: "#9C27B0" }
];

const finalData = [
  { name: "Trainings", value: 55, target: 80, color: "#4CAF50" },
  { name: "Awareness", value: 60, target: 100, color: "#2196F3" },
  { name: "Input Distribution", value: 48, target: 70, color: "#FF9800" },
  { name: "Area (ha)", value: 349, target: 500, color: "#9C27B0" }
];

export function PromoMeter() {
  const [data, setData] = useState(initialData);
  const [counters, setCounters] = useState({
    farmers: 0,
    districts: 0,
    projects: 0,
    states: 0,
    trainers: 0
  });

  const finalCounters = {
    farmers: 1969,
    districts: 22,
    projects: 11,
    states: 4,
    trainers: 23
  };

  useEffect(() => {
    // Animate the data over time
    const duration = 2000; // 2 seconds
    const interval = 20; // Update every 20ms
    const steps = duration / interval;

    let step = 0;

    const timer = setInterval(() => {
      step++;

      if (step <= steps) {
        const progress = step / steps;

        // Update chart data
        setData(
          initialData.map((item, index) => ({
            ...item,
            value: Math.round(progress * finalData[index].value)
          }))
        );

        // Update counters
        setCounters({
          farmers: Math.round(progress * finalCounters.farmers),
          districts: Math.round(progress * finalCounters.districts),
          projects: Math.round(progress * finalCounters.projects),
          states: Math.round(progress * finalCounters.states),
          trainers: Math.round(progress * finalCounters.trainers)
        });
      } else {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [
    finalCounters.districts,
    finalCounters.farmers,
    finalCounters.projects,
    finalCounters.states,
    finalCounters.trainers
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className={`border-green-100 bg-green-100`}>
          <CardContent className="flex items-center p-6">
            <div className="mr-4 text-green-700">
              <Users />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Farmers Impacted
              </p>
              <h3 className={`text-2xl font-bold text-green-700`}>
                {counters.farmers.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className={`border-amber-100 bg-amber-100`}>
          <CardContent className="flex items-center p-6">
            <div className="mr-4 text-amber-700">
              <MapPin />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Districts in NEH
              </p>
              <h3 className={`text-2xl font-bold text-amber-700`}>
                {counters.districts.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className={`border-blue-100 bg-blue-100`}>
          <CardContent className="flex items-center p-6">
            <div className="mr-4 text-blue-700">
              <Package />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Projects</p>
              <h3 className={`text-2xl font-bold text-blue-700`}>
                {counters.projects.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className={`border-emerald-100 bg-emerald-100`}>
          <CardContent className="flex items-center p-6">
            <div className="mr-4 text-emerald-700">
              <Home />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">States in NEH</p>
              <h3 className={`text-2xl font-bold text-emerald-700`}>
                {counters.states.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className={`border-purple-100 bg-purple-100`}>
          <CardContent className="flex items-center p-6">
            <div className="mr-4 text-purple-700">
              <Award />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Masters in NEH
              </p>
              <h3 className={`text-2xl font-bold text-purple-700`}>
                {counters.trainers.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 rounded-lg bg-white p-4 shadow-md">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">
          Progress Towards Targets
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => {
                  const numericValue = Number(value); // Convert value to number
                  const target = Number(props?.payload?.target); // Ensure target is also a number

                  const percentage =
                    target !== 0
                      ? `${Math.round((numericValue / target) * 100)}%`
                      : "N/A"; // Avoid division by zero

                  return [`${numericValue} (${percentage})`, name];
                }}
                labelFormatter={(label) => `${label} Progress`}
              />

              <Bar dataKey="value" fill="#8884d8">
                {data.map((entry, index) => (
                  <motion.rect key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="text-sm text-gray-500">
                  {item.value} / {item.target} (
                  {Math.round((item.value / item.target) * 100)}%)
                </span>
              </div>
              <Progress
                value={(item.value / item.target) * 100}
                className="h-2"
                // indicatorClassName={`bg-[${item.color}]`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
