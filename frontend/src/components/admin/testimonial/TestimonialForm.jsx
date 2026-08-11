"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createTestimonial,
  updateTestimonial,
} from "@/lib/testimonialApi";

/**
 * Reusable Create / Edit Testimonial form.
 *
 * Props:
 *   mode           "create" | "edit"
 *   testimonialId  required when mode === "edit"
 *   initialData    testimonial object when editing
 */
export default function TestimonialForm({
  mode = "create",
  testimonialId = null,
  initialData = null,
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    rating: initialData?.rating ? String(initialData.rating) : "",
    is_active: initialData?.is_active ?? true,
    highlight_percentage: initialData?.highlight_percentage || "",
    highlight_title: initialData?.highlight_title || "",
    short_description: initialData?.short_description || "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        rating: initialData.rating ? String(initialData.rating) : "",
        is_active: initialData.is_active ?? true,
        highlight_percentage: initialData.highlight_percentage || "",
        highlight_title: initialData.highlight_title || "",
        short_description: initialData.short_description || "",
      });
    }
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.rating) e.rating = "Please select a rating";
    if (!form.short_description.trim())
      e.short_description = "Short description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        rating: Number(form.rating),
        is_active: form.is_active,
        highlight_percentage: form.highlight_percentage.trim() || null,
        highlight_title: form.highlight_title.trim() || null,
        short_description: form.short_description.trim(),
      };

      if (mode === "edit" && testimonialId) {
        await updateTestimonial(testimonialId, payload);
      } else {
        await createTestimonial(payload);
      }

      router.push("/dashboard/testimonial");
      router.refresh();
    } catch (err) {
      setApiError(err.message || "Failed to save testimonial");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldBase =
    "w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900">
          {mode === "edit" ? "Edit Testimonial" : "Create Testimonial"}
        </h1>
        <button
          type="button"
          onClick={() => router.push("/dashboard/testimonial")}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
        >
          <span aria-hidden>←</span> Back to List
        </button>
      </div>

      <div className="space-y-6 px-6 py-6">
        {apiError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        {/* Row 1: Rating + Active */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Rating <span className="text-red-500">*</span>
            </label>
            <select
              name="rating"
              value={form.rating}
              onChange={handleChange}
              className={`${fieldBase} bg-white ${
                errors.rating ? "border-red-400" : "border-gray-300"
              }`}
            >
              <option value="" disabled>
                Select Rating
              </option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            {errors.rating ? (
              <p className="mt-1 text-xs text-red-500">{errors.rating}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Active
            </label>
            <select
              name="is_active"
              value={form.is_active ? "yes" : "no"}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_active: e.target.value === "yes" }))
              }
              className={`${fieldBase} border-gray-300 bg-white`}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        {/* Row 2: Highlight Percentage + Highlight Title */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Highlight Percentage
            </label>
            <input
              type="text"
              name="highlight_percentage"
              value={form.highlight_percentage}
              onChange={handleChange}
              placeholder="e.g. 95%"
              className={`${fieldBase} border-gray-300`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Highlight Title
            </label>
            <input
              type="text"
              name="highlight_title"
              value={form.highlight_title}
              onChange={handleChange}
              placeholder="e.g. Client Satisfaction"
              className={`${fieldBase} border-gray-300`}
            />
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Short Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="short_description"
            rows={6}
            value={form.short_description}
            onChange={handleChange}
            className={`${fieldBase} resize-y ${
              errors.short_description ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.short_description ? (
            <p className="mt-1 text-xs text-red-500">{errors.short_description}</p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : mode === "edit" ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}