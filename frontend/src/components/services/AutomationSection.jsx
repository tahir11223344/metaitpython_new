"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { mediaUrl } from "@/lib/serviceApi";

/**
 * Heading do rangon me ti hai. Admin "|" se hissa kar sakta hai:
 *   "Cost-Saving Automation That Saves Time. | Why Meta IT Is the Smarter Option."
 * "|" na ho to poori heading safed rehti hai.
 */
function splitHeading(heading) {
  const text = (heading || "").trim();
  const i = text.indexOf("|");
  if (i === -1) return [text, ""];
  return [text.slice(0, i).trim(), text.slice(i + 1).trim()];
}

export default function AutomationSection({ section }) {
  const points = (section?.points || []).filter(
    (p) => p.title?.trim() || p.sub_title?.trim()
  );
  const [headMain, headMuted] = splitHeading(section?.heading);

  // Admin ne Section One bhara hi nahi to poora section chhup jaye
  if (!headMain && points.length === 0) return null;

  const image = section?.image ? mediaUrl(section.image) : null;

  return (
    <section className="bg-black py-20 px-6 lg:px-20 text-white">
      <div className="max-w-[1320px] mx-auto">
        {/* Header — image ho to do column, warna pehle jaisa full width */}
        <div className={image ? "grid lg:grid-cols-2 gap-10 items-center mb-16" : "text-left mb-16"}>
          {headMain && (
            <h2 className="text-[20px] md:text-[35px] font-bold mb-6 leading-tight">
              {headMain}{" "}
              {headMuted && <span className="text-gray-400">{headMuted}</span>}
            </h2>
          )}

          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={section.image_alt || headMain || ""}
              loading="lazy"
              className="w-full max-h-[320px] object-contain"
            />
          )}
        </div>

        {points.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {points.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 230 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: Math.min(index, 5) * 0.1 }}
                className="border-2 border-orange-500 rounded-3xl p-8 bg-[#1a1a1a]"
              >
                <Award className="text-orange-500 mb-4" size={32} aria-hidden="true" />
                {item.title && <h3 className="text-xl font-bold mb-3">{item.title}</h3>}
                {item.sub_title && (
                  <p className="text-gray-400 text-sm leading-relaxed">{item.sub_title}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 text-lg">
          Let&rsquo;s make something great work Together.{" "}
          <a href="#" className="text-orange-500 font-bold hover:underline">
            Get Free Quote
          </a>
        </div>
      </div>
    </section>
  );
}