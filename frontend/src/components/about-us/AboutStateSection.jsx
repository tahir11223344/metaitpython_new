"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import Link from "next/link";

const stats = [
  { value: 50, suffix: "+", label: "Complete Projects" },
  { value: 5, suffix: "+", label: "On Going Projects" },
  { value: 200, suffix: "+", label: "Happy Clients" },
  { value: 100, suffix: "+", label: "Talented Team" },
];

function StatCounter({ value, suffix }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

export default function AboutStateSection() {
  return (
    <section className="w-full max-w-full [overflow-x:clip] bg-white py-14 sm:py-16 lg:py-20">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-8">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -140 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[55%] min-w-0"
          >
            <h2 className="font-serif text-[20px] sm:text-[22px] lg:text-[35px] font-bold text-slate-900 leading-tight mb-6">
              Meta IT's Road To Bespoke New Wave Digital Marketing Strategies
            </h2>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8">
              What happens when a group of bright thinkers and strategists come
              to the epic realization that the standard for digital success
              simply isn't good enough? We obsess over it and then…we build it.
              Founded in 2022 on this very momentum of change and 15 years of
              previous experience, Meta IT quickly became recognized as an
              industry-leading IT solutions firm. We've demonstrated outstanding
              results in aiding international brands towards corporate success
              ever since. Our tech tacticians believe marketing is an economical
              and hope-filled investment that deserves the maximum ROI. Deep
              expertise coupled with the relentless pursuit towards determined
              growth for our clients is what empowers us to lead with
              confidence.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 120 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/contact">
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-lg transition-colors duration-300 cursor-pointer"
                >
                  Start Your Project
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-gray-200 self-stretch" />

          {/* Right: Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[45%] min-w-0"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="bg-[#3b4353] rounded-xl px-4 py-6 sm:py-8 text-center min-w-0"
                >
                  <p className="text-white font-bold text-2xl sm:text-3xl mb-2">
                    <StatCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-gray-300 text-xs sm:text-sm font-medium">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
