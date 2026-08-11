"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";

// --- API Helper Code Inside ---
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function fetchActiveTestimonials() {
  const params = new URLSearchParams({
    is_active: "true", // Sirf active testimonials dikhane hain
    sort_dir: "desc",
    page: "1",
    size: "50", 
  });

  const res = await fetch(`${BASE_URL}/testimonials?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch testimonials");
  }

  const data = await res.json();
  return data.items || [];
}

export default function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchActiveTestimonials();
        setTestimonials(data);
      } catch (err) {
        console.error("Error loading testimonials:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Agar testimonials load ho rahe hon
  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin inline-block"></span>
        <p className="mt-2 text-sm font-medium">Loading amazing stories...</p>
      </div>
    );
  }

  // Agar database khali hai ya response nahi aaya
  if (testimonials.length === 0) {
    return null; // Slider chup jayega jab tak koi testimonial insert na ho
  }

  return (
    <section className="py-10 px-4 max-w-[1220px] mx-auto">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-8">
        Real Revenue Impact for Our Clients
      </h2>

      {/* Slider Container with relative positioning for navigation */}
      <div className="relative flex items-center">
        
        {/* Previous Button */}
        <button className="prev-btn absolute -left-16 lg:-left-24 p-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all z-10 hidden md:hidden lg:flex">
          <FaChevronLeft size={24} />
        </button>

        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          loop={testimonials.length > 1}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          grabCursor={true}
          navigation={{
            prevEl: ".prev-btn",
            nextEl: ".next-btn",
          }}
          className="w-full"
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="flex flex-col items-center gap-2 mb-6">
                <img src="/images/logo-img.png" alt="Logo" className="h-16 w-16" />
                <span className="font-bold text-lg text-gray-800">Meta IT Solutions</span>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-6 md:p-10 border-l-3 border-r-3 border-orange-500 bg-gray-50 rounded-[5px] shadow-sm"
              >
                {/* Highlight Title */}
                {item.highlight_title && (
                  <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
                    {item.highlight_title}
                  </h3>
                )}
                
                {/* Dynamic Rating Stars */}
                <div className="flex justify-center gap-1 text-orange-400 mb-4 text-sm md:text-lg">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>

                {/* Short Description */}
                <p className="text-sm md:text-base text-gray-600 mb-6 italic max-w-xl mx-auto">
                  "{item.short_description}"
                </p>

                {/* Highlight Percentage */}
                {item.highlight_percentage && (
                  <div className="text-2xl md:text-3xl font-extrabold text-orange-600">
                    {item.highlight_percentage}{" "}
                    <span className="text-sm md:text-lg text-black font-medium">
                      Increase in engagement
                    </span>
                  </div>
                )}
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Next Button */}
        <button className="next-btn absolute -right-16 lg:-right-24 p-3 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all z-10 hidden md:hidden lg:flex">
          <FaChevronRight size={24} />
        </button>
      </div>

      <div className="border-b-3 border-orange-200 mt-10"></div>
    </section>
  );
}