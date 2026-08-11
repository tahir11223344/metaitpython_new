"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { mediaUrl } from "@/lib/serviceApi";

export default function ServicesDetailView({ service }) {
  if (!service) return null;

  const subServices = service.sub_services || [];

  if (subServices.length === 0) {
    if (process.env.NODE_ENV === "production") return null;

    return (
      <section className="py-8 px-6 max-w-[1320px] mx-auto">
        <div className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-6">
          <p className="font-semibold text-amber-900">
            ServicesDetailView rendered nothing (dev-only message)
          </p>
          <p className="mt-1 text-sm text-amber-800">
            &ldquo;{service.title}&rdquo; has no sub-services yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-20 bg-white w-full max-w-full overflow-x-hidden">
      {/* Intro — filhal static. Section Two yahan aa sakta hai (batayein). */}
      <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12 mb-14 sm:mb-16 lg:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:w-1/2 w-full"
        >
          <div className="rounded-3xl h-[160px] sm:h-[200px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/digitalgrowth.png"
              alt="Digital growth illustration"
              loading="lazy"
              className="max-h-full w-auto"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:w-1/2 w-full"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4 sm:mb-6">
            A Smarter Approach to Digital Growth
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            We combine data-driven strategies with cutting-edge digital tools to help
            brands grow smarter, faster, and more efficiently. Our tailored solutions
            focus on measurable results, long-term scalability, and sustainable online
            success across all channels.
          </p>
        </motion.div>
      </div>

      {/* Sub-Services Grid */}
      {subServices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-14 sm:mb-16 justify-items-center">
          {subServices.map((subService, index) => (
            <motion.div
              key={subService.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.1 }}
              whileHover={{ y: -10 }}
              className=" p-[6px]  rounded-3xl w-full max-w-[360px] border-3 border-orange-400 text-white min-w-0"
            >
            <div className="bg-[#3b4353] w-full h-full p-4 rounded-3xl">
                <div className="mb-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                {subService.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl(subService.icon)}
                    alt=""
                    loading="lazy"
                    className="w-7 h-7 object-contain"
                  />
                ) : (
                  <span className="text-orange-500 font-bold">IT</span>
                )}
              </div>

              <h3 className="text-[17px] sm:text-[18px] font-bold text-orange-400 mb-6 leading-tight break-words">
                {subService.title}
              </h3>

              <ul className="space-y-3 sm:space-y-4 mb-8">
                {(subService.main_points || []).map((feature, i) => (
                  <li key={i} className="flex items-start text-gray-200 text-sm">
                    <span className="mr-3 text-orange-400 mt-0.5 shrink-0" aria-hidden="true">
                      ●
                    </span>
                    <span className="break-words">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* URL: /services/{service-slug}/{sub-service-slug} */}
              <Link href={`/services/${service.slug}/${subService.slug}`}>
                <motion.span
                  whileHover={{ x: 4 }}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg text-sm transition-colors cursor-pointer"
                >
                  View Service <span aria-hidden="true">&rarr;</span>
                </motion.span>
              </Link>
            </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="text-center">
        <Link href="/contact">
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 bg-[#3b4353] text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl font-bold cursor-pointer"
          >
            Get Proposal <span aria-hidden="true">&rarr;</span>
          </motion.span>
        </Link>
      </div>
    </section>
  );
}