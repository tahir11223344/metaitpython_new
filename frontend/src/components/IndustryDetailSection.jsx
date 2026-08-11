"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

const byOrder = (a, b) => (a.sort_order || 0) - (b.sort_order || 0);

// Brand logos ke liye backend mein abhi koi field nahi hai — filhaal static.
// (Chahein to inhe bhi ek nayi table/JSON field se dynamic kar sakte hain.)
const brandLogos = [
  { id: 1, name: "AWS", src: "/assets/images/brands/aws.svg" },
  { id: 2, name: "Microsoft", src: "/assets/images/brands/microsoft.svg" },
  {
    id: 3,
    name: "Google Cloud",
    src: "/assets/images/brands/google-cloud.svg",
  },
  { id: 4, name: "IBM", src: "/assets/images/brands/ibm.svg" },
  { id: 5, name: "Salesforce", src: "/assets/images/brands/salesforce.svg" },
  { id: 6, name: "Oracle", src: "/assets/images/brands/oracle.svg" },
];

/**
 * Data parent page (server component) se `industry` prop mein aata hai.
 * Cards = dashboard ke "Hero Slider" section ke slides.
 */
export default function IndustryDetailSection({ industry }) {
  const [showAll, setShowAll] = useState(false);
  const swiperRef = useRef(null);

  if (!industry) return null;

  const hero = industry.sub_details?.hero || {};

  // Hero Slider slides -> capability cards
  const capabilityCards = [...(hero.slides || [])].sort(byOrder).map((slide, i) => ({
    id: i + 1,
    image: mediaUrl(slide.image),
    imageAlt: slide.image_alt || slide.title || "",
    title: slide.title || "",
    excerpt: slide.excerpt || "",
    description: slide.description || "", // rich text HTML
  }));

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" },
    }),
  };

  const hasCards = capabilityCards.length > 0;

  return (
    <section className="relative bg-[#F7DCD3] py-16 px-6 md:px-12 lg:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* HEADING — Hero Title se */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-10 leading-tight"
        >
          {hero.title || "Built to Educate, Designed to Engage"}
        </motion.h2>

        {/* NAV ARROWS */}
        {hasCards && !showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-center md:justify-end gap-3 mb-6"
          >
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Previous slide"
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all duration-300"
            >
              <FaArrowLeft size={14} />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Next slide"
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all duration-300"
            >
              <FaArrowRight size={14} />
            </button>
          </motion.div>
        )}

        {/* MAIN CONTENT: TEXT + CARDS */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* LEFT TEXT BLOCK — Hero Side Title / Side Description se */}
          <motion.div
            initial={{ opacity: 0, x: -240 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7 }}
            className="lg:w-1/4 flex-shrink-0"
          >
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-4">
              {hero.side_title || "Prescribed for results"}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              {hero.side_description || industry.description}
            </p>
            {hasCards && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAll((prev) => !prev)}
                className="bg-[#3a3a52] text-white px-6 py-3 rounded-md font-semibold text-sm shadow-md hover:bg-[#1a1a2e] transition-all duration-300"
              >
                {showAll ? "Show Slider" : "View All"}
              </motion.button>
            )}
          </motion.div>

          {/* RIGHT: SLIDER OR GRID */}
          <div className="lg:w-3/4 w-full">
            {!hasCards ? null : (
              <AnimatePresence mode="wait">
                {!showAll ? (
                  <motion.div
                    key="slider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Swiper
                      modules={[Navigation]}
                      onSwiper={(swiper) => (swiperRef.current = swiper)}
                      spaceBetween={24}
                      slidesPerView={1}
                      breakpoints={{
                        640: { slidesPerView: 1.3 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                      }}
                      className="!pb-4 [&_.swiper-wrapper]:items-stretch"
                    >
                      {capabilityCards.map((card) => (
                        <SwiperSlide key={card.id} className="h-auto">
                          <div className="h-full">
                            <CapabilityCard card={card} />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
                  >
                    {capabilityCards.map((card, i) => (
                      <motion.div
                        key={card.id}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        className="h-full"
                      >
                        <CapabilityCard card={card} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* SECONDARY HEADING — Hero Bottom Text se */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a2e] mt-20 mb-10 leading-snug max-w-4xl mx-auto"
        >
          {hero.bottom_text ||
            `Delivering Sustainable Growth for ${industry.name} Organizations Including`}
        </motion.h2>

        {/* BRAND LOGO INFINITE SLIDER */}
        <BrandLogoSlider />
      </div>
    </section>
  );
}

/* ---------------- CAPABILITY CARD ---------------- */
function CapabilityCard({ card }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="bg-whit rounded-2xl shadow-m hover:shadow-xl overflow-hidden h-full flex flex-col transition-shadow duration-300"
    >
      <div className="relative w-full h-48 overflow-hidden group flex-shrink-0">
        {card.image ? (
          <img
            src={card.image}
            alt={card.imageAlt || card.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-[#F7DCD3]" />
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h4 className="font-serif text-lg font-bold text-[#1a1a2e] mb-2 min-h-[3.5rem]">
          {card.title}
        </h4>

        {/* Excerpt hai to wahi, warna description (HTML) ka fallback */}
        {card.excerpt ? (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
            {card.excerpt}
          </p>
        ) : card.description ? (
          <div
            className="card-rte text-sm text-gray-600 leading-relaxed line-clamp-4"
            dangerouslySetInnerHTML={{ __html: card.description }}
          />
        ) : null}
      </div>

      <style>{`
        .card-rte p { margin: 0; }
        .card-rte ul, .card-rte ol { padding-left: 1.1rem; margin: 0.25rem 0; }
        .card-rte ul { list-style: disc; }
        .card-rte ol { list-style: decimal; }
      `}</style>
    </motion.div>
  );
}

/* ---------------- BRAND LOGO INFINITE SLIDER ---------------- */
function BrandLogoSlider() {
  const logos = [...brandLogos, ...brandLogos];

  return (
    <div className="relative w-full overflow-hidden py-6">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#F7DCD3] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#F7DCD3] to-transparent z-10" />

      <motion.div
        className="flex items-center gap-16"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
        style={{ width: "max-content" }}
      >
        {logos.map((logo, i) => (
          <div
            key={`${logo.id}-${i}`}
            className="flex items-center justify-center h-14 w-28 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-300"
          >
            <img
              src={logo.src}
              alt={logo.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}