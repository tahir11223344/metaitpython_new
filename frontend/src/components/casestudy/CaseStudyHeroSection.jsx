"use client";
import React from "react";
import { motion } from "framer-motion";

export default function CaseStudyHeroSection() {
  return (
    <section
      className="relative w-full min-h-[520px] overflow-hidden  bg-cover bg-center"
      style={{ backgroundImage: "url('/images/hero-img.png')" }} // Optional: Agar background pattern hai
    >
      {/* Decorative diagonal glowing line */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1920 520"
      >
        <path
          d="M900 0 L1000 260 L850 520"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 ">
        {/* Left: Text content */}
        <motion.div
          initial={{ opacity: 0, y: 90 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-[28px] sm:text-[35px] lg:text-[40px] font-bold text-white leading-tight mb-6">
            Real-World Impact: Case Studies | Meta IT Services{" "}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-lg">
            We’ve helped hundreds of companies tear down the old ways and
            replace them with modern and more impactful digital engines. Our
            case studies explore how perfected engineering and intuitive
            foresight can convert operational challenges into market victories.
          </p>
          {/* <button className="mt-8 px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-all">
            Start Your Project
          </button> */}
        </motion.div>

        {/* Right: Image card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden  flex items-center justify-center "
        >
          {/* Main Illustration */}
          <img
            src="/images/home-hero.png"
            alt="Marketing Campaigns Directed by Visionaries - Digital Marketing Strategy Illustration"
            className="w-full h-full object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
