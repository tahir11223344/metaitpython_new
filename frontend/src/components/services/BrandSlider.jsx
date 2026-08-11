"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

/**
 * Do tarah se use ho sakta hai:
 *
 * 1) SEO/performance ke liye behtar — server component se data pass karein:
 *      import { fetchBrands } from "@/lib/brandApi";
 *      const brands = await fetchBrands();
 *      <BrandSlider brands={brands} />
 *
 * 2) Sabse aasan — bas component daal dein, khud fetch kar lega:
 *      <BrandSlider />
 *
 * Dono mein GET /brands PUBLIC hona chahiye (auth line hata dein).
 *
 * Props:
 *   brands   optional — [{ name, src, website?, alt? }]
 *   speed    slider ki raftaar (bara number = dheema)
 *   linked   true -> logo clickable hoga (agar website set hai)
 */
export default function BrandSlider({ brands, speed = 3500, linked = false }) {
  const hasServerData = Array.isArray(brands);

  const [items, setItems] = useState(hasServerData ? brands : []);
  const [loading, setLoading] = useState(!hasServerData);

  useEffect(() => {
    if (hasServerData) {
      setItems(brands);
      return;
    }

    let active = true;
    setLoading(true);

    const params = new URLSearchParams({
      is_active: "true",
      size: "100",
      sort_by: "sort_order",
      sort_dir: "asc",
    });

    fetch(`${API_URL}/brands?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load brands");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setItems(
          (data.items || []).map((b) => ({
            id: b.id,
            name: b.company_name,
            website: b.website || "",
            src: mediaUrl(b.logo),
            alt: b.logo_alt || b.company_name,
          }))
        );
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brands]);

  // Sirf wahi logos jinke paas image hai
  const logos = items.filter((b) => b?.src);

  if (loading) {
    return (
      <div className="w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-center gap-8 sm:gap-12">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 shrink-0 animate-pulse rounded bg-gray-200 sm:h-10 sm:w-24"
            />
          ))}
        </div>
      </div>
    );
  }

  // Koi logo nahi -> kuch mat dikhao (khaali section se behtar)
  if (logos.length === 0) return null;

  // Swiper ka loop tabhi theek chalta hai jab slides slidesPerView se zyada hon.
  // Kam logos hon to loop off, warna slider atak/jhatka deta hai.
  const canLoop = logos.length > 6;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={2}
        spaceBetween={24}
        loop={canLoop}
        speed={speed}
        autoplay={
          canLoop
            ? {
                delay: 0,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        allowTouchMove={false}
        breakpoints={{
          480: { slidesPerView: 3, spaceBetween: 28 },
          768: { slidesPerView: 4, spaceBetween: 36 },
          1024: { slidesPerView: 6, spaceBetween: 48 },
        }}
        className="w-full"
      >
        {logos.map((brand, index) => {
          const img = (
            <img
              src={brand.src}
              alt={brand.alt || brand.name}
              className="h-8 sm:h-10 md:h-12 w-auto object-contain  opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
            />
          );

          return (
            <SwiperSlide
              key={brand.id ?? index}
              className="!flex items-center justify-center !h-auto"
            >
              {linked && brand.website ? (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={brand.name}
                >
                  {img}
                </a>
              ) : (
                img
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}