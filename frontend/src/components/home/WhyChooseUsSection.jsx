"use client";
import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    id: "01",
    title: "Brands Built On Data-Driven Decisions",
    desc: "As masters of the digital landscape, Meta IT hones key metrics to make smarter decisions towards fluctuating consumer patterns. What does this mean for the businesses we work with? We're always on the mark and geared towards marketing efficiency.",
  },
  {
    id: "02",
    title: "Targetable Audience Equals Higher Engagement Rates",
    desc: "Consumers want to engage with brands that understand what they crave. Our performance based marketing strategy enables businesses to incorporate user demographics and decisive behavioral markers to deliver more relevant promotions.",
  },
  {
    id: "03",
    title: "Capacity For Real-Time Optimization",
    desc: "Executing productive campaigns is made possible with our ability to capitalize on the momentum of the opportunity happening right now. The market is constantly evolving on top of consumer needs. Aligning with Meta IT allows you to keep up.",
  },
  {
    id: "04",
    title: "Global Reach Made Accessible",
    desc: "Confidently scale your company without limits. Meta IT erases the complexity of growth and instead, empowers brands in creating models that break down barriers and borders. Craft digital design that allows for better worldwide connection and integrates offshore software development.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function WhyChooseUsSection() {
  return (
    <section className="w-full bg-white py-16 px-6 sm:px-10 lg:px-20">
      <div className="max-w-[1320px] mx-auto">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 120 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-3xl sm:text-4xl lg:text-[34px] font-serif font-bold text-gray-900 leading-tight mb-14 w-full"
        >
          Why Meta IT&apos;s Digital Marketing Services Deliver High Performance
          Results
        </motion.h2>

        {/* Feature List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="divide-y divide-gray-100"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              whileHover={{ x: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="group py-8 first:pt-0 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6"
            >
              {/* Number */}
              <div className="flex-shrink-0 sm:w-16">
                <span className="text-lg sm:text-xl font-bold text-orange-500 tracking-wide">
                  {feature.id}
                </span>
              </div>

              {/* Text content */}
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mb-3 relative inline-block">
                  {feature.title}
                  <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-orange-500 transition-all duration-500 group-hover:w-full" />
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base max-w-3xl">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
