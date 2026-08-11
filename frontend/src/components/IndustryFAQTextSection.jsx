"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const defaultFaqs = [
  {
    id: 1,
    question: "How does Meta IT support high-traffic e-commerce platforms?",
    answer:
      "We build scalable cloud infrastructure and implement load-balancing strategies that ensure your platform stays fast and stable during traffic spikes, seasonal sales, and flash promotions.",
  },
  {
    id: 2,
    question: "Can Meta IT integrate multiple sales channels?",
    answer:
      "Yes, we specialize in connecting your storefront, marketplaces, and POS systems into a unified system, giving you real-time visibility across every sales channel.",
  },
  {
    id: 3,
    question: "How does automation improve retail operations?",
    answer:
      "Automation reduces manual errors in inventory management, order processing, and customer communication — freeing your team to focus on growth instead of repetitive tasks.",
  },
  {
    id: 4,
    question: "Does Meta IT optimize existing e-commerce platforms?",
    answer:
      "Absolutely. We audit your current platform's performance, UX, and backend architecture, then implement targeted improvements without disrupting your live operations.",
  },
];

/**
 * Data dashboard ke "Detail Services Section" se aata hai (parent page props se):
 *   Title           -> title
 *   Highlight Text  -> subtitle
 *   Description     -> description
 *   Accordion Items -> faqs (Title = question, Content = answer)
 *
 * faqs items ka shape flexible hai: {question, answer} ya {title, content} ya {q, a}.
 */
export default function IndustryFAQTextSection({
  title = "Retail & E-Commerce IT Solutions",
  subtitle = "Meta IT Services Serve Retail & E-Commerce",
  description = "Meta IT's solutions for retailers focus predominantly on automation, analytics, and cloud infrastructure. IT services are engineered to handle traffic spikes and inventory complexity. Our clients enjoy a less complex sales process and rapid growth.",
  faqs = defaultFaqs,
}) {
  const [openId, setOpenId] = useState(null);

  // Alag-alag shapes ko ek jaisa bana lo
  const items = (faqs || [])
    .map((f, i) => ({
      id: f.id ?? i,
      question: f.question || f.q || f.title || "",
      answer: f.answer || f.a || f.content || "",
    }))
    .filter((f) => f.question);

  const toggleFaq = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="w-full bg-white  py-16 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
        {/* LEFT: TITLE + SUBTITLE + DESCRIPTION */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: -120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-4 leading-tight"
          >
            {title}
          </motion.h2>

          {subtitle ? (
            <motion.h3
              initial={{ opacity: 0, y: 120 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-serif text-lg sm:text-xl font-bold text-[#E8825B] mb-4"
            >
              {subtitle}
            </motion.h3>
          ) : null}

          <motion.p
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-[#3d4f6b] leading-relaxed whitespace-pre-line"
          >
            {description}
          </motion.p>
        </div>

        {/* RIGHT: FAQ ACCORDION */}
        {items.length > 0 ? (
          <div className="flex flex-col gap-4">
            {items.map((faq, i) => {
              const isOpen = openId === faq.id;

              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 120 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-[#F3F4F6] rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-sm sm:text-base text-[#1a1a2e]">
                      {faq.question}
                    </span>

                    <motion.div
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="flex-shrink-0 w-8 h-8 rounded-md bg-[#E8825B] flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 text-white" strokeWidth={3} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && faq.answer && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}