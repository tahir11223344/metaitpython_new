"use client";

import React from "react";
import { motion } from "framer-motion";
import { mediaUrl } from "@/lib/subServiceApi";

const fadeUp = {
  hidden: { opacity: 0, y: 130 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

/**
 * Admin ke do sections yahan render hote hain:
 *
 *   Commitments Section -> heading, description, cards
 *     cards[]  = { image, title, sub_title }
 *
 *   Why Choose Section  -> reasonsHeading, reasons
 *     reasons[] = { strong_text, description }
 *
 * Props ki shape jaan boojh kar API jaisi rakhi hai — beech me koi mapping
 * layer nahi, is liye galti ki gunjaish kam hai.
 */
export default function ServicePromisesSection({
  heading = "",
  description = "",
  cards = [],
  reasonsHeading = "",
  reasons = [],
}) {
  const cleanCards = (cards || []).filter(
    (c) => c?.title?.trim() || c?.sub_title?.trim() || c?.image
  );
  const cleanReasons = (reasons || []).filter(
    (r) => r?.strong_text?.trim() || r?.description?.trim()
  );

  const hasCommitments = heading || description || cleanCards.length;
  const hasWhyChoose = reasonsHeading || cleanReasons.length;

  // Admin ne dono sections khali chhore to kuch render na ho
  if (!hasCommitments && !hasWhyChoose) return null;

  return (
    <section className="w-full max-w-full [overflow-x:clip] bg-white py-10 sm:py-14">
      <div className="w-full">
        {/* ---------- Commitments Section ---------- */}
        {heading && (
          <motion.h2
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-[28px] font-bold text-slate-900 mb-3"
          >
            {heading}
          </motion.h2>
        )}

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-600 text-sm sm:text-[15px] leading-relaxed mb-8 max-w-3xl"
          >
            {description}
          </motion.p>
        )}

        {cleanCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-12">
            {cleanCards.map((card, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                whileHover={{ y: -6 }}
                className="border-3 border-orange-400 rounded-2xl p-2 min-w-0"
              >
                <div className="mb-3 bg-[#3b4353] p-2 w-full h-full rounded-2xl">
                  {card.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(card.image)}
                      alt=""
                      loading="lazy"
                      className="w-9 h-9 object-contain mb-2"
                    />
                  )}
                  {card.title && (
                    <h3 className="text-orange-400 font-bold text-sm mb-3">{card.title}</h3>
                  )}
                  {card.sub_title && (
                    <p className="text-gray-200 text-xs leading-relaxed">{card.sub_title}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ---------- Why Choose Section ---------- */}
        {reasonsHeading && (
          <motion.h2
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-[28px] font-bold text-slate-900 mb-5"
          >
            {reasonsHeading}
          </motion.h2>
        )}

        {cleanReasons.length > 0 && (
          <ul className="space-y-4 list-disc pl-5">
            {cleanReasons.map((reason, i) => (
              <motion.li
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="text-gray-700 text-sm sm:text-[15px] leading-relaxed"
              >
                {reason.strong_text && (
                  <span className="font-bold text-slate-900">{reason.strong_text}:</span>
                )}{" "}
                {reason.description}
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}