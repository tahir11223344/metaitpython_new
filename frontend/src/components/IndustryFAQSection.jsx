"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const defaultFaqs = [
  {
    id: 1,
    question: "Why Choose Meta IT for Digital Marketing?",
    answer:
      "Meta IT combines industry-specific expertise with data-driven strategies to deliver measurable results. Our team understands the unique challenges of your sector and crafts campaigns that build trust while driving sustainable growth.",
  },
  {
    id: 2,
    question: "What Digital Marketing Services Does Meta IT Provide?",
    answer:
      "We offer a full suite of services including SEO, paid advertising, content marketing, social media management, email campaigns, and conversion rate optimization — all tailored to your industry's specific needs.",
  },
  {
    id: 3,
    question: "How Does Digital Marketing Improve Student Enrollment?",
    answer:
      "Through targeted campaigns, optimized landing pages, and strategic content, we guide prospective learners through the enrollment funnel — increasing visibility, building trust, and converting interest into applications.",
  },
];

/**
 * Data dashboard ke "Detail Accordion Section" se aata hai (parent page props se):
 *   Section Title       -> title
 *   Section Description -> description
 *   Image               -> logo
 *   Items (Title/Content) -> faqs
 *
 * faqs items ka shape flexible hai: {question, answer} ya {title, content} ya {q, a}
 * — teenon chal jate hain.
 */
export default function IndustryFAQSection({
  logo = "/images/meta-it-logo.png",
  title = "Education & EdTech Digital Marketing",
  description = "Meta IT's education-focused digital marketing strategies balances both professional trust and learning motivation. We want the future generation of students to succeed as much as institution leaders. Digital marketing services communicate value and guide prospective learners towards enrollment.",
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
      <div className="max-w-6xl mx-auto grid   grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* LEFT: LOGO / SECTION IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex justify-center lg:justify-start"
        >
          <img
            src={logo}
            alt={title || "Meta IT Services"}
            className="w-64 sm:w-72 md:w-80 h-auto object-contain"
          />
        </motion.div>

        {/* RIGHT: HEADING + DESCRIPTION + FAQ ACCORDION */}
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

          <motion.p
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-[#3d4f6b] leading-relaxed mb-8 whitespace-pre-line"
          >
            {description}
          </motion.p>

          {/* FAQ ACCORDION */}
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
      </div>
    </section>
  );
}