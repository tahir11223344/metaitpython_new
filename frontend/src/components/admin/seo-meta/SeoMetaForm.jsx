





"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PAGE_OPTIONS, API_BASE_URL } from "@/app/(admin)/dashboard/seo-meta/constants";

export default function SeoMetaForm({ mode = "create", initialData = null, id = null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    page_name: initialData?.page_name || "",
    is_active: initialData?.is_active ?? true,
    meta_title: initialData?.meta_title || "",
    meta_keyword: initialData?.meta_keyword || "",
    meta_description: initialData?.meta_description || "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.page_name) newErrors.page_name = "Page Name is required";
    if (!form.meta_title.trim()) newErrors.meta_title = "Meta Title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const url =
        mode === "create"
          ? `${API_BASE_URL}/api/seo-meta/`
          : `${API_BASE_URL}/api/seo-meta/${id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.detail || "Something went wrong");
        return;
      }

      router.push("/dashboard/seo-meta");
    } catch (err) {
      console.error(err);
      alert("Failed to save SEO Meta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">
            {mode === "create" ? "Create Seo Meta" : "Edit Seo Meta"}
          </h1>
          <button
            type="button"
            onClick={() => router.push("/dashboard/seo-meta")}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            ← Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm mb-1">
                Page Name <span className="text-red-500">*</span>
              </label>
              <select
                value={form.page_name}
                onChange={(e) => handleChange("page_name", e.target.value)}
                className={`w-full border rounded-md px-3 py-2 text-sm bg-white ${
                  errors.page_name ? "border-red-400" : "border-gray-200"
                }`}
              >
                <option value="">Select Page</option>
                {PAGE_OPTIONS.map((page) => (
                  <option key={page} value={page}>
                    {page}
                  </option>
                ))}
              </select>
              {errors.page_name && (
                <p className="text-red-500 text-xs mt-1">{errors.page_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">Active</label>
              <select
                value={form.is_active ? "yes" : "no"}
                onChange={(e) =>
                  handleChange("is_active", e.target.value === "yes")
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">
              Meta Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.meta_title}
              onChange={(e) => handleChange("meta_title", e.target.value)}
              className={`w-full border rounded-md px-3 py-2 text-sm ${
                errors.meta_title ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.meta_title && (
              <p className="text-red-500 text-xs mt-1">{errors.meta_title}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Meta Keyword</label>
            <input
              type="text"
              value={form.meta_keyword}
              onChange={(e) => handleChange("meta_keyword", e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm mb-1">Meta Description</label>
            <textarea
              rows={4}
              value={form.meta_description}
              onChange={(e) => handleChange("meta_description", e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2 rounded-md disabled:opacity-60"
            >
              {submitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}