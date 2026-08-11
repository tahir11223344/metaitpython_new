"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaClock,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaCheckCircle,
} from "react-icons/fa";
import { submitContactMessage } from "@/lib/messageApi";
import Turnstile, { captchaEnabled } from "@/components/common/Turnstile";
import toast from "react-hot-toast";

const contactInfo = [
  { icon: FaEnvelope, label: "Email", lines: ["contact@metaitservices.co"] },
  { icon: FaPhoneAlt, label: "Phone", lines: ["+1 (469) 767 8853"] },
  {
    icon: FaMapMarkerAlt,
    label: "Address",
    lines: ["555 N. 5th St, Suite 109, Garland, TX", "75040"],
  },
  { icon: FaClock, label: "Working Hours", lines: ["Mon – Fri, 9am – 6pm"] },
];

const socialLinks = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaTwitter, href: "#", label: "Twitter" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 124 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" },
  }),
};

const softInput =
  "w-full px-4 py-2.5 rounded-md bg-white border-2 border-orange-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-400 transition-colors";
const strongInput =
  "w-full px-4 py-2.5 rounded-md bg-white border-2 border-orange-400 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors";

const EMPTY = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  company_name: "",
  company_url: "",
  message: "",
};

export default function ContactUsSection() {
  const [form, setForm] = useState(EMPTY);
  const [agreed, setAgreed] = useState(false);
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

  // Error dono jagah: banner form ke andar, toast screen par. Banner tab
  // kaam aata hai jab visitor toast miss kar de.
  function fail(message) {
    setError(message);
    toast.error(message);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.first_name.trim()) return fail("Please enter your first name.");
    if (!form.email.trim()) return fail("Please enter your email.");
    if (form.message.trim().length < 10)
      return fail("Please write at least 10 characters about your project.");
    if (!agreed) return fail("Please accept the terms before submitting.");
    if (captchaEnabled && !captchaBroken && !captchaToken)
      return fail("Please complete the verification below.");

    setSending(true);
    try {
      await submitContactMessage({
        ...form,
        consent: agreed,
        source_page: window.location.pathname,
        website: honeypot,
        elapsed_ms: Date.now() - openedAt.current,
        turnstile_token: captchaToken,
      });
      setSent(true);
      setForm(EMPTY);
      setAgreed(false);
      toast.success("Message sent. We'll get back to you within one business day.");
    } catch (err) {
      fail(err.message || "Couldn't send your message. Please try again.");
    } finally {
      setSending(false);
      setCaptchaToken("");
      setCaptchaNonce((n) => n + 1);
    }
  }

  return (
    <section className="w-full max-w-full [overflow-x:clip] bg-slate-700 py-10 sm:py-14 lg:py-16">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          {/* Left: Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -130 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[50%] text-white pt-2 lg:pt-6"
          >
            <p className="text-orange-500 font-bold text-sm mb-2">Get In Touch</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-5">
              Ready To Get Started?
            </h2>
            <p className="font-semibold text-sm sm:text-base mb-2">
              Take the first Step towards Digital Marketing Success
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
              Let&rsquo;s discuss your goals and explore how we can help your business
              grow digitally.
            </p>

            <div className="h-px bg-white/20 mb-8" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7 mb-8">
              {contactInfo.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex items-start gap-3 min-w-0"
                  >
                    <span className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                      <Icon className="text-white text-sm" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-orange-400 font-bold text-sm mb-1">{item.label}</p>
                      {item.lines.map((line, idx) => (
                        <p key={idx} className="text-gray-200 text-sm break-words">
                          {line}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="h-px bg-white/20 mb-6" />

            <div className="flex gap-3">
              {socialLinks.map((social, i) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, backgroundColor: "#f97316" }}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-700 transition-colors"
                  >
                    <Icon className="text-sm" aria-hidden="true" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Form Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-[50%] bg-orange-50 rounded-3xl p-5 sm:p-8 lg:p-10 min-w-0"
          >
            {sent ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <FaCheckCircle className="mb-4 text-5xl text-orange-500" aria-hidden="true" />
                <h3 className="mb-2 text-2xl font-bold text-slate-900">Thanks for reaching out</h3>
                <p className="max-w-sm text-sm leading-relaxed text-slate-600">
                  We&rsquo;ve received your message. Someone from our team will get back to
                  you within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-6 text-sm font-semibold text-orange-600 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="whitespace-pre-line rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                {/* Honeypot — insaan ko nazar nahi aata, bot bhar deta hai */}
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <label htmlFor="cu_first" className="block text-slate-900 text-sm font-semibold mb-2">
                      First Name
                    </label>
                    <input
                      id="cu_first"
                      type="text"
                      required
                      autoComplete="given-name"
                      placeholder="First Name"
                      value={form.first_name}
                      onChange={(e) => set("first_name", e.target.value)}
                      className={softInput}
                    />
                  </motion.div>

                  <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <label htmlFor="cu_last" className="block text-slate-900 text-sm font-semibold mb-2">
                      Last Name
                    </label>
                    <input
                      id="cu_last"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Last Name"
                      value={form.last_name}
                      onChange={(e) => set("last_name", e.target.value)}
                      className={softInput}
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <motion.div custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <label htmlFor="cu_phone" className="block text-slate-900 text-sm font-semibold mb-2">
                      Phone Number
                    </label>
                    <input
                      id="cu_phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className={softInput}
                    />
                  </motion.div>

                  <motion.div custom={3} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <label htmlFor="cu_email" className="block text-slate-900 text-sm font-semibold mb-2">
                      Email
                    </label>
                    <input
                      id="cu_email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="example@company.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={strongInput}
                    />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <motion.div custom={4} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <label htmlFor="cu_company" className="block text-slate-900 text-sm font-semibold mb-2">
                      Company Name
                    </label>
                    <input
                      id="cu_company"
                      type="text"
                      autoComplete="organization"
                      placeholder="Company Name"
                      value={form.company_name}
                      onChange={(e) => set("company_name", e.target.value)}
                      className={softInput}
                    />
                  </motion.div>

                  <motion.div custom={5} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <label htmlFor="cu_url" className="block text-slate-900 text-sm font-semibold mb-2">
                      Company URL
                    </label>
                    <input
                      id="cu_url"
                      type="text"
                      inputMode="url"
                      autoComplete="url"
                      placeholder="https://example.com"
                      value={form.company_url}
                      onChange={(e) => set("company_url", e.target.value)}
                      className={softInput}
                    />
                  </motion.div>
                </div>

                <motion.div custom={6} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <label htmlFor="cu_message" className="block text-slate-900 text-sm font-semibold mb-2">
                    Share Your Vision With Us!
                  </label>
                  <textarea
                    id="cu_message"
                    rows={4}
                    required
                    minLength={10}
                    placeholder="Any Additional Information..."
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    className="w-full px-4 py-3 rounded-md bg-white border-2 border-orange-400 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Feel free to use this space for any additional comments you&rsquo;d like
                    us to consider. If you have a specific service in mind, please let us
                    know!
                  </p>
                </motion.div>

                <motion.label
                  custom={7}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-start gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    required
                    checked={agreed}
                    onChange={() => setAgreed(!agreed)}
                    className="mt-1 w-4 h-4 shrink-0 accent-slate-700 cursor-pointer"
                  />
                  <span className="text-slate-900 text-sm font-semibold leading-relaxed">
                    When you check this box, you agree that you&rsquo;ve read and accepted
                    Meta IT&rsquo;s terms and conditions, disclaimer, privacy policy. You
                    consent to be contacted using the information you provided us.
                  </span>
                </motion.label>

                {/* Verification — site key na ho to kuch render nahi hota */}
                {captchaEnabled && (
                  <motion.div custom={8} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                    <Turnstile
                      onVerify={setCaptchaToken}
                      onExpire={() => setCaptchaToken("")}
                      onFail={() => setCaptchaBroken(true)}
                      resetKey={captchaNonce}
                    />
                    {captchaBroken && (
                      <p className="mt-2 text-xs leading-relaxed text-amber-700">
                        Verification could not load — an ad blocker may be blocking it. You
                        can still submit, or email us at contact@metaitservices.co
                      </p>
                    )}
                  </motion.div>
                )}

                <motion.div custom={9} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileHover={sending ? undefined : { scale: 1.02 }}
                    whileTap={sending ? undefined : { scale: 0.98 }}
                    className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-white font-bold text-sm px-10 py-3.5 rounded-lg transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? "Sending…" : "Submit"}
                  </motion.button>
                </motion.div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}