"use client";

import { useRef, useState } from "react";
import { ChevronDown, Trash2, ArrowUp, ArrowDown, X, Upload } from "lucide-react";
import { uploadImage, mediaUrl } from "@/lib/Industry_api";

/* ------------------------------------------------------------------ */
/* Basic fields                                                        */
/* ------------------------------------------------------------------ */

const inputBase =
  "w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-500/30";

export function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-800">
      {children} {required ? <span className="text-red-500">*</span> : null}
    </label>
  );
}

export function TextInput({ label, required, error, hint, ...props }) {
  return (
    <div>
      {label ? <Label required={required}>{label}</Label> : null}
      <input
        type="text"
        {...props}
        className={`${inputBase} ${error ? "border-red-400" : "border-gray-300"}`}
      />
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
      {!error && hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

export function TextArea({ label, required, error, rows = 4, hint, ...props }) {
  return (
    <div>
      {label ? <Label required={required}>{label}</Label> : null}
      <textarea
        rows={rows}
        {...props}
        className={`${inputBase} resize-y ${
          error ? "border-red-400" : "border-gray-300"
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
      {!error && hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

export function SelectInput({ label, required, children, ...props }) {
  return (
    <div>
      {label ? <Label required={required}>{label}</Label> : null}
      <select {...props} className={`${inputBase} border-gray-300 bg-white`}>
        {children}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Collapsible section card                                            */
/* ------------------------------------------------------------------ */

export function SectionCard({ title, subtitle, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50"
      >
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900">
            {title}
            {badge ? (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                {badge}
              </span>
            ) : null}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
          ) : null}
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? <div className="space-y-5 px-5 py-5">{children}</div> : null}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Repeatable item wrapper (Remove + reorder)                          */
/* ------------------------------------------------------------------ */

export function RepeatItem({
  title,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  children,
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            title="Move up"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 disabled:opacity-40"
          >
            <ArrowUp size={13} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            title="Move down"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100 disabled:opacity-40"
          >
            <ArrowDown size={13} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            title="Remove"
            className="inline-flex items-center gap-1 rounded-md bg-red-500 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

export function AddButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
    >
      <span aria-hidden>＋</span> {children}
    </button>
  );
}

export function EmptyHint({ children }) {
  return (
    <p className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Image uploaders                                                     */
/* File select hote hi upload ho jaati hai, state mein sirf URL jata hai */
/* ------------------------------------------------------------------ */

export function ImageUploader({ label, value, onChange, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    setErr("");
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (ex) {
      setErr(ex.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label ? <Label>{label}</Label> : null}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          <Upload size={14} />
          {busy ? "Uploading..." : value ? "Change Image" : "Choose File"}
        </button>

        {value ? (
          <div className="relative">
            <img
              src={mediaUrl(value)}
              alt="preview"
              className="h-12 w-12 rounded-md border border-gray-200 object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              title="Remove image"
              className="absolute -right-1.5 -top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-400">No file chosen</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      {err ? <p className="mt-1 text-xs text-red-500">{err}</p> : null}
      {!err && hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

export function MultiImageUploader({ label, value = [], onChange, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    setBusy(true);
    setErr("");
    try {
      const urls = [];
      for (const f of files) {
        urls.push(await uploadImage(f)); // ek ek karke, taake error pe pata chale
      }
      onChange([...(value || []), ...urls]);
    } catch (ex) {
      setErr(ex.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function removeAt(i) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      {label ? <Label>{label}</Label> : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
      >
        <Upload size={14} />
        {busy ? "Uploading..." : "Choose Files"}
      </button>

      {value?.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((src, i) => (
            <div key={`${src}-${i}`} className="relative">
              <img
                src={mediaUrl(src)}
                alt={`image ${i + 1}`}
                className="h-16 w-16 rounded-md border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                title="Remove"
                className="absolute -right-1.5 -top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      {err ? <p className="mt-1 text-xs text-red-500">{err}</p> : null}
      {!err && hint ? <p className="mt-1 text-xs text-gray-400">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SEO field with character counter                                    */
/* ------------------------------------------------------------------ */

export function CountedField({
  label,
  value = "",
  onChange,
  limit,
  textarea = false,
  rows = 3,
  placeholder,
}) {
  const len = (value || "").length;
  const over = len > limit;

  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between">
        <Label>{label}</Label>
        <span className={`text-xs ${over ? "text-red-500" : "text-gray-400"}`}>
          {len}/{limit}
        </span>
      </div>
      {textarea ? (
        <textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBase} resize-y ${
            over ? "border-amber-400" : "border-gray-300"
          }`}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputBase} ${over ? "border-amber-400" : "border-gray-300"}`}
        />
      )}
    </div>
  );
}