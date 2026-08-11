"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ContactCTA() {
  return (
    <section className="my-8  p-8 bg-[#FCE2D6]">
      <motion.div
        initial={{ opacity: 0, y: 90 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-[20px] md:text-[35px] font-bold text-gray-900 mb-6">
          Have A Project In Mind?
        </h2>

        <p className="text-gray-700 text-lg mb-10 leading-relaxed">
          Is your company ready to quit dreaming and to start building? Contact
          Meta IT. We’ll begin mapping out how we can turn your most difficult
          technical problems into your biggest competitive advantages.
        </p>

        <Link href="/contact-us">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 text-white font-bold rounded-lg shadow-lg"
            style={{
              background: "linear-gradient(to right, #EB9873, #464B59)",
            }}
          >
            Contact Us
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}
