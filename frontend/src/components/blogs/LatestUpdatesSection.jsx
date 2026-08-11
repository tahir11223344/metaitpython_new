"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const BLOGS_PER_PAGE = 6;

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Data server component (page.js) se `blogs` prop mein aata hai — SEO friendly.
 *
 * Har item (fetchBlogs se): {
 *   id, title, slug, category, type, readTime,
 *   image, imageAlt, shortDescription, createdAt
 * }
 */
export default function LatestUpdatesSection({ blogs = [] }) {
  const [activeCategory, setActiveCategory] = useState("All Blogs");
  const [currentPage, setCurrentPage] = useState(1);
  const catPrevRef = useRef(null);
  const catNextRef = useRef(null);

  // Categories blogs se hi banti hain — khaali tabs kabhi nahi dikhenge
  const blogCategories = useMemo(() => {
    const unique = Array.from(
      new Set(blogs.map((b) => b.category).filter(Boolean))
    ).sort();
    return ["All Blogs", ...unique];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    if (activeCategory === "All Blogs") return blogs;
    return blogs.filter((b) => b.category === activeCategory);
  }, [blogs, activeCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE),
  );

  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * BLOGS_PER_PAGE;
    return filteredBlogs.slice(start, start + BLOGS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  // Category badalte hi page 1 pe reset karo
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Section ke top pe smoothly scroll kar do taake user ko naya page dikhe
    document
      .getElementById("latest-updates")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="latest-updates"
      className="w-full max-w-full [overflow-x:clip] bg-white py-14 sm:py-16 lg:py-20"
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 120 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 text-center mb-8 sm:mb-10"
        >
          Latest Updates
        </motion.h2>

        {/* Category Slider — 1 se zyada category ho tabhi dikhao */}
        {blogCategories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 120 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mb-10 sm:mb-12 px-0 sm:px-10"
          >
            <button
              ref={catPrevRef}
              aria-label="Previous categories"
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#3b4353] hover:bg-slate-600 text-white items-center justify-center transition-colors"
            >
              <FaChevronLeft size={12} />
            </button>
            <button
              ref={catNextRef}
              aria-label="Next categories"
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[#3b4353] hover:bg-slate-600 text-white items-center justify-center transition-colors"
            >
              <FaChevronRight size={12} />
            </button>

            <Swiper
              modules={[Navigation]}
              slidesPerView="auto"
              spaceBetween={12}
              navigation={{
                prevEl: catPrevRef.current,
                nextEl: catNextRef.current,
              }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = catPrevRef.current;
                swiper.params.navigation.nextEl = catNextRef.current;
              }}
              className="!px-1"
            >
              {blogCategories.map((cat) => (
                <SwiperSlide key={cat} className="!w-auto">
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 sm:px-6 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors duration-300 ${
                      activeCategory === cat
                        ? "bg-orange-500 text-white"
                        : "bg-[#3b4353] text-white hover:bg-slate-600"
                    }`}
                  >
                    {cat}
                  </button>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        )}

        {/* Blog Grid */}
        {filteredBlogs.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            {blogs.length === 0
              ? "No blogs published yet."
              : "No blogs in this category yet."}
          </p>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${currentPage}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
              >
                {paginatedBlogs.map((blog, index) => (
                  <motion.div
                    key={blog.slug}
                    initial={{ opacity: 0, y: 130 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (index % 6) * 0.08 }}
                    whileHover={{ y: -8 }}
                  >
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="block bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden h-full flex flex-col group cursor-pointer"
                    >
                      <div className="h-44 sm:h-48 overflow-hidden bg-gray-100">
                        {blog.image ? (
                          <img
                            src={blog.image}
                            alt={blog.imageAlt || blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : null}
                      </div>

                      <div className="p-5 sm:p-6 flex flex-col flex-grow">
                        {blog.category ? (
                          <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit">
                            {blog.category}
                          </span>
                        ) : null}

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                          {blog.title}
                        </h3>

                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                          {blog.shortDescription}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            {formatDate(blog.createdAt)}
                            {blog.readTime ? ` · ${blog.readTime}` : ""}
                          </span>
                          <span className="text-sm font-bold text-slate-900 group-hover:text-orange-500 transition-colors inline-flex items-center gap-1">
                            Read More <span aria-hidden="true">→</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors"
                >
                  <FaChevronLeft size={12} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${
                        currentPage === page
                          ? "bg-orange-500 text-white"
                          : "border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                  className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors"
                >
                  <FaChevronRight size={12} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}