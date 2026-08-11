"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaBullhorn,
  FaBriefcase,
  FaShoppingBag,
  FaEnvelope,
  FaPhoneAlt,
} from "react-icons/fa";
import ServicePromisesSection from "./ServicePromisesSection";

// Ye site-wide hain, per-service nahi — is liye CMS me nahi hain
const defaultSidebarLinks = [
  { label: "Engaging audiences", icon: FaUsers },
  { label: "Marketing research", icon: FaBullhorn },
  { label: "Sales development", icon: FaBriefcase },
  { label: "Marketing campaign", icon: FaShoppingBag },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

export default function ServiceContentSection({
  sidebarLinks = defaultSidebarLinks,
  activeLink = "Marketing campaign",
  contactEmail = "contact@metaitservices.co",
  contactPhone = "+1 (469) 767 8853",

  // --- ye sab admin se aate hain ---
  heading = "",
  description = "",
  solutionsTitle = "",
  solutions = [],
  solutionsImage = "/images/smart-automation-illustration.png",
  processTitle = "",
  processSteps = [],

  // ServicePromisesSection ko forward hote hain
  commitments = null,
  whyChoose = null,
}) {
  const cleanSolutions = (solutions || []).filter((s) => s && String(s).trim());
  const cleanSteps = (processSteps || []).filter(
    (s) => s?.title?.trim() || s?.description?.trim()
  );

  return (
    <section className="w-full max-w-full [overflow-x:clip] bg-white py-10 sm:py-14 lg:py-16">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-start">
          {/* Left Sidebar — sticky on lg+ */}
          {/* x: -450 se ye poori tarah screen ke bahar chala jata tha, is liye
              IntersectionObserver kabhi trigger hi nahi hota tha aur sidebar
              opacity:0 par atka reh jata tha. Chhota offset viewport ke andar
              rehta hai, is liye animation chalti hai. */}
          <motion.aside
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full lg:sticky lg:top-32 self-start"
          >
            <nav className="mb-6">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.label === activeLink;
                return (
                  <div
                    key={link.label}
                    className={`flex items-center justify-between py-3 border-b border-gray-200 cursor-pointer transition-colors ${isActive ? "text-orange-500" : "text-gray-900 hover:text-orange-400"}`}
                  >
                    <span className="font-bold text-sm sm:text-[15px] lg:text-[18px]">
                      {link.label}
                    </span>
                    <Icon className="text-lg shrink-0" aria-hidden="true" />
                  </div>
                );
              })}
            </nav>

            <div className="bg-[#3b4353] rounded-2xl p-6 text-white">
              <h4 className="text-lg font-bold mb-3">Have a Question?</h4>
              <p className="text-sm text-gray-300 leading-relaxed mb-5">
                Connect with our digital experts to explore the right strategy,
                technology, and growth roadmap tailored to your business.
              </p>

              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 transition-colors rounded-lg px-4 py-2.5 text-sm font-semibold mb-4 break-all"
              >
                <FaEnvelope className="shrink-0" aria-hidden="true" />
                {contactEmail}
              </a>

              <a
                href={`tel:${contactPhone.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-2 text-sm font-semibold hover:text-orange-400 transition-colors"
              >
                <FaPhoneAlt className="shrink-0" aria-hidden="true" />
                {contactPhone}
              </a>
            </div>
          </motion.aside>

          {/* Right Content — scrolls normally */}
          <div className="w-full min-w-0">
            {/* h2 kyunke page ka h1 SubServiceHero me hai */}
            {heading && (
              <motion.h2
                initial={{ opacity: 0, y: 90 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-2xl sm:text-3xl md:text-[34px] font-bold text-slate-900 leading-tight mb-5"
              >
                {heading}
              </motion.h2>
            )}

            {description && (
              <motion.p
                initial={{ opacity: 0, y: 90 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-gray-600 text-sm sm:text-base leading-relaxed mb-10"
              >
                {description}
              </motion.p>
            )}

            {/* Campaign Section — box tabhi banta hai jab points hon */}
            {cleanSolutions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 230 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-100 rounded-2xl p-6 sm:p-8 mb-14 sm:mb-16"
              >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-8 items-center">
                  <div>
                    {solutionsTitle && (
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">
                        {solutionsTitle}
                      </h3>
                    )}
                    <ul className="space-y-4">
                      {cleanSolutions.map((item, i) => (
                        <motion.li
                          key={i}
                          custom={i}
                          variants={fadeUp}
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: false, amount: 0.2 }}
                          className="flex items-center gap-3 pb-3 border-b border-gray-300 text-slate-800 font-medium text-sm sm:text-base"
                        >
                          <span className="text-orange-500 font-bold shrink-0" aria-hidden="true">
                            ✓
                          </span>
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    src={solutionsImage}
                    alt=""
                    loading="lazy"
                    className="w-full max-w-[260px] mx-auto h-auto"
                  />
                </div>
              </motion.div>
            )}

            {/* Development Process */}
            {cleanSteps.length > 0 && (
              <>
                {processTitle && (
                  <motion.h2
                    initial={{ opacity: 0, y: 90 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.6 }}
                    className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 sm:mb-10"
                  >
                    {processTitle}
                  </motion.h2>
                )}

                <div className="space-y-8 sm:space-y-10">
                  {cleanSteps.map((step, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: false, amount: 0.3 }}
                    >
                      <div className="flex items-baseline gap-3 mb-2">
                        {/* Number position se banta hai — admin me step hataane par
                            numbering apne aap durust rehti hai */}
                        <span className="text-orange-500 font-bold text-sm">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {step.title && (
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                            {step.title}
                          </h3>
                        )}
                      </div>
                      {step.description && (
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                          {step.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            <ServicePromisesSection
              heading={commitments?.title || ""}
              description={commitments?.description || ""}
              cards={commitments?.points || []}
              reasonsHeading={whyChoose?.title || ""}
              reasons={whyChoose?.points || []}
            />
          </div>
        </div>
      </div>
    </section>
  );
}