"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

// Ye link columns filhal static hain — chahein to inhe bhi CMS se laaya ja
// sakta hai. Contact info aur social links ab settings se aate hain.
const servicesLinks = [
  "Digital Marketing",
  "Software Development",
  "Artificial Intelligence",
  "Cloud DevOps",
  "Advisory Strategy",
  "Data Analytics",
  "Workflow Automation",
];

const industriesLinks = [
  "Healthcare & Life",
  "Education & Tech",
  "Retail & Ecommerce",
  "Finance Tech",
  "Startup & SaaS",
];

const usefulLinks = [
  "Case-studies",
  "Services",
  "Blogs",
  "Privacy Policy",
  "Terms & Condition",
  "Disclaimer",
  "Write For Us",
];

const locations = ["USA", "Canada", "UK", "Australia", "UAE"];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const columnVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function FooterColumn({ title, links, delay = 0 }) {
  return (
    <motion.div
      variants={columnVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay }}
    >
      <h4 className="text-white font-serif font-bold text-lg mb-5">{title}</h4>
      <motion.ul
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="space-y-3"
      >
        {links.map((link) => (
          <motion.li key={link} variants={itemVariants}>
            <a href="#" className="text-gray-300 text-sm hover:text-orange-400 transition-colors">
              {link}
            </a>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

/**
 * @param settings  server se aayi site settings. Null ho to defaults chalte hain.
 */
export default function FooterSection({ settings = null }) {
  const email = settings?.email || "contact@metaitservices.co";
  const phone = settings?.phone || "+1 (469) 767 8853";
  const address = settings?.address || "555 N. 5th St, Suite 109, Garland, TX 75040";

  // Sirf wahi social icon dikhayein jiska link settings me maujood hai
  const socials = [
    { icon: FaFacebookF, href: settings?.facebook },
    { icon: FaTwitter, href: settings?.twitter },
    { icon: FaLinkedinIn, href: settings?.linkedin },
    { icon: FaInstagram, href: settings?.instagram },
  ].filter((s) => s.href);

  // Settings khali ho (pehli baar) to kam se kam icons to dikhein
  const socialFallback = socials.length === 0;
  const socialList = socialFallback
    ? [
        { icon: FaFacebookF, href: "#" },
        { icon: FaTwitter, href: "#" },
        { icon: FaLinkedinIn, href: "#" },
        { icon: FaInstagram, href: "#" },
      ]
    : socials;

  const year = new Date().getFullYear();
  const siteName = settings?.site_name || "META IT SERVICES";

  return (
    <footer className="w-full">
      {/* CTA Banner */}
      <div className="px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 360 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative -mb-10 z-10 max-w-7xl mx-auto bg-[#F96037] rounded-2xl px-6 sm:px-10 py-6 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
        >
          <h3 className="text-white font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-center md:text-left leading-snug">
            Let&apos;s talk about how we can transform your business!
          </h3>

          <motion.a
            href={`mailto:${email}`}
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-4 flex-shrink-0"
          >
            <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
              <FaEnvelope className="w-5 h-5 text-orange-500" />
            </span>
            <span className="text-white text-left">
              <span className="block text-sm font-medium">Interested in working?</span>
              <span className="block font-bold">{email}</span>
            </span>
          </motion.a>
        </motion.div>
      </div>

      {/* Dark Footer Body */}
      <div className="bg-slate-700 pt-20 pb-8 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* About column */}
          <motion.div
            variants={columnVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <h4 className="text-white font-serif font-bold text-lg mb-5">
              About {siteName}
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Meta IT is a digital marketing and IT solution company that delivers
              intelligent tech and data-driven marketing. We offer scalable solutions
              at comprehensive rate plans to help modern businesses grow.
            </p>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="space-y-3 mb-6"
            >
              <motion.a
                variants={itemVariants}
                href={`mailto:${email}`}
                className="flex items-center gap-3 text-gray-300 text-sm hover:text-orange-400 transition-colors"
              >
                <FaEnvelope className="w-4 h-4 text-orange-500 flex-shrink-0" />
                {email}
              </motion.a>
              <motion.a
                variants={itemVariants}
                href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-3 text-gray-300 text-sm hover:text-orange-400 transition-colors"
              >
                <FaPhoneAlt className="w-4 h-4 text-orange-500 flex-shrink-0" />
                {phone}
              </motion.a>
              <motion.p
                variants={itemVariants}
                className="flex items-start gap-3 text-gray-300 text-sm"
              >
                <FaMapMarkerAlt className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                {address}
              </motion.p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="flex gap-3"
            >
              {socialList.map(({ icon: Icon, href }, index) => (
                <motion.a
                  key={index}
                  variants={itemVariants}
                  href={href}
                  target={href && href !== "#" ? "_blank" : undefined}
                  rel={href && href !== "#" ? "noopener noreferrer" : undefined}
                  whileHover={{ y: -3, scale: 1.08 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-orange-500 group transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-orange-500 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          <FooterColumn title="Services" links={servicesLinks} delay={0.05} />
          <FooterColumn title="Industries" links={industriesLinks} delay={0.1} />
          <FooterColumn title="Usefull Links" links={usefulLinks} delay={0.15} />
          <FooterColumn title="Locations" links={locations} delay={0.2} />
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-7xl mx-auto mt-14 pt-6 border-t border-slate-600 text-center"
        >
          <p className="text-gray-400 text-sm">
            Copyright © {year} | {siteName} ® | All right reserved
          </p>
        </motion.div>
      </div>
    </footer>
  );
}