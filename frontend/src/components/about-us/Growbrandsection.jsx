"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function GrowBrandSection({
  heading = "No More Bowing To Numbers In Vain. Actually, Grow Your Brand.",
  paragraph = "Meta IT has abandoned the pursuit of chasing down meaningless vanity metrics. Numbers exist to analyze your business growth. Our job focuses on linking every strategy to real business outcomes like demand, revenue, and visibility through organic traffic. We keep track of what is actually important and eliminate what isn't, with a continuous emphasis on optimization and continual rise through any means possible. This isn't about luck or the complicated, fancy words other digital marketing agencies use to hype up false hope. This is about proper execution and clear-cut formulas to take down barriers of success and make way for opportunities. Meta IT is all about action. This is exactly how we've helped hundreds of clients go from stagnation to confidence and control over their revenue. Begin producing results without excuses or compromises ever again, begin with Meta IT.",
  statLabel = "126+ Clients Satisfied",
  statText = "…And we're only getting bigger. Our client relationships are built on trust and long-term value. This isn't a one-and-done deal with empty promises. Our clients remain partners with us because we're adaptable and personable without exception.",
  progressPercent = 78,
  topImage = "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
  bottomImage = "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
}) {
  return (
    <section className="w-full max-w-full [overflow-x:clip] bg-white py-14 sm:py-16 lg:py-20">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-10 items-start">
          {/* Left: Heading + paragraph */}
          <motion.div
            initial={{ opacity: 0, x: -140 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[58%] min-w-0"
          >
            <h2 className="font-serif text-[20px] sm:text-[22px] lg:text-[35px] font-bold text-slate-900 leading-tight mb-6">
              {heading}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              {paragraph}
            </p>
          </motion.div>

          {/* Right: Stat card with overlapping images */}
          <motion.div
            initial={{ opacity: 0, x: 140 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[42%] min-w-0"
          >
            <div className="relative flex">
              {/* Gray text card */}
              <div className="bg-gray-100 rounded-2xl p-6 sm:p-7 w-full sm:w-[68%] lg:w-[65%]">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">
                  {statLabel}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {statText}
                </p>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-300 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progressPercent}%` }}
                    viewport={{ once: false }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    className="h-full bg-slate-900 rounded-full"
                  />
                </div>
              </div>

              {/* Overlapping images — hidden on mobile for clean stacking, shown from sm+ */}
              <div className="hidden sm:flex flex-col gap-3 absolute right-0 top-0 -mr-2 sm:-mr-4 w-[45%] sm:w-[40%]">
                <motion.div
                  initial={{ opacity: 0, y: -120, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="rounded-r-[60px] sm:rounded-r-[80px] overflow-hidden h-[130px] sm:h-[150px] shadow-lg"
                >
                  <img
                    src={topImage}
                    alt="Client working"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 120, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="rounded-r-[60px] sm:rounded-r-[80px] overflow-hidden h-[130px] sm:h-[150px] shadow-lg"
                >
                  <img
                    src={bottomImage}
                    alt="Client reviewing analytics"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </div>

            {/* Mobile-only stacked images (clean, no overlap) */}
            <div className="flex sm:hidden gap-3 mt-4">
              <div className="w-1/2 h-[140px] rounded-xl overflow-hidden shadow-md">
                <img
                  src={topImage}
                  alt="Client working"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-1/2 h-[140px] rounded-xl overflow-hidden shadow-md">
                <img
                  src={bottomImage}
                  alt="Client reviewing analytics"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Get Proposal Button */}
        <motion.div
          initial={{ opacity: 0, y: 120 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 sm:mt-12"
        >
          <Link href="/contact-us">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block bg-[#3b4353] hover:bg-slate-700 text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-3.5 rounded-lg transition-colors duration-300 cursor-pointer"
            >
              Get Proposal
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
