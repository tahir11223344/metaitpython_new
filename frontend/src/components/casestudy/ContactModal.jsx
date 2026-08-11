"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { submitCaseStudyLead } from "@/lib/caseStudyLeadApi";

const EMPTY = { name: "", email: "", phone: "", location: "" };

/**
 * Gated download modal.
 *
 * Pehle ye seedha `documentUrl` prop se link banata tha — magar wo prop khali
 * aata tha (case study ki document field ka naam match nahi kar raha tha), is
 * liye download kabhi chalta hi nahi tha.
 *
 * Ab: form submit -> backend lead save karta hai AUR document_url wapas bhejta
 * hai -> us URL se download hota hai. Frontend ko field ka naam guess nahi
 * karna parta.
 *
 * Props:
 *   isOpen, onClose
 *   caseStudyId     — kaunsi case study (backend isi se file dhoondta hai)
 *   caseStudyTitle  — modal me dikhane ke liye
 */
export default function ContactModal({ isOpen, onClose, caseStudyId, caseStudyTitle }) {
  const [form, setForm] = useState(EMPTY);
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);

  // 2 second se tez submit = bot
  const openedAt = useRef(Date.now());
  useEffect(() => {
    if (isOpen) {
      openedAt.current = Date.now();
      setForm(EMPTY);
      setHoneypot("");
    }
  }, [isOpen]);

  // Escape se band
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function triggerDownload(url, filename) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "case-study.pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending) return;

    if (!form.name.trim()) return toast.error("Please enter your name.");
    if (!form.email.trim()) return toast.error("Please enter your email.");

    setSending(true);
    try {
      const res = await submitCaseStudyLead({
        ...form,
        case_study_id: caseStudyId ?? null,
        source_page: window.location.pathname,
        website: honeypot,
        elapsed_ms: Date.now() - openedAt.current,
      });

      if (res.document_url) {
        triggerDownload(res.document_url, res.document_name);
        toast.success("Your download is starting.");
      } else {
        // Lead save ho gaya, magar file backend par nahi mili
        toast.error("Thanks! The file isn't available right now — we'll email it to you.");
      }
      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-2xl font-light text-slate-400 transition hover:text-rose-500"
          >
            ×
          </button>

          <h2 className="mb-2 text-2xl font-bold text-slate-900">Your Information</h2>
          {caseStudyTitle && (
            <p className="mb-4 line-clamp-1 text-xs text-slate-500">
              Downloading:{" "}
              <span className="font-semibold text-slate-700">{caseStudyTitle}</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot — insaan ko nazar nahi aata */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="cs-website">Website</label>
              <input
                id="cs-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <input
              type="text"
              placeholder="Name"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full rounded-lg border p-3 text-sm outline-none focus:border-orange-500"
            />
            <input
              type="email"
              placeholder="Email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full rounded-lg border p-3 text-sm outline-none focus:border-orange-500"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="w-full rounded-lg border p-3 text-sm outline-none focus:border-orange-500"
            />
            <input
              type="text"
              placeholder="Location"
              autoComplete="address-level2"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              className="w-full rounded-lg border p-3 text-sm outline-none focus:border-orange-500"
            />

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-orange-500 py-3 font-bold text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Preparing…" : "Download Now"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}