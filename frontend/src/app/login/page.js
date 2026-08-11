"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiZap } from "react-icons/fi";

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Login failed");
            }

            localStorage.setItem("token", data.access_token);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/dashboard");
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full max-w-full [overflow-x:clip] flex bg-[#0A0E1A]">
            {/* Left: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-10 py-12 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mb-10">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF7A45] to-[#7B6EF6] flex items-center justify-center">
                            <FiZap className="text-white" size={18} />
                        </div>
                        <span className="text-lg font-bold text-white">
                            Meta IT<span className="text-[#FF7A45]">.</span>
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
                    <p className="text-[#8891A8] text-sm mb-8">
                        Log in to manage your services, blogs, and leads.
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
                        {/* Email */}
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
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#12172A] border border-[#232B45] text-white text-sm placeholder:text-[#4A5170] focus:outline-none focus:border-[#FF7A45] focus:ring-2 focus:ring-[#FF7A45]/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-[#A6ADC4]">
                                    Password
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-[#FF7A45] hover:text-[#ff8f63] transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <FiLock
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7290]"
                                    size={16}
                                />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-11 py-3 rounded-lg bg-[#12172A] border border-[#232B45] text-white text-sm placeholder:text-[#4A5170] focus:outline-none focus:border-[#FF7A45] focus:ring-2 focus:ring-[#FF7A45]/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7290] hover:text-white transition-colors"
                                >
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
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
                                    Log In <FiArrowRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <p className="text-center text-sm text-[#8891A8] mt-8">
                        Don't have an account?{" "}
                        <Link
                            href="/signup"
                            className="text-[#FF7A45] font-semibold hover:text-[#ff8f63] transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right: Brand panel */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#12172A] via-[#0D1220] to-[#0A0E1A]">
                <BrandPanelDecoration />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 flex flex-col justify-center px-14 max-w-lg"
                >
                    <h2 className="text-4xl font-bold text-white leading-tight mb-5">
                        Run your business
                        <br />
                        from one dashboard.
                    </h2>
                    <p className="text-[#A6ADC4] text-base leading-relaxed">
                        Manage services, publish blogs, and track every lead — all in one
                        focused workspace built for the Meta IT team.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

function BrandPanelDecoration() {
    return (
        <>
            <motion.div
                animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-24 w-64 h-64 rounded-full opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, #FF7A45, transparent)" }}
            />
            <motion.div
                animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-24 left-16 w-80 h-80 rounded-full opacity-15 blur-3xl"
                style={{ background: "radial-gradient(circle, #7B6EF6, transparent)" }}
            />
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />
        </>
    );
}