"use client";

import { motion } from "framer-motion";

export default function NewsletterSection() {
  return (
    <section className="py-16 my-6 px-6 lg:px-20 bg-[#404959]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 ">
        {/* Left Side: Content & Form */}
        <motion.div
          initial={{ opacity: 0, x: -90 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-[20px] md:text-[35px] font-bold text-white mb-6">
            Stay Updated with the Latest Digital Marketing Insights
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            Get expert tips, industry trends, and proven strategies delivered
            straight to your inbox to help your business grow digitally.
          </p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full p-4 rounded-lg bg-transparent border border-gray-400 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
            <button className="w-full md:w-auto px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
              Subscribe
            </button>
          </form>
        </motion.div>

        {/* Right Side: Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className=" overflow-hidden border-8 border-white h-80 md:h-400px r"
        >
          <img
            src="/images/health-care.png"
            alt="Digital Marketing Insights"
            className="w-full h-auto object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
