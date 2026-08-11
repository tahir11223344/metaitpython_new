"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createKpiSection, updateKpiSection } from "@/lib/kpi_api";

function initPoints(points) {
  const arr = Array.isArray(points) ? [...points] : [];
  while (arr.length < 3) arr.push(""); // hamesha kam se kam 3 input dikhein
  return arr;
}


export default function KpiSectionForm({
  mode = "create",
  kpiId = null,
  initialData = null,
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    tag: initialData?.tag || "",
    title: initialData?.title || "",
    subtitle: initialData?.subtitle || "",
    points: initPoints(initialData?.points),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        tag: initialData.tag || "",
        title: initialData.title || "",
        subtitle: initialData.subtitle || "",
        points: initPoints(initialData.points),
      });
    }
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
  }

  function handlePointChange(index, value) {
    setForm((f) => {
      const points = [...f.points];
      points[index] = value;
      return { ...f, points };
    });
    setErrors((er) => ({ ...er, points: "" }));
  }

  function validate() {
    const e = {};
    if (!form.tag.trim()) e.tag = "Tag is required";
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.subtitle.trim()) e.subtitle = "Subtitle is required";
    const filled = form.points.filter((p) => p && p.trim());
    if (filled.length === 0) e.points = "At least one point is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        tag: form.tag.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        points: form.points.map((p) => p.trim()).filter(Boolean),
      };

      if (mode === "edit" && kpiId) {
        await updateKpiSection(kpiId, payload);
      } else {
        await createKpiSection(payload);
      }

      router.push("/dashboard/kpi");
      router.refresh();
    } catch (err) {
      setApiError(err.message || "Failed to save KPI section");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldBase =
    "w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="rounded-xl border border-gray-200  shadow-2xl">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900">
          {mode === "edit" ? "Edit KPI Section" : "Create KPI Section"}
        </h1>
        <button
          type="button"
          onClick={() => router.push("/dashboard/kpi")}
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

        {/* Tag */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Tag <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="tag"
            value={form.tag}
            onChange={handleChange}
            className={`${fieldBase} ${errors.tag ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.tag ? <p className="mt-1 text-xs text-red-500">{errors.tag}</p> : null}
        </div>

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className={`${fieldBase} ${errors.title ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.title ? (
            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
          ) : null}
        </div>

        {/* Subtitle */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Subtitle <span className="text-red-500">*</span>
          </label>
          <textarea
            name="subtitle"
            rows={5}
            value={form.subtitle}
            onChange={handleChange}
            className={`${fieldBase} resize-y ${
              errors.subtitle ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.subtitle ? (
            <p className="mt-1 text-xs text-red-500">{errors.subtitle}</p>
          ) : null}
        </div>

        {/* Points */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Points <span className="text-red-500">*</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            {form.points.map((p, i) => (
              <input
                key={i}
                type="text"
                value={p}
                onChange={(e) => handlePointChange(i, e.target.value)}
                placeholder={`Point ${i + 1}`}
                className={`${fieldBase} ${
                  errors.points ? "border-red-400" : "border-gray-300"
                }`}
              />
            ))}
          </div>
          {errors.points ? (
            <p className="mt-1 text-xs text-red-500">{errors.points}</p>
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