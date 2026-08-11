"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

export default function HeadingSlider() {
  return (
    <div className="max-w-[1420px] mx-auto overflow-hidden py-10 bg-white">
      <Swiper
        modules={[Autoplay]}
        slidesPerView="auto" // Zaroori hai continuous movement ke liye
        spaceBetween={50}
        loop={true}
        speed={55000} // Speed jitni zyada hogi, utna slow move karega
        autoplay={{
          delay: 0, // 0 delay ka matlab hai koi rukawat nahi
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        className="w-full"
      >
        <SwiperSlide className="!w-auto">
          <h2 className="text-3xl md:text-6xl font-bold text-gray-800 whitespace-nowrap">
            Your brand’s{" "}
            <span className="text-orange-500">vision is our mission</span> . We
            curate and
            <span className="text-orange-500">execute designs</span> backed by
            purposeful strategies resulting in{" "}
            <span className="text-orange-500">measurable conversion</span>{" "}
            outcomes!
          </h2>
        </SwiperSlide>

        {/* Continuous effect ke liye slide repeat karein */}
        <SwiperSlide className="!w-auto">
          <h2 className="text-3xl md:text-6xl font-bold text-gray-800 whitespace-nowrap">
            Your brand’s{" "}
            <span className="text-orange-500">vision is our mission</span> . We
            curate and
            <span className="text-orange-500">execute designs</span> backed by
            purposeful strategies resulting in{" "}
            <span className="text-orange-500">measurable conversion</span>{" "}
            outcomes!
          </h2>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
