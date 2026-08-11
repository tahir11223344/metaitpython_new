"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaThumbsUp,
  FaMousePointer,
  FaMedal,
  FaCommentDots,
} from "react-icons/fa";

const features = [
  {
    icon: FaThumbsUp,
    title: "Trusted Company",
    description:
      "Transparent consultations & guidance, locking in on long-term relationships",
  },
  {
    icon: FaMousePointer,
    title: "Professional Work",
    description:
      "High-quality and precise strategy execution with superior industry knowledge.",
  },
  {
    icon: FaMedal,
    title: "Fixed Cost Project",
    description:
      "We keep it straight. No surprises, hidden fees, or false expectations.",
  },
  {
    icon: FaCommentDots,
    title: "Dedicated Team",
    description:
      "Tacticians invested in your goals with access to staff augmentation.",
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="w-full max-w-full [overflow-x:clip] bg-white">
      {/* Top: Heading + description */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 min-w-0"
          >
            <p className="text-orange-500 font-bold text-sm sm:text-base mb-3">
              Welcome to Meta IT Services
            </p>
            <h2 className="font-serif text-[20px] sm:text-[22px] lg:text-[35px] font-bold text-slate-900 leading-tight">
              Guiding your business to achieve success.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full lg:w-1/2 min-w-0 lg:pt-2"
          >
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Meta IT helps businesses with clear strategy direction and
              disciplined execution. We align technology, operations, and growth
              initiatives to harness superior outcomes.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom: Features grid on light gray bg */}
      <div className="bg-gray-100 py-14 sm:py-16">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 mb-12 sm:mb-14">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="flex flex-col items-center text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-5"
                    style={{ backgroundColor: "#FBD9CC" }}
                  >
                    <Icon className="text-slate-900 text-2xl sm:text-3xl" />
                  </motion.div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed max-w-[260px]">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom checkbox line */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-3 text-center"
          >
            <span className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center shrink-0">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <p className="text-slate-900 font-bold text-sm sm:text-base">
              Meta IT's team is united by the ambition towards corporate
              success.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
