"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Public FAQ section.
 *
 * Usage (page ka naam DB ke `page` value se EXACT match hona chahiye):
 *   <FAQSection page="Home Page" />
 *   <FAQSection page="About Page" />
 *   <FAQSection page="Services Main Page" />
 *
 * `intro` prop optional hai — har page ka apna paragraph text de sakte hain.
 */
export default function FAQSection({
  page = "Home Page",
  intro = "Meta IT’s FAQ section is your source for clear answers on common inquiries regarding our services. We’re here to help you understand just how we drive results and customize unique brand strategies.",
}) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    setOpenIndex(null);
    setShowAll(false);

    const params = new URLSearchParams({
      page_name: page,
      size: "50",
      sort_dir: "desc", // naye FAQs pehle (created_at desc)
    });

    fetch(`${API_URL}/faqs?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load FAQs");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        // backend {question, answer} -> component {q, a}
        const items = (data.items || []).map((item) => ({
          q: item.question,
          a: item.answer,
        }));
        setFaqs(items);
      })
      .catch((e) => {
        if (active) setError(e.message || "Failed to load FAQs");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page]);

  const displayedFaqs = showAll ? faqs : faqs.slice(0, 4);

  return (
    <section className="py-8 px-6 max-w-[1320px] mx-auto grid md:grid-cols-2 gap-12 items-start">
      {/* Left side text with animation */}
      <motion.div
        initial={{ opacity: 0, x: -150 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-[25px] lg:text-[35px] font-bold mb-6">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 lg:text-lg leading-relaxed">{intro}</p>
      </motion.div>

      {/* Right side FAQs */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[60px] animate-pulse rounded-lg bg-gray-100 border border-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-gray-500">
            Unable to load FAQs right now. Please try again later.
          </p>
        ) : faqs.length === 0 ? (
          <p className="text-gray-500">No FAQs available yet.</p>
        ) : (
          <>
            {displayedFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full p-5 flex justify-between items-center font-semibold text-left lg:text-lg hover:text-orange-600 transition-colors"
                >
                  {faq.q}
                  <span className="bg-orange-500 text-white p-1 rounded min-w-[24px] text-center ml-2">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-4 text-gray-600 lg:text-base text-sm"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {faqs.length > 4 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition font-medium lg:text-lg"
              >
                {showAll ? "Show Less" : "Show More"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}