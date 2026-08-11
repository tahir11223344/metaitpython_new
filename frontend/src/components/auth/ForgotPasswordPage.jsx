"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FiMail,
  FiArrowRight,
  FiZap,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Something went wrong");
      }

      // Backend hamesha generic success message deta hai (security ke liye) —
      // is liye response ka content check karne ki zaroorat nahi.
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full [overflow-x:clip] flex items-center justify-center bg-[#0A0E1A] relative px-4 py-12">
      <BackgroundDecoration />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF7A45] to-[#7B6EF6] flex items-center justify-center">
            <FiZap className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold text-white">
            Meta IT<span className="text-[#FF7A45]">.</span>
          </span>
        </div>

        <div className="rounded-2xl border border-[#232B45] bg-[#12172A] p-8 sm:p-10">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-2xl font-bold text-white mb-2 text-center">
                  Forgot your password?
                </h1>
                <p className="text-[#8891A8] text-sm mb-8 text-center leading-relaxed">
                  No worries. Enter the email linked to your account and we'll
                  send you a link to reset it.
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 px-4 py-3 rounded-lg bg-[#FB7185]/10 border border-[#FB7185]/30 text-[#FB7185] text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#A6ADC4] mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <FiMail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7290]"
                        size={16}
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0D1220] border border-[#232B45] text-white text-sm placeholder:text-[#4A5170] focus:outline-none focus:border-[#FF7A45] focus:ring-2 focus:ring-[#FF7A45]/20 transition-all"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF7A45] to-[#ff8f63] hover:from-[#ff8f63] hover:to-[#FF7A45] text-white font-bold text-sm py-3.5 rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Reset Link <FiArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                    delay: 0.1,
                  }}
                  className="w-16 h-16 rounded-2xl bg-[#34D399]/10 flex items-center justify-center mx-auto mb-6"
                >
                  <FiCheckCircle size={28} className="text-[#34D399]" />
                </motion.div>
                <h1 className="text-xl font-bold text-white mb-2">
                  Check your email
                </h1>
                <p className="text-sm text-[#8891A8] leading-relaxed mb-2">
                  If an account exists for
                </p>
                <p className="text-sm font-semibold text-white mb-4">{email}</p>
                <p className="text-sm text-[#8891A8] leading-relaxed">
                  we've sent a password reset link. It'll expire in 30 minutes,
                  so use it soon.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-[#8891A8] hover:text-white mt-6 transition-colors"
        >
          <FiArrowLeft size={14} />
          Back to log in
        </Link>
      </motion.div>
    </div>
  );
}

function BackgroundDecoration() {
  return (
    <>
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 right-16 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #FF7A45, transparent)" }}
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-16 left-16 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #7B6EF6, transparent)" }}
      />
    </>
  );
}
