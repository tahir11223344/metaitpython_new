"use client";
import React from "react";
import { motion } from "framer-motion";

export default function IndustryHeroSection() {
  return (
    <section
      className="relative w-full min-h-[520px] overflow-hidden  bg-cover bg-center"
      style={{ backgroundImage: "url('/images/hero-img.png')" }}
    >
      {/* Dark overlay - image ke upar text readable rakhne ke liye */}

      {/* Decorative diagonal glowing line - matches subtle white curve in design */}
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

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-[25px] sm:text-[30px] lg:text-[40px] font-bold text-white leading-tight mb-6">
            Solutions That Speak Your Industry&apos;s Language
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-md">
            Meta IT is a blend of industry experience and innovation. We provide
            customized digital marketing and technology services for various
            companies. Our goal is to enable measurable growth and drive a brand
            presence that can harness long-term resonance for your brand.
          </p>
        </motion.div>

        {/* Right: Image card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-gradient-to-br from-orange-400 via-amber-300 to-orange-500"
        >
          {/* Background photo - replace with actual image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/industries/hero-industry.jpg"
            alt="Industry presentation"
            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          {/* Crane silhouette approximation (kept if real photo missing) */}
          <svg
            viewBox="0 0 800 500"
            className="absolute inset-0 w-full h-full text-black/40"
            preserveAspectRatio="xMidYMax slice"
          >
            <rect x="120" y="200" width="6" height="260" fill="currentColor" />
            <line
              x1="60"
              y1="220"
              x2="220"
              y2="220"
              stroke="currentColor"
              strokeWidth="4"
            />
            <line
              x1="123"
              y1="200"
              x2="200"
              y2="150"
              stroke="currentColor"
              strokeWidth="4"
            />
            <rect x="560" y="180" width="6" height="280" fill="currentColor" />
            <line
              x1="500"
              y1="200"
              x2="660"
              y2="200"
              stroke="currentColor"
              strokeWidth="4"
            />
            <line
              x1="563"
              y1="180"
              x2="640"
              y2="130"
              stroke="currentColor"
              strokeWidth="4"
            />
            <rect
              x="0"
              y="440"
              width="800"
              height="60"
              fill="currentColor"
              opacity="0.5"
            />
          </svg>

          {/* Dark vignette blob overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 90% at 50% 50%, rgba(20,20,20,0.75) 0%, rgba(20,20,20,0.55) 55%, transparent 75%)",
            }}
          />

          {/* Center circle ring */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full border border-white/70 flex items-end justify-center pb-6 sm:pb-8">
              <span className="text-white text-xs sm:text-sm font-medium tracking-wide">
                Company Presentation
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
