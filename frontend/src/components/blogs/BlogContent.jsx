"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Do tarah ka content support karta hai:
 *  1) HTML string  -> rich text editor se (API ka `description`)  ← ab yahi aata hai
 *  2) Blocks array -> purana static data ({type: heading|paragraph|list})
 */
export default function BlogContent({ blog }) {
  const content = blog?.content ?? blog?.description ?? "";

  // ---------- Purana blocks-array format ----------
  if (Array.isArray(content)) {
    return (
      <section className="w-full max-w-full [overflow-x:clip] bg-white py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {content.map((block, index) => {
            if (block.type === "heading") {
              return (
                <motion.h2
                  key={index}
                  initial={{ opacity: 0, y: 120 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-10 mb-4 first:mt-0"
                >
                  {block.text}
                </motion.h2>
              );
            }

            if (block.type === "paragraph") {
              return (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 120 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5 }}
                  className="text-gray-700 text-sm sm:text-base leading-relaxed mb-5"
                >
                  {block.text}
                </motion.p>
              );
            }

            if (block.type === "list") {
              return (
                <motion.ul
                  key={index}
                  initial={{ opacity: 0, y: 120 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-2 mb-6 pl-1"
                >
                  {block.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-gray-700 text-sm sm:text-base leading-relaxed"
                    >
                      <span className="text-orange-500 mt-1.5 text-xs shrink-0">
                        ●
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </motion.ul>
              );
            }

            return null;
          })}
        </div>
      </section>
    );
  }

  // ---------- Rich text HTML (editor se) ----------
  if (!content || typeof content !== "string") return null;

  return (
    <section className="w-full max-w-full [overflow-x:clip] bg-white py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="blog-rte"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* Editor ke HTML ka styling — purane block design se match karta hai */}
      <style>{`
        .blog-rte h1 {
          font-size: 1.5rem;
          line-height: 1.3;
          font-weight: 700;
          color: #0f172a;
          margin: 2.5rem 0 1rem;
        }
        .blog-rte h2 {
          font-size: 1.25rem;
          line-height: 1.35;
          font-weight: 700;
          color: #0f172a;
          margin: 2.5rem 0 1rem;
        }
        .blog-rte h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #0f172a;
          margin: 2rem 0 0.75rem;
        }
        .blog-rte > :first-child { margin-top: 0; }

        .blog-rte p {
          color: #374151;
          font-size: 0.875rem;
          line-height: 1.75;
          margin-bottom: 1.25rem;
        }

        .blog-rte ul,
        .blog-rte ol {
          margin: 0 0 1.5rem;
          padding-left: 1.5rem;
          color: #374151;
          font-size: 0.875rem;
          line-height: 1.75;
        }
        .blog-rte ul { list-style: disc; }
        .blog-rte ol { list-style: decimal; }
        .blog-rte li { margin-bottom: 0.5rem; }
        .blog-rte li::marker { color: #f97316; }

        .blog-rte a {
          color: #f97316;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .blog-rte strong { font-weight: 700; color: #0f172a; }
        .blog-rte em { font-style: italic; }

        .blog-rte blockquote {
          border-left: 3px solid #f97316;
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: #6b7280;
          font-style: italic;
        }

        .blog-rte img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }

        .blog-rte hr {
          border: 0;
          border-top: 1px solid #e5e7eb;
          margin: 2rem 0;
        }

        @media (min-width: 640px) {
          .blog-rte h1 { font-size: 1.875rem; }
          .blog-rte h2 { font-size: 1.5rem; }
          .blog-rte h3 { font-size: 1.25rem; }
          .blog-rte p,
          .blog-rte ul,
          .blog-rte ol { font-size: 1rem; }
        }
      `}</style>
    </section>
  );
}