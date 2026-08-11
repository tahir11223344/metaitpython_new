"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { mediaUrl } from "@/lib/serviceApi";

/**
 * Sirf ye hissa client par chalta hai (framer-motion ke liye).
 * Data fetching parent server component me hoti hai.
 */
export default function ServiceCard({ service, index = 0 }) {
  // Stagger cap: 30 services par aakhri card 6s baad aata — is liye 5 par rok diya
  const delay = Math.min(index, 5) * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay }}
      className="bg-gray-100 border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow flex flex-col md:flex-row items-center gap-8"
    >
      {/* Thumbnail */}
      <div className="w-32 h-32 flex-shrink-0">
        {service.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl(service.thumbnail)}
            alt={service.thumbnail_alt || service.title}
            width={128}
            height={128}
            loading={index < 2 ? "eager" : "lazy"}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-gray-200" aria-hidden="true" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>

        {service.short_description && (
          <p className="text-gray-600 mb-6 leading-relaxed">{service.short_description}</p>
        )}

        <Link
          href={`/services/${service.slug}`}
          aria-label={`Learn more about ${service.title}`}
          className="inline-block px-6 py-2 border-2 border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-500 hover:text-white transition-all"
        >
          Learn More
        </Link>
      </div>
    </motion.div>
  );
}