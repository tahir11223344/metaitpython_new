"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

// Accent colours cycle — API se colour nahi aata, isliye yahan rotate karte hain
const accents = ["bg-orange-200", "bg-sky-200", "bg-emerald-200", "bg-amber-200"];

/**
 * Data server component (page.js) se `industries` prop mein aata hai,
 * taake content initial HTML mein ho (SEO friendly).
 *
 * Har item: { id, name, slug, description, image, image_alt }
 */
export default function IndustriesListSection({ industries = [] }) {
  if (!industries.length) {
    return (
      <section className="w-full bg-slate-700 px-6 py-20 text-center">
        <p className="text-gray-300">Industries coming soon.</p>
      </section>
    );
  }

  return (
    <section className="w-full bg-slate-700">
      {industries.map((industry, index) => {
        const isEven = index % 2 === 0;
        const accent = accents[index % accents.length];
        const href = `/industry/${industry.slug}`;

        return (
          <React.Fragment key={industry.slug}>
            <div className="px-6 sm:px-10 lg:px-16 py-14 sm:py-16">
              <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -340 : 340 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`order-1 ${isEven ? "md:order-1" : "md:order-2"}`}
                >
                  <Link href={href}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{
                        type: "spring",
                        stiffness: 250,
                        damping: 20,
                      }}
                      className={`relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden ${accent} shadow-lg cursor-pointer`}
                    >
                      {industry.image ? (
                        <img
                          src={industry.image}
                          alt={industry.image_alt || industry.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2
                            className="w-16 h-16 sm:w-20 sm:h-20 text-slate-700/30"
                            strokeWidth={1.5}
                          />
                        </div>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Text content */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 340 : -340 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`order-2 ${isEven ? "md:order-2" : "md:order-1"}`}
                >
                  <Link href={href}>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-orange-500 mb-4 hover:underline decoration-2 underline-offset-4 cursor-pointer inline-block">
                      {industry.name}
                    </h3>
                  </Link>
                  <p className="text-gray-200 leading-relaxed mb-8 max-w-xl">
                    {industry.description}
                  </p>

                  <Link href={href}>
                    <motion.span
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg transition-colors cursor-pointer"
                    >
                      See More Detail
                    </motion.span>
                  </Link>
                </motion.div>
              </div>
            </div>

            {index !== industries.length - 1 && (
              <div className="h-2 sm:h-3 bg-white" />
            )}
          </React.Fragment>
        );
      })}
    </section>
  );
}