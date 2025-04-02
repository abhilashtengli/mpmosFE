import type React from "react";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Award, Users, MapPin, Sprout } from "lucide-react";

interface CounterProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  duration?: number;
}

export function StatsCounter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
    >
      <Counter
        value={11}
        label="Active Projects"
        icon={<Award className="h-6 w-6 text-amber-500" />}
      />
      <Counter
        value={1969}
        label="Farmers Trained"
        icon={<Users className="h-6 w-6 text-amber-500" />}
      />
      <Counter
        value={22}
        label="Districts Covered"
        icon={<MapPin className="h-6 w-6 text-amber-500" />}
      />
      <Counter
        value={349}
        label="Hectares Cultivated"
        icon={<Sprout className="h-6 w-6 text-amber-500" />}
      />
    </motion.div>
  );
}

function Counter({ value, label, icon, duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, value, duration]);

  return (
    <motion.div
      ref={ref}
      className="flex flex-col shadow-2xl items-center hover:scale-105 duration-300 border-[0.5px] border-gray-400 justify-center p-3 bg-white/80 backdrop-blur-sm rounded-lg "
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-1">{icon}</div>
      <div className="text-xl font-bold text-amber-800">
        {count.toLocaleString()}
      </div>
      <div className="text-xs text-gray-600 text-center">{label}</div>
    </motion.div>
  );
}
