"use client";

import { motion } from "framer-motion";

const strategies = [
  {
    id: "01",
    title: "Data-Driven Decision Support",
    desc: "We transform chaotic data into keys for success. Through the use of real-time analytics and predictive modeling, we empower leadership with trustworthy high-stakes decisions.",
  },
  {
    id: "02",
    title: "Infrastructure Modernization & Scaling",
    desc: "Legacy systems should no longer define your limit. We move and streamline your environment to the cloud so that your architecture is elastic, secure and capable of managing large spikes in traffic.",
  },
  {
    id: "03",
    title: "Operational Automation & Efficiency",
    desc: "Stop wasting human talent on repetitive tasks. We use AI and software that remove human error and reduce overhead. Enable your workforce to concentrate solely on valuable innovation and bottom-line growth.",
  },
  {
    id: "04",
    title: "Strategic Innovation Roadmap",
    desc: "We don't just provide tech. We provide a vision. Our advisors recognize the up-and-coming trends and disruptions in your niche. We focus on developing a long-term approach that would keep your brand current and in control of the changing markets.",
  },
  {
    id: "05",
    title: "Security & Compliance Hardening",
    desc: "Protect your brand with stronger digital defense systems. We build security into each tier of your department operations. Our clients achieve high standards and have the speed and agility needed to compete in the modern business environment.",
  },
];

export default function StrategySection() {
  return (
    <>
      <div className="max-w-6xl mx-auto text-center mb-8">
        <h2 className="text-[20px] md:text-[35px] font-bold text-gray-900 font-serif">
          Transform Your Business with Meta IT’s Proven Strategies
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {strategies.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex flex-col items-center text-center ${index === 4 ? "md:col-span-2 max-w-2xl mx-auto" : ""}`}
          >
            <span className="text-orange-500 font-bold text-[20px] md:text-[24px] mb-2">
              {item.id}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-gray-600 leading-relaxed max-w-lg">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </>
  );
}
