"use client";

import React from "react";
import { motion } from "framer-motion";
import { div } from "framer-motion/client";

export default function ServicesB2BSection() {
  const services = [
    {
      title: "Web Development Services That Elevate Brands",
      desc: "Meta IT goes beyond functionality when it comes to web development. We are a progressive web app development company. Our website designs consist of sleek interfaces and rock-solid backends. Curating powerful digital engines that drive growth for businesses is what inspires us. Let us unleash your b...",
    },
    {
      title: "Mobile Apps That Turn Concepts To Clicks",
      desc: "Be honest. How many apps have collected dust on your phone? How many forgettable novelty downloads have you installed that give off cheap and glitchy? Meta IT takes inspiration from these app failures, and engineers custom mobile app development services that steer users into action.",
    },
    {
      title: "Enterprise Software That Powers Performance",
      desc: "Stability and enterprise software go hand in hand. Meta IT cracks down on systems that disintegrate when the pressure is on. No more bottlenecks. Just high-performance enterprise software solutions that enable smoother processes.",
    },
    {
      title: "Generative AI: Think Faster, Act On Demand",
      desc: "Every day, businesses are losing time and in turn, opportunities. Manual work and outdated systems are slowing corporations down. Meta IT steps between that crossroad with custom generative AI solutions. A new path to how businesses operate using faster automation",
    },
    {
      title: "Machine Learning That Learns & Wins",
      desc: "Truth is, the market is unfair. It rewards corporations that think smarter. Meta IT fights fire with fire through machine learning solutions. Machine learning is an advantageous tool built for competitive environments. It's intelligence engineered to soar across with",
    },
    {
      title: "AI Integration That Puts You in the Pilot’s Seat",
      desc: "AI integration isn't about relinquishing control, it's about flying smarter. Meta IT is here to introduce you to a loyal co-pilot that only guarantees clear skies up ahead. We install intelligence right into systems using generative AI integration services, making decisions take",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section className="w-full bg-[#fceee6] py-20 px-6 lg:px-20 text-center">
      <div className="max-w-7xl mx-auto">
        {/* Header Tagline & Title */}
        <p className="text-orange-600 font-bold uppercase tracking-wide mb-3">
          Who We Serve
        </p>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-16">
          Customized{" "}
          <span className="text-[#e08e6f]">B2B Digital Marketing</span>{" "}
          Solutions
        </h2>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left"
        >
          {services.map((service, index) => (
            <>
              <div className="border-4 border-white rounded-2xl p-2 flex flex-col justify-between shadow-xl relative overflow-hidden">
                <motion.div
                  key={index}
                  variants={cardVariants}
                  className="bg-[#2d3748] border-2 border-orange-200/30 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden h-full w-full"
                >
                  <div>
                    <h3 className="text-xl md:text-[18px] font-serif font-bold mb-4 leading-snug bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-gray-100">
                      {service.title}
                    </h3>
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">
                      {service.desc}
                    </p>
                  </div>

                  <div>
                    <button className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium text-sm py-2.5 px-6 rounded-full shadow-md hover:from-orange-600 hover:to-orange-700 transition-all duration-300">
                      Learn More
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
