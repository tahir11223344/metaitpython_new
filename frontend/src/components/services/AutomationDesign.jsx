"use client";

import React from "react";
import { motion } from "framer-motion";
import { mediaUrl } from "@/lib/serviceApi";

export default function AutomationDesign({ section }) {
  const points = (section?.points || []).filter(
    (p) => p.title?.trim() || p.sub_title?.trim()
  );

  const heading = section?.heading?.trim() || "";
  const description = section?.description?.trim() || "";

  // Admin ne Section Two bhara hi nahi to poora section chhup jaye
  if (!heading && !description && points.length === 0) return null;

  // Image na ho to company logo hi rehta hai (pehle jaisa)
  const image = section?.image ? mediaUrl(section.image) : "/meta-it-logo.png";
  const imageAlt = section?.image_alt?.trim() || "META IT SERVICES Logo";

  return (
    <section className="py-16 px-6 md:px-10 lg:px-20 bg-white">
      {/* Main Heading */}
      {(heading || description) && (
        <div className="grid lg:grid-cols-2 gap-8 items-end mb-16">
          {heading && (
            <motion.h2
              initial={{ opacity: 0, y: -90 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-gray-900 leading-tight"
            >
              {heading}
            </motion.h2>
          )}

          {description && (
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">{description}</p>
          )}
        </div>
      )}

      {/* Container for Image and Text Content */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Left Column: Logo/Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -90 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:w-2/5 flex justify-center items-start"
        >
          <div className="w-full max-w-sm md:max-w-md lg:max-w-lg bg-white border border-gray-200 rounded-3xl shadow-xl p-8 flex items-center justify-center aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={imageAlt}
              loading="lazy"
              className="w-full h-auto object-contain"
            />
          </div>
        </motion.div>

        {/* Right Column: Points */}
        {points.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 90 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:w-3/5"
        >
          <div className="grid grid-cols-1 gap-12">
            {points.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 90 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * Math.min(index, 5) }}
                className="flex flex-col md:flex-row items-start gap-4 md:gap-6"
              >
                {/* Number admin se nahi aata — position se banta hai */}
                <span className="text-4xl md:text-5xl font-serif font-bold text-orange-400 shrink-0">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  {point.title && (
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 mb-3">
                      {point.title}
                    </h3>
                  )}
                  {point.sub_title && (
                    <p className="text-gray-700 text-sm leading-relaxed">{point.sub_title}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        )}
      </div>
    </section>
  );
}