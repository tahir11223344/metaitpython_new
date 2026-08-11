"use client";
import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Cpu, ArrowRight, ChevronRight } from "lucide-react";

const features = [
  {
    icon: ShoppingCart,
    title: "Retail/E-Commerce",
    desc: "Focusing on conversion and incremental growth by centering steady traffic and customer loyalty.",
  },
  {
    icon: Cpu,
    title: "IT & Tech Firm Marketing",
    desc: "Market leadership solely made possible with innovating performance-based solutions.",
  },
];

export default function AboutAgencySection() {
  return (
    <section className="w-full bg-white py-16 px-6 sm:px-10 lg:px-20 overflow-hidden">
      <div className="max-w-[1320px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Illustration composition */}
        <motion.div
          initial={{ opacity: 0, x: -140 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative h-[420px] sm:h-[480px] flex items-center justify-center"
        >
          {/* Dotted background pattern */}
          <div
            className="absolute left-0 top-0 w-40 h-40 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, #d1d5db 1.5px, transparent 1.5px)",
              backgroundSize: "14px 14px",
            }}
          />

          {/* Orange arrow ribbon shape */}
          <motion.svg
            initial={{ opacity: 0, x: 130 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            viewBox="0 0 100 260"
            className="absolute right-6 sm:right-10 top-1/3 w-16 sm:w-20 h-auto text-orange-500"
          >
            <path
              d="M0 0 L60 0 L100 60 L60 120 L100 180 L60 240 L0 240 L40 180 L0 120 L40 60 Z"
              fill="currentColor"
              opacity="0.9"
            />
          </motion.svg>

          {/* Main illustration card */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-56 sm:w-64 bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <svg viewBox="0 0 200 180" className="w-full h-auto">
              {/* Background blob */}
              <ellipse cx="100" cy="130" rx="90" ry="45" fill="#fdece0" />

              {/* Bars */}
              <rect
                x="40"
                y="90"
                width="24"
                height="60"
                rx="4"
                fill="#f97316"
              />
              <rect
                x="88"
                y="60"
                width="24"
                height="90"
                rx="4"
                fill="#0f766e"
              />
              <rect
                x="136"
                y="105"
                width="24"
                height="45"
                rx="4"
                fill="#fbbf24"
              />

              {/* Trend line + arrow */}
              <polyline
                points="30,120 70,80 110,50 150,30"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="150" cy="30" r="5" fill="#3b82f6" />

              {/* Simple person figure climbing */}
              <circle cx="72" cy="75" r="9" fill="#fbcfa1" />
              <rect
                x="65"
                y="84"
                width="16"
                height="26"
                rx="6"
                fill="#f97316"
              />
              <rect
                x="63"
                y="108"
                width="8"
                height="20"
                rx="3"
                fill="#0f172a"
              />
              <rect
                x="77"
                y="108"
                width="8"
                height="20"
                rx="3"
                fill="#0f172a"
              />
            </svg>

            <p className="mt-4 font-serif font-bold text-gray-900 text-lg leading-tight">
              Increase Your
              <br />
              Conversion Rate
            </p>
          </motion.div>

          {/* Floating stat card */}
          <motion.div
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            animate={{ y: [0, 8, 0] }}
            className="absolute -bottom-4 left-0 sm:left-4 z-20 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 w-56"
          >
            <svg viewBox="0 0 36 36" className="w-12 h-12 flex-shrink-0">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="4"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#22c55e"
                strokeWidth="4"
                strokeDasharray="35 65"
                strokeDashoffset="25"
                strokeLinecap="round"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="4"
                strokeDasharray="20 80"
                strokeDashoffset="-10"
                strokeLinecap="round"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeDasharray="15 85"
                strokeDashoffset="-30"
                strokeLinecap="round"
              />
              <text
                x="18"
                y="16"
                textAnchor="middle"
                fontSize="6"
                fontWeight="bold"
                fill="#0f172a"
              >
                TOTAL
              </text>
              <text
                x="18"
                y="23"
                textAnchor="middle"
                fontSize="7"
                fontWeight="bold"
                fill="#0f172a"
              >
                1248
              </text>
            </svg>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-600">Management</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-gray-600">SEO Rank</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600">Social</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Text content */}
        <motion.div
          initial={{ opacity: 0, x: 140 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="text-orange-500 font-semibold mb-3">
            About Marketing Agency
          </p>
          <h2 className="text-[20px] sm:text-[28px] lg:text-[35px] font-serif font-bold text-gray-900 leading-tight mb-10">
            Inclusive Performance-based Marketing For Diverse Industries
          </h2>

          <div className="space-y-8 mb-10">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 120 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 * index,
                    ease: "easeOut",
                  }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-gray-900 mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed w-full">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <motion.a
              href="#"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-3 bg-slate-800 text-white font-bold px-6 py-4 rounded-xl hover:bg-slate-700 transition-colors"
            >
              Learn more
              <ArrowRight size={18} />
            </motion.a>

            <motion.a
              href="#"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-1 font-serif font-bold text-gray-900 hover:text-orange-500 transition-colors"
            >
              Our services
              <ChevronRight size={18} />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
