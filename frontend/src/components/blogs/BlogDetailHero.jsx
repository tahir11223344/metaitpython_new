"use client";

import React from "react";
import { motion } from "framer-motion";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogDetailHero({ blog }) {
  return (
    <section className="relative w-full max-w-full [overflow-x:clip]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[280px] sm:h-[380px] lg:h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden"
        >
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />

          {/* Title overlay box — hamesha horizontally center */}
          <motion.div
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-[92%] sm:w-[88%] lg:max-w-[1000px] backdrop-blur-sm rounded-xl p-4 sm:p-6"
            style={{ backgroundColor: "rgba(188, 193, 214, 0.6)" }}
          >
            <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              {blog.category}
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-slate-900 leading-tight mb-2">
              {blog.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              {formatDate(blog.date)}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
