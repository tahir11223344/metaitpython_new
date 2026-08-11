"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { submitContact } from "@/lib/contactApi";
import Turnstile, { captchaEnabled } from "@/components/common/Turnstile";
import toast from "react-hot-toast";

const subjects = [
  "Crush Inefficiency With Artificial Intelligence and Automation",
  "Data Analytics That Turns Information Into Advantage",
  "Meta IT Advisory And Strategy Services Move Businesses Forward",
  "Meta IT Enterprise Workflow Automation Moves The Fence On Manual Tasks",
  "Meta IT's Software Development Services Are The Future",
  "Scale Without Limits: Meta IT Cloud and DevOps Services",
  "Stand Out With A Top Digital Marketing Agency That Refuses to Blend In",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: "easeOut" },
  }),
};

const inputCls =
  "w-full px-4 py-2.5 rounded-md bg-slate-100 border-2 border-orange-400 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all";

const EMPTY = {
  first_name: "",
  last_name: "",
  email: "",
  phone_code: "+92",
  phone: "",
  has_website: null,
  subjects: [],
  message: "",
};

export default function ContactFormSection() {
  const [form, setForm] = useState(EMPTY);
  const [honeypot, setHoneypot] = useState("");

  const [captchaToken, setCaptchaToken] = useState("");
  // Token single-use hai — har submit ke baad widget reset karna parta hai
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [captchaBroken, setCaptchaBroken] = useState(false);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Form kab render hua — 3 second se tez submit bot ka kaam hota hai
  const openedAt = useRef(Date.now());

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // Error dono jagah: banner form ke andar, toast screen par
  function fail(message) {
    setError(message);
    toast.error(message);
  }

  const toggleSubject = (subject) =>
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.first_name.trim()) return fail("Please enter your name.");
    if (!form.email.trim()) return fail("Please enter your email.");
    if (form.message.trim().length < 10)
      return fail("Please write at least 10 characters in your message.");
    if (captchaEnabled && !captchaBroken && !captchaToken)
      return fail("Please complete the verification below.");

    setSending(true);
    try {
      await submitContact({
        ...form,
        source_page: window.location.pathname,
        website: honeypot,
        elapsed_ms: Date.now() - openedAt.current,
        turnstile_token: captchaToken,
      });
      setSent(true);
      setForm(EMPTY);
      toast.success("Message sent. We'll get back to you within one business day.");
    } catch (err) {
      fail(err.message || "Couldn't send your message. Please try again.");
    } finally {
      setSending(false);
      // Success ho ya fail — token istemal ho chuka, naya lena parega
      setCaptchaToken("");
      setCaptchaNonce((n) => n + 1);
    }
  }

  return (
    <section className="w-full max-w-full overflow-x-hidden bg-white py-10 sm:py-14 lg:py-8">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left: Form Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-2/3 bg-slate-700 rounded-2xl p-5 sm:p-8 lg:p-10 min-w-0"
          >
            {sent ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                <FaCheckCircle className="mb-4 text-5xl text-orange-400" aria-hidden="true" />
                <h3 className="mb-2 text-2xl font-bold text-white">Message sent</h3>
                <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                  Thanks for reaching out. Someone from our team will get back to you
                  within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-6 text-sm font-semibold text-orange-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="whitespace-pre-line rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                {/* Honeypot — insaan ko nazar nahi aata, bot bhar deta hai */}
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="website-url">Website</label>
                  <input
                    id="website-url"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {/* Full Name / Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
                    <label htmlFor="first_name" className="block text-white text-sm font-semibold mb-2">
                      Full Name
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      required
                      autoComplete="given-name"
                      placeholder="Enter your first name"
                      value={form.first_name}
                      onChange={(e) => set("first_name", e.target.value)}
                      className={inputCls}
                    />
                  </motion.div>

                  <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
                    <label htmlFor="last_name" className="block text-white text-sm font-semibold mb-2">
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Enter your last name"
                      value={form.last_name}
                      onChange={(e) => set("last_name", e.target.value)}
                      className={inputCls}
                    />
                  </motion.div>
                </div>

                {/* Email / Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
                    <label htmlFor="email" className="block text-white text-sm font-semibold mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inputCls}
                    />
                  </motion.div>

                  <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3}>
                    <label htmlFor="phone" className="block text-white text-sm font-semibold mb-2">
                      Phone Number
                    </label>
                    <div className="flex w-full rounded-md overflow-hidden bg-white">
                      <select
                        aria-label="Country code"
                        value={form.phone_code}
                        onChange={(e) => set("phone_code", e.target.value)}
                        className="px-2 sm:px-3 text-sm border-r border-slate-200 bg-white text-slate-700 focus:outline-none shrink-0"
                      >
                        <option>+92</option>
                        <option>+1</option>
                        <option>+44</option>
                        <option>+91</option>
                      </select>
                      <input
                        id="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        className="w-full min-w-0 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Do you have website */}
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4}>
                  <p className="text-white text-sm font-semibold mb-3">Do You Have Website?</p>
                  <div className="flex gap-6">
                    {[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ].map((option) => (
                      <label key={option.label} className="flex items-center gap-2 cursor-pointer text-white text-sm">
                        <input
                          type="radio"
                          name="has_website"
                          checked={form.has_website === option.value}
                          onChange={() => set("has_website", option.value)}
                          className="w-4 h-4 accent-orange-400 cursor-pointer"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </motion.div>

                {/* Select subject/service */}
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5}>
                  <p className="text-white text-sm font-semibold mb-3">Select Subject / Service</p>
                  <div className="space-y-2.5">
                    {subjects.map((subject) => (
                      <label key={subject} className="flex items-start gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={form.subjects.includes(subject)}
                          onChange={() => toggleSubject(subject)}
                          className="mt-0.5 w-4 h-4 shrink-0 accent-orange-400 cursor-pointer"
                        />
                        <span className="text-slate-200 text-sm leading-snug group-hover:text-white transition-colors">
                          {subject}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>

                {/* Message */}
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6}>
                  <label htmlFor="message" className="block text-white text-sm font-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={2}
                    required
                    minLength={10}
                    placeholder="Enter your message (minimum 10 characters)"
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    className="w-full px-1 py-2 bg-transparent border-0 border-b-2 border-orange-400 text-sm text-white placeholder:text-slate-300 focus:outline-none focus:border-orange-300 transition-all resize-none"
                  />
                </motion.div>

                {/* Verification — site key na ho to kuch render nahi hota */}
                {captchaEnabled && (
                  <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={7}>
                    <Turnstile
                      onVerify={setCaptchaToken}
                      onExpire={() => setCaptchaToken("")}
                      onFail={() => setCaptchaBroken(true)}
                      resetKey={captchaNonce}
                    />
                    {captchaBroken && (
                      <p className="mt-2 text-xs leading-relaxed text-amber-300">
                        Verification could not load — an ad blocker may be blocking it.
                        You can still submit, or email us at contact@metaitservices.co
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Submit button */}
                <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={8}>
                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileHover={sending ? undefined : { scale: 1.03 }}
                    whileTap={sending ? undefined : { scale: 0.97 }}
                    className="inline-flex items-center gap-3 bg-orange-400 hover:bg-orange-500 text-white font-semibold text-sm px-6 py-3 rounded-lg transition-colors duration-300 group disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? "Sending…" : "Submit"}
                    {!sending && (
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                    )}
                  </motion.button>

                  <p className="mt-3 text-xs text-slate-400">
                    We&rsquo;ll only use your details to reply to this enquiry.
                  </p>
                </motion.div>
              </form>
            )}
          </motion.div>

          {/* Right: Image Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/3 min-w-0"
          >
            <div className="w-full h-64 sm:h-80 lg:h-full rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/contact-handshake.jpg"
                alt="Business partnership handshake"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}