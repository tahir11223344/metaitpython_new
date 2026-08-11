"use client";

import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
  Globe2,
  Megaphone,
  Search,
  Smartphone,
  PenTool,
  TrendingUp,
} from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

// CMS ki service ke saath koi icon nahi aata, is liye ye set rotate karte hain —
// har card ko ek icon mil jata hai (sirf dikhawe ke liye).
const ICONS = [Globe2, Megaphone, Search, Smartphone, PenTool, TrendingUp];

/**
 * Data CMS se aata hai — home page (server) `getPublicServices()` se laa kar
 * `services` prop me deta hai.
 *
 * Har service (backend): { id, title, short_description, slug, ... }
 */
export default function ServicesSliderSection({ services = [] }) {
  // Kuch na aaye to section chup chaap hat jaye
  if (!services.length) return null;

  return (
    <section className="w-full bg-white py-16 px-6 sm:px-10 lg:px-20">
      <div className="max-w-[1320px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 130 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[20px] sm:text-[28px] lg:text-[35px] font-serif font-bold text-center text-gray-900 mb-12"
        >
          SERVICES WE <span className="text-orange-500">OFFER</span>
        </motion.h2>

        <motion.div>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop={services.length > 3}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="services-swiper"
          >
            {services.map((service, index) => {
              const Icon = ICONS[index % ICONS.length];
              return (
                <SwiperSlide key={service.id} className="h-auto pb-12">
                  <a
                    href={service.slug ? `/services/${service.slug}` : "/services"}
                    className="block h-full bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 p-8"
                  >
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-6">
                      {/* Thumbnail ho to dikhao, warna rotating icon */}
                      {service.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={service.image}
                          alt={service.imageAlt || service.title}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Icon className="w-7 h-7 text-orange-500" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-black mb-3 leading-snug line-clamp-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm line-clamp-4">
                      {service.desc}
                    </p>
                  </a>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </motion.div>
      </div>

      <style jsx global>{`
        .services-swiper .swiper-pagination {
          position: relative !important;
          margin-top: 30px !important;
        }
        .services-swiper .swiper-pagination-bullet {
          background: #fdba74;
          opacity: 1;
        }
        .services-swiper .swiper-pagination-bullet-active {
          background: #f97316;
        }
      `}</style>
    </section>
  );
}