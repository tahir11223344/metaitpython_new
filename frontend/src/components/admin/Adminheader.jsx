"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiBell,
  FiChevronDown,
  FiLogOut,
  FiSettings,
  FiUser,
} from "react-icons/fi";
import apiClient from "@/lib/apiClient";

const notifications = [
  {
    id: 1,
    title: "New lead submitted",
    detail: "Sarah Malik filled the contact form",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    title: "Blog published",
    detail: '"SEO Strategies 2026" went live',
    time: "1h ago",
    unread: true,
  },
  {
    id: 3,
    title: "Service updated",
    detail: "Cloud Infrastructure page edited",
    time: "5h ago",
    unread: false,
  },
];

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AdminHeader({ title = "Overview" }) {
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // ============ Get logged-in user (GET /api/auth/me) ============
  useEffect(() => {
    // Pehle localStorage se turant dikhao (AdminGuard already cache karta hai),
    // phir background mein fresh data confirm kar lo.
    const cached = localStorage.getItem("user");
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        /* ignore parse errors */
      }
    }

    async function fetchProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const { data } = await apiClient.get("/api/auth/me");
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } catch {
        /* silent fail — cached user data stays visible.
           Agar 401 aaya, apiClient ka interceptor khud
           /login pe redirect kar chuka hoga. */
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============ Log Out ============
  const handleLogout = () => {
    setLoggingOut(true);
    // JWT stateless hai, is liye koi backend "logout" endpoint call karne ki
    // zaroorat nahi — bas client-side token/user clear kar ke redirect karo.
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 h-20 flex items-center justify-between gap-4 px-5 sm:px-8 border-b border-[#1B2138] bg-[#0A0E1A]/85 backdrop-blur-xl">
      {/* Title */}
      <div className="min-w-0 pl-12 lg:pl-0">
        <h1
          className="text-lg sm:text-xl font-bold text-white truncate"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
      </div>

      {/* Search */}
      <motion.div
        animate={{
          boxShadow: searchFocused
            ? "0 0 0 1px rgba(255,122,69,0.5), 0 0 24px rgba(255,122,69,0.15)"
            : "0 0 0 1px rgba(35,43,69,1)",
        }}
        className="hidden sm:flex items-center gap-2.5 flex-1 max-w-md rounded-lg px-3.5 py-2.5 bg-[#12172A]"
      >
        <FiSearch className="text-[#6B7290] shrink-0" size={16} />
        <input
          type="text"
          placeholder="Search leads, blogs, services…"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className="bg-transparent text-sm text-white placeholder:text-[#6B7290] outline-none w-full"
        />
        <kbd className="hidden lg:inline text-[10px] text-[#6B7290] border border-[#232B45] rounded px-1.5 py-0.5">
          ⌘K
        </kbd>
      </motion.div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative w-10 h-10 rounded-lg bg-[#12172A] hover:bg-[#171D33] border border-[#232B45] flex items-center justify-center text-[#A6ADC4] hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <FiBell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF7A45] text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-xl bg-[#12172A] border border-[#232B45] shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#232B45] flex items-center justify-between">
                  <span className="text-sm font-bold text-white">
                    Notifications
                  </span>
                  <span className="text-xs text-[#FF7A45] font-semibold">
                    {unreadCount} new
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="px-4 py-3 border-b border-[#1B2138] last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            n.unread ? "bg-[#FF7A45]" : "bg-transparent"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">
                            {n.title}
                          </p>
                          <p className="text-xs text-[#8891A8] mt-0.5">
                            {n.detail}
                          </p>
                          <p className="text-[11px] text-[#6B7290] mt-1">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg hover:bg-[#12172A] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A45] to-[#7B6EF6] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(user?.full_name)}
            </div>
            <span className="hidden sm:block text-sm font-medium text-white max-w-[120px] truncate">
              {user?.full_name || "Loading…"}
            </span>
            <FiChevronDown
              size={14}
              className={`hidden sm:block text-[#8891A8] transition-transform duration-200 ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 rounded-xl bg-[#12172A] border border-[#232B45] shadow-2xl overflow-hidden py-1.5"
              >
                {user && (
                  <div className="px-4 py-3 border-b border-[#232B45]">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-[#6B7290] truncate">
                      {user.email}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#A6ADC4] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <FiUser size={15} />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#A6ADC4] hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <FiSettings size={15} />
                  Account Settings
                </button>

                <div className="h-px bg-[#232B45] my-1.5" />

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#FB7185] hover:bg-[#FB7185]/10 transition-colors disabled:opacity-60"
                >
                  {loggingOut ? (
                    <span className="w-3.5 h-3.5 border-2 border-[#FB7185]/40 border-t-[#FB7185] rounded-full animate-spin" />
                  ) : (
                    <FiLogOut size={15} />
                  )}
                  Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
