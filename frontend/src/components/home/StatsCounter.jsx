"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const Counter = ({ value, label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Number Display: Larger Font Size */}
      <motion.div
        className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
      >
        {isInView && (
          <motion.span
            initial={{ count: 0 }}
            animate={{ count: value }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            onUpdate={(latest) => {
              if (ref.current)
                ref.current.textContent = Math.round(latest.count) + "%";
            }}
          />
        )}
        <span ref={ref}>0%</span>
      </motion.div>

      {/* Label: Slightly Larger Font Size for readability */}
      <p className="text-lg md:text-xl font-medium text-gray-700 tracking-wide">
        {label}
      </p>
    </div>
  );
};

export default function StatsCounter() {
  const stats = [
    { label: "Revenue Increasing", value: 95 },
    { label: "Company Growth", value: 88 },
    { label: "Client Enhancement", value: 92 },
    { label: "Convert Traffic", value: 85 },
  ];

  return (
    <div className="w-full max-w-[1320px] mx-auto px-6 py-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        {stats.map((s, i) => (
          <Counter key={i} {...s} />
        ))}
      </div>
    </div>
  );
}
