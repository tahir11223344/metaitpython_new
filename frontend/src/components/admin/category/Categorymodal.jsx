"use client";

import { useEffect, useState } from "react";
import { createCategory, updateCategory } from "@/lib/Category_api";

function slugify(v) {
  return (v || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Add / Edit Category modal.
 *
 * Props:
 *   open         boolean — modal visible ya nahi
 *   mode         "create" | "edit"
 *   initialData  category object (edit mode)
 *   onClose      () => void   — X / Cancel / backdrop pe close
 *   onSaved      () => void   — successful save ke baad (list reload karein)
 */
export default function CategoryModal({
  open,
  mode = "create",
  initialData = null,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    status: "active",
    show_on_header: false,
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // reset form jab modal khule ya editing data badle
  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        status: initialData?.status || "active",
        show_on_header: initialData?.show_on_header ?? false,
      });
      setSlugEdited(Boolean(initialData?.slug));
      setErrors({});
      setApiError("");
    }
  }, [open, initialData]);

  // Escape se close
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleNameChange(e) {
    const name = e.target.value;
    setForm((f) => ({
      ...f,
      name,
      // slug auto-generate jab tak user ne khud slug edit na kiya ho
      slug: slugEdited ? f.slug : slugify(name),
    }));
    setErrors((er) => ({ ...er, name: "" }));
  }

  function handleSlugChange(e) {
    setSlugEdited(true);
    setForm((f) => ({ ...f, slug: e.target.value }));
    setErrors((er) => ({ ...er, slug: "" }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug),
        status: form.status,
        show_on_header: form.show_on_header,
      };

      if (mode === "edit" && initialData?.id) {
        await updateCategory(initialData.id, payload);
      } else {
        await createCategory(payload);
      }

      onSaved?.();
    } catch (err) {
      setApiError(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldBase =
    "w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === "edit" ? "Edit Category" : "Add Category"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {apiError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          ) : null}

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={handleNameChange}
              placeholder="Enter Category Name"
              className={`${fieldBase} ${errors.name ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            ) : null}
          </div>

          {/* Slug */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={handleSlugChange}
              placeholder="Enter Category slug"
              className={`${fieldBase} ${errors.slug ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.slug ? (
              <p className="mt-1 text-xs text-red-500">{errors.slug}</p>
            ) : null}
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className={`${fieldBase} border-gray-300 bg-white`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Show on Header */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Show on Header
            </label>
            <select
              value={form.show_on_header ? "yes" : "no"}
              onChange={(e) =>
                setForm((f) => ({ ...f, show_on_header: e.target.value === "yes" }))
              }
              className={`${fieldBase} border-gray-300 bg-white`}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : mode === "edit" ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}