"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ConversionSection() {
  return (
    <section className="py-4 px-6 lg:px-20 bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 220 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-[1320px] mx-auto "
      >
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-8">
          Improve Conversion Analysis With In-depth Journey Mapping
        </h2>

        {/* Text Content */}
        <div className="text-gray-700 leading-relaxed space-y-6 mb-10">
          <p>
            Quit making guesses as to why sales and prospects start to drop. Start knowing. 
            Meta IT’s extensive journey mapping approach shows precisely how end consumers 
            move, stall, and click “buy” across every touchpoint of your digital ecosystem. 
            Like an animal on the prowl, we track your customers’ behavior all the way from 
            the first click through to the final choice. Identifying friction early on 
            helps businesses discover intent more accurately. Our blockchain audit tools 
            are constructed to ultimately discover invisible revenue leaks. Seal exits and 
            generate wins before misaligned design costs you any more growth.
          </p>
          
          <p>
            Every consumer interaction narrates a story. We read it. We refine it. Our 
            designs speak for themselves. Meta IT’s B2B specialists produce formulaic 
            strategies intended to guide users through clear-cut sales funnels. This 
            isn’t surface-level analytics. It provides more precise insights leading to 
            an increase in conversion rates, loyal customers, and smarter choices 
            supported by facts.
          </p>
        </div>

        {/* Button */}
        <Link href="/contact" className="bg-[#f97316] hover:bg-[#ea580c] text-white px-8 py-3 rounded-lg font-medium transition-all transform hover:scale-105">
          Contact Us
        </Link>
      </motion.div>
    </section>
  );
}