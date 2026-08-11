"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaBriefcase, FaArrowRight } from "react-icons/fa";

const tabsData = [
  {
    id: "company-benefits",
    label: "Company benefits",
    badge: "COMPANY BENEFITS",
    heading: "A Team Built Around You",
    description:
      "Meta IT's team will have a direct interface with your business model and goals. No tedious learning necessary, no hand-off. Just talented professionals who are in line with your objectives and are responsive to speed.",
    highlight: "Built to Deliver Measurable Growth",
    subtextPrefix: "Get your ",
    subtextBold: "First Payment Today",
    subtextSuffix: " and grow your business.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
  },
  {
    id: "competitive-analysis",
    label: "Competitive analysis",
    badge: "COMPETITIVE ANALYSIS",
    heading: "Know Exactly Where You Stand",
    description:
      "We benchmark your business against the top players in your industry. Our analysts uncover the gaps your competitors are missing and the opportunities you can move on first.",
    highlight: "Data-Driven Market Positioning",
    subtextPrefix: "Get your ",
    subtextBold: "Free Competitive Audit",
    subtextSuffix: " this week.",
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80",
  },
  {
    id: "trusted-experience",
    label: "Trusted experience",
    badge: "TRUSTED EXPERIENCE",
    heading: "15+ Years Behind Every Strategy",
    description:
      "Every recommendation we make is backed by real, hands-on experience across industries. We don't guess — we apply what has already worked for businesses like yours.",
    highlight: "Proven Across 200+ Client Engagements",
    subtextPrefix: "Start with a ",
    subtextBold: "Strategy Session",
    subtextSuffix: " today.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80",
  },
  {
    id: "real-results",
    label: "Real Results",
    badge: "REAL RESULTS",
    heading: "Outcomes You Can Actually Measure",
    description:
      "We track everything that matters — leads, conversions, revenue impact — and report it in plain language. No vanity metrics, just numbers that move your business forward.",
    highlight: "Transparent Reporting Every Month",
    subtextPrefix: "See your ",
    subtextBold: "First Report",
    subtextSuffix: " within 30 days.",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80",
  },
];

export default function CompanyBenefitsTabs() {
  const [activeTab, setActiveTab] = useState(tabsData[0].id);
  const activeData = tabsData.find((tab) => tab.id === activeTab);

  return (
    <section className="w-full max-w-full [overflow-x:clip] bg-gray-50 py-14 sm:py-16 lg:py-20">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tab Nav */}
        <div className="relative mb-10 sm:mb-14 border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-6 sm:gap-10 min-w-max sm:min-w-0 sm:justify-center pb-px">
            {tabsData.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-4 text-sm sm:text-base font-bold whitespace-nowrap transition-colors duration-300 ${
                  activeTab === tab.id
                    ? "text-orange-500"
                    : "text-slate-900 hover:text-orange-400"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute left-0 right-0 -bottom-px h-0.5 bg-orange-500"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center"
          >
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full lg:w-1/2 min-w-0"
            >
              <div className="w-full h-[280px] sm:h-[380px] lg:h-[460px] rounded-2xl overflow-hidden">
                <img
                  src={activeData.image}
                  alt={activeData.heading}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="w-full lg:w-1/2 min-w-0"
            >
              <p className="text-orange-500 font-bold text-xs sm:text-sm tracking-wide mb-3">
                {activeData.badge}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 leading-tight mb-5">
                {activeData.heading}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                {activeData.description}
              </p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-3 bg-white rounded-lg px-5 py-4 mb-5 shadow-sm"
              >
                <span className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <FaBriefcase className="text-orange-500 text-sm" />
                </span>
                <span className="font-bold text-slate-900 text-sm sm:text-base">
                  {activeData.highlight}
                </span>
              </motion.div>

              <p className="text-gray-500 text-sm sm:text-base mb-6">
                {activeData.subtextPrefix}
                <span className="font-bold text-slate-900">
                  {activeData.subtextBold}
                </span>
                {activeData.subtextSuffix}
              </p>

              <div className="flex flex-wrap items-center gap-6">
                <Link href="/services">
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-7 py-3.5 rounded-lg transition-colors duration-300 cursor-pointer group"
                  >
                    Explore services
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.span>
                </Link>

                <Link
                  href="/contact"
                  className="font-bold text-slate-900 text-sm sm:text-base hover:text-orange-500 transition-colors"
                >
                  Quick contact
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
