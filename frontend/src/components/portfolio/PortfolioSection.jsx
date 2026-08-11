"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/**
 * Data server component (page.js) se `items` prop mein aata hai — isliye content
 * initial HTML mein hota hai (SEO friendly). Ye component sirf filtering aur modal
 * (interactivity) handle karta hai.
 *
 * Har item: { id, title, desc, fullDesc (HTML), category, thumbnail, gallery[], imageAlt }
 */
export default function PortfolioSection({ items = [] }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState("All");

  const cardVariants = {
    hidden: { opacity: 0, y: 130 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  // Filters data se hi bante hain (jo categories actually maujood hain)
  const categories = [
    "All",
    ...Array.from(new Set(items.map((i) => i.category).filter(Boolean))).sort(),
  ];

  const filteredItems =
    filter === "All" ? items : items.filter((item) => item.category === filter);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-6">
        Our Featured Work: Turning Complex Challenges into Advantageous Gains
      </h2>
      <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
        Meta IT’s goal has always remained the same. Solve the unsolvable. With
        a commitment to grit and transparent communication with every client,
        we’ve dipped into every sector. Our portfolio seeks to go beyond
        completed code and marketing projects. Each IT project summary reflects
        on the strategic collaborations that helped shape industry standards.
        Learn how Meta IT’s result-first mentality turns whiteboard ideas into
        solid realities.
      </p>

      {/* Filter Buttons */}
      <div className="w-full mb-12 overflow-x-auto scrollbar-hide">
        <div className="flex justify-start md:justify-center gap-4 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                filter === cat ? "bg-black text-white" : "bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <p className="text-center text-gray-500">No projects found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredItems.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={cardVariants}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
              className="p-8 border border-gray-200 rounded-3xl shadow-sm cursor-pointer bg-white"
              onClick={() => setSelectedItem(item)}
            >
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.imageAlt}
                  className="w-full h-40 object-cover rounded-xl mb-6"
                />
              ) : (
                <div className="w-full h-40 rounded-xl bg-gray-100 mb-6" />
              )}
              <h3 className="text-orange-500 font-bold text-lg mb-4">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#F4F4F4] p-6 md:p-8 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-6 text-3xl hover:text-red-500"
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>

              {/* Image Grid Area */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Bari Image (Left) — thumbnail, warna pehli gallery image */}
                <div className="w-full md:w-2/3">
                  {selectedItem.thumbnail || selectedItem.gallery?.[0] ? (
                    <img
                      src={selectedItem.thumbnail || selectedItem.gallery[0]}
                      alt={selectedItem.imageAlt}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-64 rounded-xl bg-gray-200" />
                  )}
                </div>

                {/* Choti Images (Right) — gallery se */}
                {selectedItem.gallery?.length > 0 ? (
                  <div className="w-full md:w-1/3 flex flex-col gap-4">
                    {selectedItem.gallery.slice(0, 2).map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`${selectedItem.title} ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Text Content */}
              <h2 className="text-2xl font-bold mb-4">{selectedItem.title}</h2>

              {selectedItem.fullDesc ? (
                <div
                  className="portfolio-desc text-gray-700 mb-6 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedItem.fullDesc }}
                />
              ) : selectedItem.desc ? (
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {selectedItem.desc}
                </p>
              ) : null}

              {/* Action Button */}
              <Link
                href="/contact-us"
                className="bg-[#3b4353] text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-700 transition-all inline-block"
              >
                Get A Proposal
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rich description (HTML) ka basic styling */}
      <style>{`
        .portfolio-desc h2 { font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0; }
        .portfolio-desc h3 { font-size: 1.25rem; font-weight: 700; margin: 0.5rem 0; }
        .portfolio-desc p { margin: 0.5rem 0; }
        .portfolio-desc ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .portfolio-desc ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .portfolio-desc a { color: #2563eb; text-decoration: underline; }
        .portfolio-desc blockquote { border-left: 3px solid #d1d5db; padding-left: 0.75rem; color: #6b7280; margin: 0.5rem 0; }
        .portfolio-desc img { max-width: 100%; height: auto; border-radius: 0.5rem; }
      `}</style>
    </section>
  );
}