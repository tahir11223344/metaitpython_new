"use client";

import React from "react";
import { motion } from "framer-motion";
import BrandSlider from "./BrandSlider";

const cards = [
  {
    title: "Digital Marketing Consultation",
    variant: "light",
    button: "Join With Us",
    buttonStyle: "bg-orange-400 hover:bg-orange-500 text-white",
  },
  {
    title: "AI-Powered Solutions",
    variant: "orange",
    button: "Discover more",
    buttonStyle: "bg-slate-800 hover:bg-slate-900 text-white",
  },
  {
    title: "Elevate Digital Presence",
    variant: "light",
    button: "Connect now",
    buttonStyle: "bg-orange-400 hover:bg-orange-500 text-white",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" },
  }),
};

export default function MarketingProsSection() {
  return (
    <section className="w-full max-w-full overflow-x-hidden bg-[#f4f5f7] py-14 sm:py-16 lg:py-20">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading row */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-10 mb-10 sm:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 130 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
            className="font-serif text-[20px] sm:text-[20px] md:text-[35px] font-bold text-slate-900 leading-tight max-w-xl"
          >
            Meta IT's Marketing Pros Ready To Level Up Your Brand!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 130 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-sm sm:text-[15px] text-slate-600 leading-relaxed max-w-sm lg:pt-2"
          >
            From social media strategy to novel AI-powered solutions, Meta IT
            harnesses fresher ways to dominate industries on the web. Create a
            brand that is impossible to ignore.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-14 sm:mb-16">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.3 }}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="relative bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden min-w-0"
            >
              {/* Top panel */}
              <div
                className={`relative h-40 sm:h-44 px-6 pt-6 overflow-hidden ${
                  card.variant === "orange" ? "bg-orange-400" : "bg-white"
                }`}
              >
                <h3
                  className={`font-serif text-xl sm:text-2xl font-bold leading-snug relative z-10 ${
                    card.variant === "orange"
                      ? "text-slate-900"
                      : "text-slate-900"
                  }`}
                >
                  {card.title}
                </h3>

                {/* Decorative chevron shape */}
                <div
                  className="absolute -bottom-4 -right-4 w-28 h-28 sm:w-32 sm:h-32 bg-slate-200/70"
                  style={{ clipPath: "polygon(100% 0, 0 50%, 100% 100%)" }}
                />
              </div>

              {/* Bottom panel with button */}
              <div className="px-6 pb-6 pt-3 bg-white relative z-10">
                <button
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-300 ${card.buttonStyle}`}
                >
                  {card.button}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand slider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <BrandSlider />
        </motion.div>
      </div>
    </section>
  );
}
