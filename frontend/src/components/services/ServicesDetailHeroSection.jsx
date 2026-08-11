"use client";
import React from "react";
import { motion } from "framer-motion";
import { mediaUrl } from "@/lib/serviceApi";

export default function ServicesDetailHeroSection({ service }) {
  if (!service) return null;

  // Form me hero ke liye alag field nahi hai, is liye thumbnail use hoti hai
  // aur na ho to static illustration. (Neeche note dekhein.)
  const heroImage = service.thumbnail
    ? mediaUrl(service.thumbnail)
    : "/images/home-hero.png";
  const heroAlt = service.thumbnail_alt || service.title || "Meta IT Services";

  return (
    <section
      className="relative w-full min-h-[520px] overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/images/hero-img.png')" }}
    >
      {/* Decorative diagonal glowing line */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1920 520"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M900 0 L1000 260 L850 520" stroke="white" strokeWidth="1.5" fill="none" />
      </svg>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-[28px] sm:text-[35px] lg:text-[40px] font-bold text-white leading-tight mb-6">
            {service.title}
          </h1>

          {service.short_description && (
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-lg">
              {service.short_description}
            </p>
          )}

          <button
            type="button"
            className="mt-8 px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-all"
          >
            Start Your Project
          </button>
        </motion.div>

        {/* Right: Image card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden flex items-center justify-center"
        >
          <img
            // src={heroImage}
            src="/images/home-hero.png"
            alt={heroAlt}
            width={640}
            height={480}
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}