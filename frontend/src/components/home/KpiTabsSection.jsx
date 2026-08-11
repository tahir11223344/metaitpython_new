"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Backend me CTA field nahi hai — abhi ek default text use ho raha hai.
// Agar har tab ka apna CTA chahiye to KPI model me cta_text/cta_link add karein.
const DEFAULT_CTA = "Explore Services";

export default function KpiTabsSection() {
  const [tabs, setTabs] = useState([]); // [{ tag, heading, desc, highlights, cta }]
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ size: "50", sort_dir: "asc" });

    fetch(`${API_URL}/kpi-sections?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load KPI sections");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        const mapped = (data.items || [])
          .map((item) => ({
            tag: item.tag,
            heading: item.title,
            desc: item.subtitle,
            highlights: item.points || [],
            cta: DEFAULT_CTA,
          }))
          // alphabetical order (original component jaisa: Campaign Management, CPL, Data...)
          .sort((a, b) => a.tag.localeCompare(b.tag));

        setTabs(mapped);
        setActiveTab(mapped.length ? mapped[0].tag : null);
      })
      .catch((e) => {
        if (active) setError(e.message || "Failed to load KPI sections");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const active = tabs.find((t) => t.tag === activeTab);

  return (
    <section className="w-full bg-white py-4 px-6 sm:px-10 lg:px-20">
      <div className="max-w-[1320px] mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 120 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-[20px] sm:text-[24px] lg:text-[35px] font-serif font-bold text-gray-900 text-center mb-10"
        >
          Improve the KPIs That Matter Most to Your Business
        </motion.h2>

        {loading ? (
          <div className="relative flex min-h-[300px] items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 p-8 sm:p-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="relative flex min-h-[200px] items-center justify-center rounded-3xl bg-orange-50 p-8 text-center">
            <p className="text-gray-500">
              Unable to load this section right now. Please try again later.
            </p>
          </div>
        ) : tabs.length === 0 ? (
          <div className="relative flex min-h-[200px] items-center justify-center rounded-3xl bg-orange-50 p-8 text-center">
            <p className="text-gray-500">No KPI sections available yet.</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-6 mb-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.tag}
                  onClick={() => setActiveTab(tab.tag)}
                  className={`relative px-4 py-2 sm:px-5 sm:py-3 rounded-xl font-serif font-bold text-sm sm:text-base whitespace-nowrap transition-colors duration-300 ${
                    activeTab === tab.tag
                      ? "bg-orange-100 text-orange-500"
                      : "text-gray-900 hover:text-orange-500"
                  }`}
                >
                  {tab.tag}
                </button>
              ))}
            </div>

            {/* Content Panel */}
            {active ? (
              <div className="relative rounded-3xl bg-gradient-to-br from-orange-100 via-orange-50 to-orange-100 overflow-hidden p-8 sm:p-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="grid lg:grid-cols-2 gap-10 items-center"
                  >
                    {/* Left: Text content */}
                    <div>
                      <h3 className="text-[18px] sm:text-[24px] lg:text-[25px] font-serif font-bold text-gray-900 leading-tight mb-6">
                        {active.heading}
                      </h3>
                      <p className="text-gray-700 leading-relaxed mb-8 max-w-lg">
                        {active.desc}
                      </p>

                      <motion.a
                        href="#"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="inline-flex items-center gap-3 bg-slate-800 text-white font-bold px-6 py-4 rounded-xl hover:bg-slate-700 transition-colors"
                      >
                        {active.cta}
                        <ArrowRight size={18} />
                      </motion.a>
                    </div>

                    {/* Right: Image placeholder + highlight cards */}
                    <div className="relative flex items-center justify-center min-h-[280px] sm:min-h-[340px]">
                      {/* Image placeholder - apni actual image se replace kar dena */}
                      <div className="relative w-48 sm:w-64 h-full flex items-end justify-center">
                        <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-orange-200/60 flex items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-24 h-24 sm:w-32 sm:h-32 text-orange-300"
                          >
                            <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                          </svg>
                        </div>
                      </div>

                      {/* Highlight cards (desktop) */}
                      <div className="hidden sm:flex flex-col gap-4 absolute right-0 top-0 bottom-0 w-[55%] justify-between py-2">
                        {active.highlights.map((text, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 90 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 0.15 + index * 0.12,
                              ease: "easeOut",
                            }}
                            className="bg-orange-400/90 text-white text-sm font-medium rounded-xl px-5 py-4 text-center shadow-md"
                          >
                            {text}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Highlight cards (mobile) */}
                    <div className="sm:hidden flex flex-col gap-3 lg:col-span-2">
                      {active.highlights.map((text, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 90 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: 0.15 + index * 0.12,
                            ease: "easeOut",
                          }}
                          className="bg-orange-400/90 text-white text-sm font-medium rounded-xl px-5 py-4 text-center shadow-md"
                        >
                          {text}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}