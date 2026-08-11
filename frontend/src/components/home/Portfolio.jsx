"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Link from "next/link";

/**
 * Data CMS se aata hai — home page (server) `fetchPortfolios()` se laa kar
 * `projects` prop me deta hai.
 *
 * Har project: { id, title, desc, image, imageAlt }
 * ("desc" me editor ka HTML ho sakta hai — hum yahan tags nikaal kar plain
 *  text dikhate hain, taake <p> waghera nazar na aayein.)
 */
export default function Portfolio({ projects = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Kuch na aaye to section chup chaap hat jaye — toota page na dikhe
  if (!projects.length) return null;

  const visibleProjects = isExpanded ? projects : projects.slice(0, 3);
  const canExpand = projects.length > 3;

  return (
    <section className="py-20 px-6 bg-white">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold text-center text-orange-600 mb-16"
      >
        PORTFOLIO
      </motion.h2>

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
      >
        <AnimatePresence>
          {visibleProjects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -10 }}
              className="border-2 border-orange-500 rounded-3xl p-8 flex flex-col items-center text-center shadow-lg bg-white min-h-[400px]"
            >
              {/* Thumbnail — ho to dikhao, warna META IT circle */}
              <div className="w-24 h-24 bg-gray-100 rounded-full mb-6 flex items-center justify-center border border-orange-200 overflow-hidden">
                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.image}
                    alt={project.imageAlt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-gray-800">META IT</span>
                )}
              </div>

              <h3 className="text-xl font-bold text-orange-600 mb-4 h-14 overflow-hidden">
                {project.title}
              </h3>

              {/* desc me HTML aa sakta hai — plainText() se tags nikaal kar dikhate hain */}
              <p className="text-gray-600 mb-6 flex-grow line-clamp-4">
                {plainText(project.desc)}
              </p>

              {/* Sabhi cards ka "Read more" seedha /portfolio page par jata hai */}
              <Link
                href="/portfolio"
                className="text-orange-500 font-semibold hover:underline mt-auto"
              >
                Read more
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Show More / Less — sirf jab 3 se zyada hon */}
      {canExpand && (
        <div className="text-center mt-12">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Show less" : "Show more"}
            className="bg-gray-800 text-white p-4 rounded-full hover:bg-orange-600 transition-all shadow-lg"
          >
            {isExpanded ? <FaChevronUp size={24} /> : <FaChevronDown size={24} />}
          </motion.button>
        </div>
      )}
    </section>
  );
}

/**
 * HTML string se tags nikaal kar saaf text deta hai.
 * "<p>Nesciunt, ut soluta.</p>" -> "Nesciunt, ut soluta."
 * &amp; jaise HTML entities ko bhi theek kar deta hai.
 */
function plainText(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")      // saare tags hatao
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")          // extra spaces ek me
    .trim();
}