"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AISection() {
  const stats = [
    {
      label: "Efficiency Boost",
      value: "32-40%",
      desc: "Improved campaign performance through automation and smart analytics",
    },
    {
      label: "Cost Reduction",
      value: "-30%",
      desc: "Reduced marketing spend while increasing return on investment",
    },
    {
      label: "Savings From AI Integration",
      value: "+ $500 million",
      desc: "Expanded audience engagement and improved marketing efficiency",
    },
  ];

  return (
    <section className="py-20 px-6 lg:px-20 bg-white">
      <div className="max-w-[1320px] mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left: Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Artificial Intelligence Supports Lucrative{" "}
            <span className="text-[#e08e6f] ">
              {" "}
              Digital Marketing Decisions
            </span>
          </h2>

          <p className="text-gray-600 leading-relaxed mb-10">
            Meta IT's AI-powered tech is breaking down efficiency barriers with
            smart automations. We employ AI to increase output across all
            departments and reduce expenses. Our clientele has received the
            benefit of cloud infrastructure optimization and scalable
            performance with no overhead.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-[#e08e6f] font-bold text-[16px]">{stat.value}</p>
                <h6 className="font-bold text-gray-900 mb-2 text-[18px]">
                  {stat.label}
                </h6>
                <p className="text-sm text-gray-500">{stat.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2 w-full"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/images/home-hero.png" // Replace with your actual image path
              alt="AI Marketing"
              className="w-full h-auto object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
