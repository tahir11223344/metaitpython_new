"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

export default function ServiceFAQSection({
  faqs = [],
  title = "Frequently Asked Questions",
  intro = "Meta IT's FAQ section is your source for clear answers on common inquiries regarding our services. We're here to help you understand just how we drive results and customize unique brand strategies.",
}) {
  const [openIndex, setOpenIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const items = (faqs || []).filter(
    (f) => f?.question?.trim() && f?.answer?.trim()
  );

  if (!items.length) return null;

  const VISIBLE = 5;
  const visible = showAll ? items : items.slice(0, VISIBLE);
  const canToggle = items.length > VISIBLE;

  const toggle = (i) => setOpenIndex(openIndex === i ? -1 : i);

  return (
    <section className="w-full bg-white py-12 sm:py-16 lg:py-20 px-5 sm:px-8 lg:px-20">
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,460px)_1fr] gap-8 lg:gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:sticky lg:top-34"
        >
          <h2 className="text-[20px] leading-[1.15] sm:text-[21px] lg:text-[30px] font-serif font-bold text-gray-900">
            {title}
          </h2>
          <p className="mt-4 sm:mt-5 text-sm sm:text-base text-slate-500 leading-relaxed max-w-md">
            {intro}
          </p>
        </motion.div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={faq.question + index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
                  className={
                    "rounded-xl overflow-hidden transition-colors duration-300 " +
                    (isOpen ? "bg-orange-50/70" : "bg-slate-50 hover:bg-slate-100")
                  }
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 text-left"
                  >
                    <span className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-400 text-white flex items-center justify-center shadow-sm"
                    >
                      <Plus size={18} strokeWidth={2.5} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 sm:px-6 pb-4 sm:pb-5 -mt-1 text-slate-600 leading-relaxed text-sm sm:text-[15px]">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {canToggle && (
            <motion.button
              layout
              type="button"
              onClick={() => setShowAll(!showAll)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-orange-400 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-500"
            >
              {showAll ? "Show Less" : "Show More"}
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
}