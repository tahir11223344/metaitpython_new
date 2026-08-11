"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiLock, FiZap } from "react-icons/fi";

/**
 * AdminGuard — dashboard/admin routes ko wrap karo isse.
 * Ye check karta hai:
 * 1. Token exist karta hai (agar nahi to /login pe redirect)
 * 2. Token valid hai + user ka is_admin=true hai (/api/auth/me se verify)
 *    Agar non-admin user hai to "Access Denied" dikhata hai, dashboard render nahi hota.
 *
 * Usage: apni dashboard/layout.js mein <AdminGuard>{children}</AdminGuard>
 */
export default function AdminGuard({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState("checking"); // checking | allowed | denied | unauthenticated

  useEffect(() => {
    async function verifyAdmin() {
      const token = localStorage.getItem("token");

      if (!token) {
        setStatus("unauthenticated");
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setStatus("unauthenticated");
          router.push("/login");
          return;
        }

        const user = await res.json();
        localStorage.setItem("user", JSON.stringify(user));

        if (!user.is_admin) {
          setStatus("denied");
          return;
        }

        setStatus("allowed");
      } catch (err) {
        setStatus("unauthenticated");
        router.push("/login");
      }
    }

    verifyAdmin();
  }, [router]);

  if (status === "checking" || status === "unauthenticated") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0E1A]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#232B45] border-t-[#FF7A45] rounded-full"
        />
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0E1A] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#FB7185]/10 flex items-center justify-center mx-auto mb-6">
            <FiLock size={26} className="text-[#FB7185]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-sm text-[#8891A8] mb-6">
            You don't have permission to access the admin dashboard. This area
            is restricted to Meta IT administrators only.
          </p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 bg-[#12172A] hover:bg-[#171D33] border border-[#232B45] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <FiZap size={14} />
            Back to homepage
          </button>
        </motion.div>
      </div>
    );
  }

  return children;
}
