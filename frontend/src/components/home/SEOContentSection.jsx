"use client";
import { motion } from "framer-motion";

const bulletPoints = [
  "SEO provides your company with qualified leads by connecting them with direct access to consumers within your niche.",
  "A properly optimized website will perform well in search engines and allow for a consistent pull towards your product.",
  "Website optimization is the key to easier navigation and enhanced user experiences so that your visitors stay engaged longer.",
  "A higher ranking business is ultimately one that consumers can trust, stabilizing your authority within the marketplace.",
  "SEO marketing solutions with Meta IT compound over time for more sustainable revenue growth.",
  "Strong SEO equals more appeal and visibility, so you're always outperforming your competitors.",
];

const tocItems = [
  "Your brand's vision is our mission. We curate and execute designs backed by purposeful...",
  "Why Meta IT's Digital Marketing Services Deliver High Performance Results",
  "Inclusive Performance-based Marketing For Diverse Industries",
  "Transform the Search Bar Into a Revenue Driver with SEO Marketing Services",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function SEOContentSection() {
  return (
    <section className="py-16 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
      {/* Left Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="md:col-span-2 space-y-6"
      >
        <h2 className="text-[20px] sm:text-[28px] lg:text-[35px] font-serif font-bold leading-tight text-gray-900">
          Transform the Search Bar Into a Revenue Driver with SEO Marketing
          Services
        </h2>

        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
          Brands that are impossible to ignore are brands that show up where it
          matters, and tossing in a few keywords won&apos;t cut it. Rank your
          website productively. Meta IT helps our clients drive the right kind
          of visitors to their digital home by securing the momentum for real
          engagement. Our SEO marketing solutions are a powerful way to garner
          accelerated traffic with content that is valuable and influential.
        </p>

        <motion.ul
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="space-y-4 list-disc list-outside pl-5 marker:text-gray-400"
        >
          {bulletPoints.map((point, index) => (
            <motion.li
              key={index}
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-600 leading-relaxed"
            >
              {point}
            </motion.li>
          ))}
        </motion.ul>

        <motion.p
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="text-base sm:text-lg text-gray-600 leading-relaxed"
        >
          We focus on sustainable SEO strategies that build authority, improve
          rankings, and consistently deliver qualified traffic over time.
        </motion.p>
      </motion.div>

      {/* Right Sidebar/Table of Contents */}
      <aside className="md:col-span-1">
        <motion.div
          initial={{ opacity: 0, x: 130 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="sticky top-36 bg-gray-50 p-6 rounded-xl border border-gray-100"
        >
          <h3 className="font-serif font-bold text-gray-900 mb-5 text-lg">
            Table of Contents
          </h3>
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="space-y-5"
          >
            {tocItems.map((item, index) => (
              <motion.li
                key={index}
                variants={itemVariants}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500" />
                <span className="text-gray-700 group-hover:text-orange-500 transition-colors text-sm leading-snug">
                  {item}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </aside>
    </section>
  );
}
