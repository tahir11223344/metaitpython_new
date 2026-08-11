// src/app/(admin)/dashboard/page.js
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import {
    FiTrendingUp,
    FiTrendingDown,
    FiUsers,
    FiFileText,
    FiBriefcase,
    FiMail,
    FiArrowUpRight,
} from "react-icons/fi";
import {
    AreaChart,
    Area,
    ResponsiveContainer,
    XAxis,
    Tooltip,
} from "recharts";

const statCards = [
    {
        label: "Total Leads",
        value: 1284,
        change: 12.4,
        trend: "up",
        icon: FiMail,
    },
    {
        label: "Published Blogs",
        value: 42,
        change: 4.1,
        trend: "up",
        icon: FiFileText,
    },
    {
        label: "Active Services",
        value: 6,
        change: 0,
        trend: "flat",
        icon: FiBriefcase,
    },
    {
        label: "Team Members",
        value: 18,
        change: -2.3,
        trend: "down",
        icon: FiUsers,
    },
];

const chartData = [
    { day: "Mon", leads: 32 },
    { day: "Tue", leads: 48 },
    { day: "Wed", leads: 40 },
    { day: "Thu", leads: 61 },
    { day: "Fri", leads: 55 },
    { day: "Sat", leads: 74 },
    { day: "Sun", leads: 68 },
];

const recentActivity = [
    {
        id: 1,
        type: "lead",
        title: "New lead from contact form",
        detail: "Sarah Malik — sarah@example.com",
        time: "2 minutes ago",
    },
    {
        id: 2,
        type: "blog",
        title: "Blog post published",
        detail: '"SEO Strategies That Actually Work in 2026"',
        time: "1 hour ago",
    },
    {
        id: 3,
        type: "service",
        title: "Service page updated",
        detail: "Cloud Infrastructure & Migration Strategy",
        time: "5 hours ago",
    },
    {
        id: 4,
        type: "lead",
        title: "New lead from contact form",
        detail: "Ahmed Raza — ahmed@example.com",
        time: "Yesterday",
    },
];

function CountUpNumber({ value }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const controls = animate(0, value, {
            duration: 1.4,
            ease: "easeOut",
            onUpdate: (v) => setDisplay(Math.round(v)),
        });
        return () => controls.stop();
    }, [isInView, value]);

    return <span ref={ref}>{display.toLocaleString()}</span>;
}

export default function DashboardPage() {
    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            whileHover={{ y: -4 }}
                            className="group relative rounded-2xl p-5 bg-[#12172A] border border-[#232B45] overflow-hidden"
                        >
                            {/* Hover gradient border glow */}
                            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{
                                    background:
                                        "linear-gradient(135deg, rgba(255,122,69,0.08), transparent 60%)",
                                }}
                            />

                            <div className="relative flex items-start justify-between mb-4">
                                <span className="w-10 h-10 rounded-xl bg-[#171D33] border border-[#232B45] flex items-center justify-center text-[#FF7A45]">
                                    <Icon size={17} />
                                </span>

                                {stat.trend !== "flat" && (
                                    <span
                                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${stat.trend === "up"
                                            ? "text-[#34D399] bg-[#34D399]/10"
                                            : "text-[#FB7185] bg-[#FB7185]/10"
                                            }`}
                                    >
                                        {stat.trend === "up" ? (
                                            <FiTrendingUp size={12} />
                                        ) : (
                                            <FiTrendingDown size={12} />
                                        )}
                                        {Math.abs(stat.change)}%
                                    </span>
                                )}
                            </div>

                            <p
                                className="relative text-2xl sm:text-3xl font-bold text-white mb-1"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                <CountUpNumber value={stat.value} />
                            </p>
                            <p className="relative text-sm text-[#8891A8]">{stat.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Chart + activity */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="xl:col-span-2 rounded-2xl p-5 sm:p-6 bg-[#12172A] border border-[#232B45]"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2
                                className="text-base sm:text-lg font-bold text-white"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                Leads This Week
                            </h2>
                            <p className="text-xs text-[#6B7290] mt-1">
                                378 total leads across 7 days
                            </p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#34D399] bg-[#34D399]/10 px-2.5 py-1 rounded-md">
                            <FiTrendingUp size={12} />
                            18.2%
                        </span>
                    </div>

                    <div className="h-56 sm:h-64 -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FF7A45" stopOpacity={0.35} />
                                        <stop offset="100%" stopColor="#FF7A45" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6B7290", fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#171D33",
                                        border: "1px solid #232B45",
                                        borderRadius: 10,
                                        fontSize: 12,
                                    }}
                                    labelStyle={{ color: "#A6ADC4" }}
                                    itemStyle={{ color: "#FF7A45" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="leads"
                                    stroke="#FF7A45"
                                    strokeWidth={2.5}
                                    fill="url(#leadGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent activity */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="rounded-2xl p-5 sm:p-6 bg-[#12172A] border border-[#232B45]"
                >
                    <h2
                        className="text-base sm:text-lg font-bold text-white mb-5"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Recent Activity
                    </h2>

                    <div className="space-y-4">
                        {recentActivity.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.35 + i * 0.06 }}
                                className="flex items-start gap-3 group cursor-pointer"
                            >
                                <span
                                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${item.type === "lead"
                                        ? "bg-[#FF7A45]"
                                        : item.type === "blog"
                                            ? "bg-[#7B6EF6]"
                                            : "bg-[#34D399]"
                                        }`}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-white group-hover:text-[#FF7A45] transition-colors truncate">
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-[#8891A8] mt-0.5 truncate">
                                        {item.detail}
                                    </p>
                                    <p className="text-[11px] text-[#6B7290] mt-1">
                                        {item.time}
                                    </p>
                                </div>
                                <FiArrowUpRight
                                    size={14}
                                    className="text-[#6B7290] opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0"
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}