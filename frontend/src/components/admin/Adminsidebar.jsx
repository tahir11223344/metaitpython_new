"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGrid,
  FiFileText,
  FiBriefcase,
  FiUsers,
  FiMail,
  FiSettings,
  FiMenu,
  FiX,
  FiZap,
  FiChevronDown,
  FiHome,
  FiUserCheck,
  FiTool,
} from "react-icons/fi";

// Har item ya to "leaf" hai (seedha href), ya "group" hai (subItems ke sath).
// Group items par click karne se accordion open/close hota hai — ek waqt
// mein sirf ek hi group open rehta hai.
const navItems = [
  { type: "leaf", label: "Overview", href: "/dashboard", icon: FiGrid },
  {
    type: "group",
    key: "setup",
    label: "Setup",
    icon: FiSettings,
    subItems: [
      {
        label: "Faqs",
        href: "/dashboard/faqs",
        icon: FiHome,
      },
      {
        label: "Testimonial",
        href: "/dashboard/testimonial",
        icon: FiUserCheck,
      },
      {
        label: "KPI Section",
        href: "/dashboard/kpi",
        icon: FiTool,
      },
        {
        label: "Category Section",
        href: "/dashboard/categories",
        icon: FiTool,
      },
        {
        label: "Portfolio Section",
        href: "/dashboard/portfolios",
        icon: FiTool,
      },
        {
        label: "SEO Section",
        href: "/dashboard/seo-meta",
        icon: FiTool,
      },
  {
        label: "Teame Section",
        href: "/dashboard/teams",
        icon: FiTool,
      },
    ],
  },
  {
    type: "group",
    key: "content",
    label: "Services Section",
    icon: FiFileText,
    subItems: [
      { label: "Services", href: "/dashboard/services" },
      { label: "Sub Services", href: "/dashboard/sub-services" },
    ],
  },
  { type: "leaf", label: "Industry Section", href: "/dashboard/industries", icon: FiMail },
    { type: "leaf", label: "Blogs Section", href: "/dashboard/blogs", icon: FiMail },
        { type: "leaf", label: "Casestudy Section", href: "/dashboard/case-studies", icon: FiMail },
 { type: "leaf", label: "Legal Pages ", href: "/dashboard/legal-pages", icon: FiMail },

  { type: "leaf", label: "Team", href: "/dashboard/team", icon: FiUsers },
    { type: "leaf", label: "Brands", href: "/dashboard/brands", icon: FiUsers },
  {
    type: "group",
    key: "content",
    label: "Queries",
    icon: FiFileText,
    subItems: [
      { label: "Services Contacts", href: "/dashboard/contacts" },
      { label: "Contacts Us", href: "/dashboard/contact-messages" },
      { label: "Case Study Download", href: "/dashboard/case-study-leads" },


    ],
  },
  {
    type: "leaf",
    label: "User Settings",
    href: "/dashboard/settings",
    icon: FiSettings,
  },
    {
    type: "leaf",
    label: "General Settings",
    href: "/dashboard/general-settings",
    icon: FiSettings,
  },
];


function isPathActive(pathname, href) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname?.startsWith(href);
}

function groupHasActiveChild(pathname, group) {
  return group.subItems?.some((sub) => isPathActive(pathname, sub.href));
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  // Jis group ke andar current page hai, wo automatically khula rahe
  useEffect(() => {
    const activeGroup = navItems.find(
      (item) => item.type === "group" && groupHasActiveChild(pathname, item),
    );
    if (activeGroup) setOpenGroup(activeGroup.key);
  }, [pathname]);

  const toggleGroup = (key) => {
    // Accordion behavior: agar already khula hai to band karo,
    // warna isay khol ke baaki sab band kar do (ek waqt mein ek hi)
    setOpenGroup((prev) => (prev === key ? null : key));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-20 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF7A45] to-[#7B6EF6] flex items-center justify-center shrink-0">
          <FiZap className="text-white" size={18} />
        </div>
        <span
          className="text-[17px] font-bold tracking-tight text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Meta IT<span className="text-[#FF7A45]">.</span>
        </span>
      </div>

      {/* Nav — scrollable agar items zyada hon */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto min-h-0 sidebar-scroll">
        {navItems.map((item) => {
          if (item.type === "leaf") {
            const isActive = isPathActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="relative block"
              >
                <div
                  className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-[#8891A8] hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,122,69,0.16), rgba(123,110,246,0.12))",
                        boxShadow: "0 0 0 1px rgba(255,122,69,0.25) inset",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                    />
                  )}
                  <Icon
                    size={17}
                    className={`relative shrink-0 ${isActive ? "text-[#FF7A45]" : ""}`}
                  />
                  <span className="relative">{item.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-dot"
                      className="relative ml-auto w-1.5 h-1.5 rounded-full bg-[#FF7A45]"
                    />
                  )}
                </div>
              </Link>
            );
          }

          // ============ Group (accordion) ============
          const GroupIcon = item.icon;
          const isOpen = openGroup === item.key;
          const hasActiveChild = groupHasActiveChild(pathname, item);

          return (
            <div key={item.key}>
              <button
                onClick={() => toggleGroup(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  hasActiveChild
                    ? "text-white"
                    : "text-[#8891A8] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <GroupIcon
                  size={17}
                  className={`shrink-0 ${hasActiveChild ? "text-[#FF7A45]" : ""}`}
                />
                <span className="flex-1 text-left">{item.label}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <FiChevronDown size={14} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pl-[19px] ml-3.5 border-l border-[#232B45] mt-1 space-y-0.5 pb-1">
                      {item.subItems.map((sub) => {
                        const isSubActive = isPathActive(pathname, sub.href);
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors duration-200 ${
                              isSubActive
                                ? "text-[#FF7A45] bg-[#FF7A45]/10"
                                : "text-[#8891A8] hover:text-white hover:bg-white/[0.04]"
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Bottom status card */}
      <div className="p-4 shrink-0">
        <div className="rounded-xl p-4 bg-gradient-to-br from-[#171D33] to-[#12172A] border border-[#232B45]">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-xs font-semibold text-[#A6ADC4]">
              All systems live
            </span>
          </div>
          <p className="text-[11px] text-[#6B7290] leading-relaxed">
            API, database, and site uptime are being monitored in real time.
          </p>
        </div>
      </div>

      <style jsx global>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #232b45;
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #2c3557;
        }
      `}</style>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-[#0D1220] border-r border-[#1B2138]">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-lg bg-[#12172A] border border-[#232B45] flex items-center justify-center text-white"
        aria-label="Open menu"
      >
        <FiMenu size={18} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-[#0D1220] border-r border-[#1B2138] z-50"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-6 right-4 text-[#8891A8] hover:text-white"
                aria-label="Close menu"
              >
                <FiX size={20} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
