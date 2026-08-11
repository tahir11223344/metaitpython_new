"use client";
import React from "react";
import { motion } from "framer-motion";

export default function GlobalReachHeroSection() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.2 } },
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
    <section className="w-full bg-[#fceee6] py-16 sm:py-20 px-6 lg:px-20 text-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        {/* Top Tagline */}
        <motion.p
          variants={itemVariants}
          className="text-orange-500 font-serif text-lg mb-4"
        >
          Spanning All Across the Globe
        </motion.p>

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6"
        >
          International{" "}
          <span className="relative inline-block">
            Digital Marketing
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
              className="absolute left-0 -bottom-1 w-full h-[3px] bg-orange-500"
            />
          </span>{" "}
          Agency
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-gray-600 text-sm sm:text-base"
        >
          Rooted in the USA, reaching beyond state lines and across seas.
        </motion.p>
      </motion.div>
    </section>
  );
}
