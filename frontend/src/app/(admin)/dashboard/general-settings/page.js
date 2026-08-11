"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import {
  getSiteSettings,
  updateSiteSettings,
  uploadImage,
  mediaUrl,
} from "@/lib/settingsApi";

const EMPTY = {
  site_name: "",
  logo: "",
  favicon: "",
  phone: "",
  email: "",
  whatsapp: "",
  address: "",
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
};

const labelCls = "block text-xs font-medium text-slate-500 mb-1.5";
const inputCls =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Field({ label, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

/** Logo/favicon — file chuno, upload ho, preview dikhe, cross se hatao */
function ImagePicker({ label, value, onChange, previewClass }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      const url = await uploadImage(file);
      if (url) {
        onChange(url);
        toast.success(`${label} uploaded`);
      } else {
        toast.error("Upload didn't return a URL.");
      }
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="shrink-0 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Choose File"}
        </button>
        <span className="truncate text-sm text-slate-400">
          {value ? value.split("/").pop() : "No file chosen"}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {value && (
        <div className="relative mt-3 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mediaUrl(value)} alt={label} className={previewClass} />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={`Remove ${label}`}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow transition hover:bg-rose-600"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function SiteSettingsPage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    (async () => {
      try {
        const data = await getSiteSettings();
        setForm({ ...EMPTY, ...data });
      } catch (err) {
        toast.error(err.message || "Couldn't load settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await updateSiteSettings(form);
      setForm({ ...EMPTY, ...data });
      toast.success("Settings updated");
    } catch (err) {
      toast.error(err.message || "Couldn't save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="px-6 py-12 text-center text-slate-500">Loading settings…</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
      <h2 className="mb-4 text-lg font-bold text-slate-900">
        General Settings
      </h2>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* General */}
        <Card title="General">
          <Field label="Site Name">
            <input
              type="text"
              value={form.site_name}
              onChange={(e) => set("site_name", e.target.value)}
              placeholder="Meta IT Services"
              className={inputCls}
            />
          </Field>

          <ImagePicker
            label="Logo"
            value={form.logo}
            onChange={(url) => set("logo", url)}
            previewClass="h-16 w-auto rounded border border-slate-200 bg-white object-contain p-1"
          />

          <ImagePicker
            label="Favicon"
            value={form.favicon}
            onChange={(url) => set("favicon", url)}
            previewClass="h-10 w-10 rounded border border-slate-200 bg-white object-contain p-1"
          />
        </Card>

        {/* Contact Info */}
        <Card title="Contact Info">
          <Field label="Phone">
            <input
              type="text"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+1 (469) 767 8853"
              className={inputCls}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="contact@metaitservices.co"
              className={inputCls}
            />
          </Field>

          <Field label="WhatsApp">
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="+1 (469) 767 8853"
              className={inputCls}
            />
          </Field>

          <Field label="Address">
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="555 N. 5th St, Suite 109, Garland, TX 75040"
              className={`${inputCls} resize-none`}
            />
          </Field>
        </Card>
      </div>

      {/* Social Links */}
      <div className="mt-5">
        <Card title="Social Links">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Facebook">
              <input
                type="text"
                value={form.facebook}
                onChange={(e) => set("facebook", e.target.value)}
                placeholder="https://facebook.com/…"
                className={inputCls}
              />
            </Field>

            <Field label="Instagram">
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                placeholder="https://instagram.com/…"
                className={inputCls}
              />
            </Field>

            <Field label="Twitter / X">
              <input
                type="text"
                value={form.twitter}
                onChange={(e) => set("twitter", e.target.value)}
                placeholder="https://x.com/…"
                className={inputCls}
              />
            </Field>

            <Field label="LinkedIn">
              <input
                type="text"
                value={form.linkedin}
                onChange={(e) => set("linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/…"
                className={inputCls}
              />
            </Field>
          </div>
        </Card>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Updating…" : "Update"}
        </button>
      </div>
    </form>
  );
}
