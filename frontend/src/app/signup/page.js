"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FiMail,
    FiLock,
    FiUser,
    FiEye,
    FiEyeOff,
    FiArrowRight,
    FiZap,
    FiCheck,
} from "react-icons/fi";

function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0-4
}

const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const strengthColors = ["#FB7185", "#FB7185", "#FBBF24", "#34D399", "#34D399"];

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const strength = useMemo(
        () => getPasswordStrength(formData.password),
        [formData.password]
    );

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Registration failed");
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

    const requirements = [
        { label: "At least 8 characters", met: formData.password.length >= 8 },
        { label: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
        { label: "One number", met: /[0-9]/.test(formData.password) },
    ];

    return (
        <div className="min-h-screen w-full max-w-full [overflow-x:clip] flex bg-[#0A0E1A]">
            {/* Left: Brand panel */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#12172A] via-[#0D1220] to-[#0A0E1A]">
                <BrandPanelDecoration />
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative z-10 flex flex-col justify-center px-14 max-w-lg"
                >
                    <h2 className="text-4xl font-bold text-white leading-tight mb-5">
                        Join the team
                        <br />
                        behind Meta IT.
                    </h2>
                    <p className="text-[#A6ADC4] text-base leading-relaxed mb-8">
                        Create your account to start managing services, blogs, and leads
                        from a single, focused dashboard.
                    </p>

                    <div className="space-y-3">
                        {["Real-time lead tracking", "One-click blog publishing", "Full team collaboration"].map(
                            (item, i) => (
                                <motion.div
                                    key={item}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <span className="w-5 h-5 rounded-full bg-[#FF7A45]/15 flex items-center justify-center shrink-0">
                                        <FiCheck size={11} className="text-[#FF7A45]" />
                                    </span>
                                    <span className="text-sm text-[#A6ADC4]">{item}</span>
                                </motion.div>
                            )
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-10 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="flex items-center gap-2.5 mb-10">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF7A45] to-[#7B6EF6] flex items-center justify-center">
                            <FiZap className="text-white" size={18} />
                        </div>
                        <span className="text-lg font-bold text-white">
                            Meta IT<span className="text-[#FF7A45]">.</span>
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">
                        Create your account
                    </h1>
                    <p className="text-[#8891A8] text-sm mb-8">
                        Get started managing Meta IT's digital presence.
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
                        {/* Full name */}
                        <div>
                            <label className="block text-sm font-medium text-[#A6ADC4] mb-2">
                                Full name
                            </label>
                            <div className="relative">
                                <FiUser
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7290]"
                                    size={16}
                                />
                                <input
                                    type="text"
                                    name="full_name"
                                    required
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Dilawar Ali"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#12172A] border border-[#232B45] text-white text-sm placeholder:text-[#4A5170] focus:outline-none focus:border-[#FF7A45] focus:ring-2 focus:ring-[#FF7A45]/20 transition-all"
                                />
                            </div>
                        </div>

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
                            <label className="block text-sm font-medium text-[#A6ADC4] mb-2">
                                Password
                            </label>
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

                            {/* Password strength meter */}
                            {formData.password && (
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
                                                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${req.met
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
                                    Create Account <FiArrowRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <p className="text-center text-sm text-[#8891A8] mt-8">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-[#FF7A45] font-semibold hover:text-[#ff8f63] transition-colors"
                        >
                            Log in
                        </Link>
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
                className="absolute top-20 left-24 w-64 h-64 rounded-full opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, #7B6EF6, transparent)" }}
            />
            <motion.div
                animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-24 right-16 w-80 h-80 rounded-full opacity-15 blur-3xl"
                style={{ background: "radial-gradient(circle, #FF7A45, transparent)" }}
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