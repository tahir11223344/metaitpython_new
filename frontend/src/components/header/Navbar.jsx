"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { mediaUrl } from "@/lib/settingsApi";

const navData = [
  { name: "Home", path: "/" },
  {
    name: "Industry",
    path: "/industry",
    items: [
      { name: "Healthcare Marketing", path: "/industry/healthcare" },
      { name: "Retail / e Commerce", path: "/industry/retail" },
      { name: "IT & Tech Firm Marketing", path: "/industry/it" },
      { name: "Financial Firm Marketing", path: "/industry/finance" },
      { name: "Lifestyle Firm Marketing", path: "/industry/lifestyle" },
      { name: "Law Firm Marketing", path: "/industry/law" },
    ],
  },
  {
    name: "Services",
    path: "/services",
    items: [
      { name: "Web Development", path: "/services/web" },
      { name: "SEO Optimization", path: "/services/seo" },
      { name: "Digital Marketing", path: "/services/digital" },
    ],
  },
  {
    name: "About Metait",
    path: "/about-us",
    items: [
      { name: "Case Studies", path: "/case-studies" },
      { name: "Portfolios", path: "/portfolio" },
      { name: "Blog", path: "/blogs" },
    ],
  },
];

/**
 * Contact button — industry / agency-level micro-interactions:
 *  1. Magnetic pull  → pura button spring physics se cursor ki taraf khinchta hai,
 *     andar ka content halka zyada move karta hai (parallax depth).
 *  2. Ink-fill       → orange fill theek us point se phailti hai jahan cursor enter
 *     karta hai, aur jahan se nikalta hai wahan drain hoti hai.
 *  3. Arrow loop     → purana arrow right se nikal jata hai, naya left se aa jata hai.
 *  4. Shine + glow   → light streak cross hoti hai + hover pe soft orange shadow.
 * Koi nayi dependency nahi — framer-motion aur lucide-react already use ho rahe hain.
 */
const AnimatedContactButton = () => {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  // Magnetic pull — spring se smooth
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springCfg = { stiffness: 220, damping: 18, mass: 0.4 };
  const x = useSpring(mx, springCfg);
  const y = useSpring(my, springCfg);

  const STRENGTH = 0.35; // magnetic zor — barhao ya ghatao

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) * STRENGTH);
    my.set((e.clientY - r.top - r.height / 2) * STRENGTH);
  };

  const onEnter = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setOrigin({ x: e.clientX - r.left, y: e.clientY - r.top });
    setHovered(true);
  };

  const onLeave = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setOrigin({ x: e.clientX - r.left, y: e.clientY - r.top });
    setHovered(false);
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className="hidden md:block relative"
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        href="/contact-us"
        className="relative flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-2.5 font-bold shadow-[0_8px_22px_-10px_rgba(0,0,0,0.6)] transition-shadow duration-300 hover:shadow-[0_14px_30px_-8px_rgba(255,122,89,0.55)]"
      >
        {/* Ink-fill — cursor ki jagah se phailti hai */}
        <motion.span
          className="pointer-events-none absolute h-6 w-6 rounded-full bg-[#FF7A59]"
          style={{ left: origin.x, top: origin.y, x: "-50%", y: "-50%" }}
          animate={{ scale: hovered ? 22 : 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        />

        {/* Shine sweep */}
        <motion.span
          className="pointer-events-none absolute top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          initial={false}
          animate={{ left: hovered ? "150%" : "-70%" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        {/* Label */}
        <motion.span
          className="relative z-10"
          animate={{ color: hovered ? "#ffffff" : "#474F59" }}
          transition={{ duration: 0.25 }}
        >
          Contact
        </motion.span>

        {/* Arrow loop */}
        <span className="relative z-10 inline-flex h-[18px] w-[18px] items-center justify-center overflow-hidden">
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            animate={{ x: hovered ? 24 : 0, opacity: hovered ? 0 : 1 }}
            transition={{ duration: 0.35, ease: [0.5, 0, 0, 1] }}
          >
            <ArrowRight size={18} color={hovered ? "#ffffff" : "#FF7A59"} />
          </motion.span>
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: hovered ? 0 : -24, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.35, ease: [0.5, 0, 0, 1] }}
          >
            <ArrowRight size={18} color="#ffffff" />
          </motion.span>
        </span>
      </Link>
    </motion.div>
  );
};

/**
 * @param settings  server se aayi site settings (logo, site_name waghera).
 *                  Null ho to sab defaults chalte hain — page phir bhi render
 *                  hota hai, kuch toota nahi.
 */
const Navbar = ({ settings = null }) => {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);

  const logoSrc = settings?.logo ? mediaUrl(settings.logo) : "/images/logo-img.png";
  const siteName = settings?.site_name || "Meta IT Services";

  return (
    <header className="fixed  w-full bg-[rgba(64,73,89,0.9)] text-white z-50">
      <nav className="max-w-[1320px] mx-auto px-6 py-6 h-20 lg:h-[120px] flex items-center justify-between">
        <Link
          href="/"
          className="bg-white p-2 rounded-[15px] flex items-center justify-center w-[80px] h-[50px] sm:w-[90px] sm:h-[60px] md:w-[90px] md:h-[60px] lg:w-[130px] lg:h-[80px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt={siteName} className="h-full w-full object-cover" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {navData.map((link) => (
            <div
              key={link.name}
              className="relative py-8"
              onMouseEnter={() => link.items && setHoveredMenu(link.name)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <Link
                href={link.path || "#"}
                className="flex items-center text-[16px] lg:text-[20px] hover:text-orange-400 transition"
              >
                {link.name} {link.items && <ChevronDown className="ml-1 w-4 h-4" />}
              </Link>

              {link.items && (
                <AnimatePresence>
                  {hoveredMenu === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 60 }}
                      className="fixed left-1/2 -translate-x-1/2 top-[122px] w-[90%] max-w-[1200px] bg-[#3E4959] p-8 rounded-tl-4xl rounded-br-4xl border-t border-gray-600 flex gap-8 shadow-2xl z-[60]"
                    >
                      <div className="w-64 bg-[#FFFBF0] text-gray-800 p-6 rounded-xl shrink-0">
                        <h3 className="font-bold mb-2">Why Meta-it?</h3>
                        <p className="text-sm mb-4">
                          Get Your Industry&apos;s benchmarks &amp; New Marketing Prospectives
                        </p>
                        <Link
                          href="/contact-us"
                          className="inline-block bg-[#FF7A59] text-white px-4 py-2 rounded-lg font-bold"
                        >
                          Let&apos;s Talk
                        </Link>
                      </div>
                      <div className="grid grid-cols-3 gap-6 flex-1">
                        {link.items.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            className="border-b border-gray-500 pb-2 hover:text-orange-400 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>

        <AnimatedContactButton />

        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          className="md:hidden bg-[#3E4959] overflow-hidden px-6 pb-6"
        >
          {navData.map((link) => (
            <div key={link.name} className="py-4 border-b border-gray-600">
              <div
                className="flex justify-between items-center"
                onClick={() =>
                  setActiveAccordion(activeAccordion === link.name ? null : link.name)
                }
              >
                <Link href={link.path} onClick={() => setMobileMenuOpen(false)}>
                  {link.name}
                </Link>
                {link.items && (
                  <ChevronDown className={activeAccordion === link.name ? "rotate-180" : ""} />
                )}
              </div>
              {activeAccordion === link.name && link.items && (
                <div className="pl-4 mt-2 flex flex-col gap-2">
                  {link.items.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-300"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;