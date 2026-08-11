"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiZap,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["#FB7185", "#FB7185", "#FBBF24", "#34D399", "#34D399"];

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset link is invalid or missing. Please request a new one.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, new_password: password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0A0E1A] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#FB7185]/10 flex items-center justify-center mx-auto mb-6">
            <FiAlertCircle size={26} className="text-[#FB7185]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            Invalid reset link
          </h1>
          <p className="text-sm text-[#8891A8] mb-6 leading-relaxed">
            This password reset link is missing or malformed. Please request a
            new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF7A45] to-[#ff8f63] text-white text-sm font-semibold px-6 py-3 rounded-lg"
          >
            Request new link
          </Link>
        </motion.div>
      </div>
    );
  }

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
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-2xl font-bold text-white mb-2 text-center">
                  Set a new password
                </h1>
                <p className="text-[#8891A8] text-sm mb-8 text-center">
                  Make sure it's something you'll remember.
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
                  {/* New password */}
                  <div>
                    <label className="block text-sm font-medium text-[#A6ADC4] mb-2">
                      New password
                    </label>
                    <div className="relative">
                      <FiLock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7290]"
                        size={16}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-3 rounded-lg bg-[#0D1220] border border-[#232B45] text-white text-sm placeholder:text-[#4A5170] focus:outline-none focus:border-[#FF7A45] focus:ring-2 focus:ring-[#FF7A45]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7290] hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <FiEyeOff size={16} />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                    </div>

                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3"
                      >
                        <div className="flex gap-1.5 mb-2">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-1 flex-1 rounded-full bg-[#232B45] overflow-hidden"
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: i < strength ? "100%" : "0%",
                                }}
                                transition={{ duration: 0.3 }}
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: strengthColors[strength],
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        <p
                          className="text-xs font-medium mb-2"
                          style={{ color: strengthColors[strength] }}
                        >
                          {strengthLabels[strength]}
                        </p>
                        <div className="space-y-1">
                          {requirements.map((req) => (
                            <div
                              key={req.label}
                              className="flex items-center gap-2 text-xs"
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                  req.met
                                    ? "bg-[#34D399]/20 text-[#34D399]"
                                    : "bg-[#232B45] text-[#4A5170]"
                                }`}
                              >
                                <FiCheck size={9} />
                              </span>
                              <span
                                className={
                                  req.met ? "text-[#8891A8]" : "text-[#4A5170]"
                                }
                              >
                                {req.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-medium text-[#A6ADC4] mb-2">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <FiLock
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7290]"
                        size={16}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0D1220] border border-[#232B45] text-white text-sm placeholder:text-[#4A5170] focus:outline-none focus:border-[#FF7A45] focus:ring-2 focus:ring-[#FF7A45]/20 transition-all"
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-[#FB7185] mt-2">
                        Passwords don't match
                      </p>
                    )}
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
                        Reset Password <FiArrowRight size={16} />
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
                  Password reset successfully
                </h1>
                <p className="text-sm text-[#8891A8] leading-relaxed">
                  Redirecting you to log in…
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!success && (
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-[#8891A8] hover:text-white mt-6 transition-colors"
          >
            Back to log in
          </Link>
        )}
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
        style={{ background: "radial-gradient(circle, #7B6EF6, transparent)" }}
      />
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-16 left-16 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #FF7A45, transparent)" }}
      />
    </>
  );
}
