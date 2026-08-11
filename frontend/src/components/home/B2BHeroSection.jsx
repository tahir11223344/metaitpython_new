"use client";
import React from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const checklist = ["Impactful Results", "Superior Strategies"];

export default function B2BHeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full bg-[rgba(244,139,92,0.25)] py-8 px-6 lg:px-20 text-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        className="max-w-6xl mx-auto"
      >
        {/* Top Tagline */}
        <motion.p
          variants={itemVariants}
          className="text-orange-500 font-bold mb-4"
        >
          High-Impact Marketing Solutions Made To Outrank!
        </motion.p>

        {/* Main Heading */}
        <motion.h2
          variants={itemVariants}
          className="text-[20px] md:text-[35px] font-serif font-bold text-gray-900 mb-6"
        >
          Transform Your B2B Business With Meta IT
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-gray-700 text-base sm:text-lg mb-8 leading-relaxed max-w-3xl mx-auto"
        >
          Digital marketing is a sustainable option for B2B businesses calling
          for impactful results. The pipeline towards dominating your industry
          starts with Meta IT. Powered by insight, we transform businesses to
          win more conversions. These aren&apos;t guesses made lucky; this is
          just proven templates that work fast. Let&apos;s connect and develop a
          brand that resonates.
        </motion.p>

        {/* Checklist */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-10 mb-10"
        >
          {checklist.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Check className="w-4 h-4 text-orange-500" strokeWidth={3} />
              </span>
              <span className="font-serif font-bold text-gray-900">{item}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-3 font-bold text-white px-8 py-4 rounded-xl shadow-lg"
            style={{
              background: "linear-gradient(90deg, #f97316 0%, #1e293b 100%)",
            }}
          >
            Discover More
            <ArrowRight size={18} />
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
