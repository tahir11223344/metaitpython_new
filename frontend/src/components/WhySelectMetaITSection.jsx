"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const defaultTabs = [
  {
    id: "proven-results",
    label: "Proven Results",
    description:
      "Demonstrate success in driving traffic, consumer engagement and definite growth across industries.",
  },
  {
    id: "comprehensive-solutions",
    label: "Comprehensive Solutions",
    description:
      "From SEO to full-scale campaign management, we provide end-to-end digital marketing solutions tailored to your business needs.",
  },
  {
    id: "data-driven-approach",
    label: "Data-Driven Approach",
    description:
      "Every strategy is backed by real analytics and performance data, ensuring decisions are driven by insight, not guesswork.",
  },
];

/**
 * Data dashboard ke "Detail Tabs Section" se aata hai (parent page props se):
 *   Section Title -> heading
 *   Tab Title     -> tab ka label
 *   Tab Content   -> neeche wala description
 *
 * tabs items ka shape flexible hai: {label, description} ya {title, content}.
 */
export default function WhySelectMetaITSection({
  heading = "Why Select Meta IT As Your Digital Marketing Agency?",
  tabs = defaultTabs,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Alag-alag shapes ko ek jaisa bana lo
  const items = (tabs || [])
    .map((t, i) => ({
      id: t.id ?? `tab-${i}`,
      label: t.label || t.title || "",
      description: t.description || t.content || "",
    }))
    .filter((t) => t.label);

  // Index safe rakho (tabs badal jayein to crash na ho)
  const active = items[activeIndex] || items[0];

  return (
    <section className="w-full bg-[#F7DCD3] py-14 px-6 md:px-12 lg:px-20">
      <div className="max-w-5xl mx-auto text-center">
        {/* HEADING */}
        <motion.h2
          initial={{ opacity: 0, y: -120 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1a2e] mb-8"
        >
          {heading}
        </motion.h2>

        {items.length > 0 ? (
          <>
            {/* TABS */}
            <motion.div
              initial={{ opacity: 0, y: 120 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-4 mb-6"
            >
              {items.map((tab, i) => {
                const isActive = activeIndex === i;

                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveIndex(i)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex-1 px-6 py-4 rounded-xl font-bold text-sm sm:text-base transition-colors duration-300 ${
                      isActive
                        ? "bg-white text-[#1a1a2e] shadow-md"
                        : "bg-[#E8825B] text-white hover:bg-[#DD6F42]"
                    }`}
                  >
                    {tab.label}
                  </motion.button>
                );
              })}
            </motion.div>

            {/* ACTIVE TAB DESCRIPTION */}
            <AnimatePresence mode="wait">
              <motion.p
                key={active?.id}
                initial={{ opacity: 0, y: 120 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -120 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="text-sm sm:text-base text-[#3d4f6b] max-w-2xl mx-auto whitespace-pre-line"
              >
                {active?.description}
              </motion.p>
            </AnimatePresence>
          </>
        ) : null}
      </div>
    </section>
  );
}