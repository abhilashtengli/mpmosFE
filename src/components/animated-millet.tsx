"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

export function AnimatedMillet() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const controls = useAnimation();

  useEffect(
    () => {
      if (isInView) {
        controls.start("visible");
      }
    },
    [isInView, controls]
  );

  const stemVariants = {
    hidden: { height: 0 },
    visible: {
      height: 150,
      transition: {
        duration: 1.5,
        ease: "easeOut"
      }
    }
  };

  const leafVariants = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: (custom: number) => ({
      scaleY: 1,
      opacity: 1,
      transition: {
        delay: 0.5 + custom * 0.2,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };

  const headVariants = {
    hidden: { scaleY: 0, opacity: 0 },
    visible: {
      scaleY: 1,
      opacity: 1,
      transition: {
        delay: 1.5,
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  // Modified to be a gentle sway rather than continuous rotation
  const gentleSway = {
    animate: {
      rotate: [0, 1, 0, -1, 0],
      transition: {
        duration: 4,
        repeat: 2, // Only repeat a few times then stop
        ease: "easeInOut",
        repeatDelay: 1 // Pause between animations
      }
    }
  };

  return (
    <div ref={ref} className="relative h-[200px] w-[120px] mx-auto">
      <svg viewBox="0 0 120 200" className="w-full h-full">
        {/* Soil */}
        <rect x="20" y="190" width="80" height="10" fill="#8B4513" />

        {/* Stem */}
        <motion.rect
          x="58"
          y="40"
          width="4"
          height="150"
          fill="#4CAF50"
          variants={stemVariants}
          initial="hidden"
          animate={controls}
          style={{ originY: 1, y: 0 }}
        />

        {/* Leaves */}
        <motion.path
          d="M60 140 C40 130, 20 140, 30 160"
          stroke="#4CAF50"
          strokeWidth="3"
          fill="none"
          variants={leafVariants}
          custom={0}
          initial="hidden"
          animate={controls}
          style={{ originX: 60, originY: 140 }}
        />

        <motion.path
          d="M60 120 C80 110, 100 120, 90 140"
          stroke="#4CAF50"
          strokeWidth="3"
          fill="none"
          variants={leafVariants}
          custom={1}
          initial="hidden"
          animate={controls}
          style={{ originX: 60, originY: 120 }}
        />

        <motion.path
          d="M60 100 C40 90, 20 100, 30 120"
          stroke="#4CAF50"
          strokeWidth="3"
          fill="none"
          variants={leafVariants}
          custom={2}
          initial="hidden"
          animate={controls}
          style={{ originX: 60, originY: 100 }}
        />

        <motion.path
          d="M60 80 C80 70, 100 80, 90 100"
          stroke="#4CAF50"
          strokeWidth="3"
          fill="none"
          variants={leafVariants}
          custom={3}
          initial="hidden"
          animate={controls}
          style={{ originX: 60, originY: 80 }}
        />

        {/* Millet Head */}
        <motion.g
          variants={headVariants}
          initial="hidden"
          animate={controls}
          style={{ originX: 60, originY: 40 }}
        >
          <motion.ellipse
            cx="60"
            cy="30"
            rx="15"
            ry="30"
            fill="#F0C14B"
            variants={gentleSway}
            animate="animate"
            style={{ originX: 60, originY: 40 }}
          />

          {/* Millet Grains */}
          {Array.from({ length: 30 }).map((_, i) => {
            const angle = i / 30 * Math.PI * 2;
            const radius = 10;
            const x = 60 + Math.cos(angle) * radius;
            const y = 30 + Math.sin(angle) * radius * 1.5;

            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill="#F9E076"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 + i * 0.02, duration: 0.3 }}
              />
            );
          })}
        </motion.g>
      </svg>
    </div>
  );
}
