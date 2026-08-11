"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ContactModal from "./ContactModal";

/**
 * Data server component (page.js) se `caseStudies` prop mein aata hai — SEO friendly.
 *
 * Har item (fetchCaseStudies se): {
 *   id, title, subtitle, image, imageAlt,
 *   document, documentName, description (HTML), createdAt
 * }
 */
export default function CaseStudiesGrid({ caseStudies = [] }) {
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Download ke liye chuni hui case study (ContactModal ko bhejne ke liye)
  const [downloadFor, setDownloadFor] = useState(null);

  return (
    <>
      <div className="text-center my-12">
        <span className="text-lg font-semibold text-[#EB9873] mb-6">
          Our Case
        </span>
        <h2 className="text-4xl font-bold font-serif mt-4">
          Download The Case Study Below
        </h2>
      </div>

      {caseStudies.length === 0 ? (
        <p className="text-center text-gray-600 py-10">
          Case studies coming soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {caseStudies.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              onClick={() => setSelectedCase(item)}
            >
              <div
                className="p-6 text-white h-32 flex flex-col justify-center"
                style={{
                  background: "linear-gradient(to right, #EB9873, #464B59)",
                }}
              >
                <h3 className="font-bold line-clamp-2">{item.title}</h3>
                {item.subtitle ? (
                  <p className="text-xs opacity-80 mt-2 line-clamp-2">
                    {item.subtitle}
                  </p>
                ) : null}
              </div>
              <div className="p-8 flex justify-center ">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.imageAlt || item.title}
                    className="w-[400px] h-[300px] object-contain"
                  />
                ) : (
                  <div className="w-[400px] h-[300px] bg-gray-100 rounded-lg" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Popup */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCase(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              // max-h-[90vh] aur overflow-y-auto content scroll ke liye zaroori hain
              className="bg-gray-200 p-6 md:p-8 rounded-2xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-0 right-1 text-3xl font-light hover:text-red-500 transition-colors"
                onClick={() => setSelectedCase(null)}
              >
                ×
              </button>

              {/* Modal Header Image */}
              {selectedCase.image ? (
                <div className="bg-[#464B59] p-4 text-white mb-6 flex justify-center ">
                  <img
                    src={selectedCase.image}
                    className="w-full h-auto max-h-[250px] object-contain"
                    alt={selectedCase.imageAlt || selectedCase.title}
                  />
                </div>
              ) : null}

              {/* Content */}
              <h2 className="text-xl md:text-2xl font-bold mb-4 leading-snug">
                {selectedCase.title}
              </h2>

              {selectedCase.description ? (
                <div
                  className="cs-rte mb-6 text-sm md:text-base text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedCase.description }}
                />
              ) : selectedCase.subtitle ? (
                <p className="mb-6 text-sm md:text-base text-gray-700 leading-relaxed">
                  {selectedCase.subtitle}
                </p>
              ) : null}

              {/* Action Button — Ab yeh hamesha show hoga modal ke andar */}
              <button
                className="bg-[#3b4353] text-white w-full py-3 rounded-lg font-bold hover:bg-gray-800 transition-all"
                onClick={() => {
                  setDownloadFor(selectedCase);
                  setSelectedCase(null);
                  setIsModalOpen(true);
                }}
              >
                Download
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ContactModal */}
   <ContactModal
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setDownloadFor(null);
  }}
  caseStudyId={downloadFor?.id}
  caseStudyTitle={downloadFor?.title || ""}
/>

      {/* Editor ke HTML ki styling */}
      <style>{`
        .cs-rte p { margin: 0.5rem 0; }
        .cs-rte h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
        .cs-rte h3 { font-size: 1.1rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
        .cs-rte ul { list-style: disc; padding-left: 1.35rem; margin: 0.5rem 0; }
        .cs-rte ol { list-style: decimal; padding-left: 1.35rem; margin: 0.5rem 0; }
        .cs-rte li { margin-bottom: 0.25rem; }
        .cs-rte li::marker { color: #EB9873; }
        .cs-rte a, .cs-rte a * { color: #b45309; text-decoration: underline; }
        .cs-rte blockquote { border-left: 3px solid #EB9873; padding-left: 0.75rem; color: #6b7280; margin: 0.5rem 0; }
        .cs-rte img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 0.5rem 0; }
      `}</style>
    </>
  );
}