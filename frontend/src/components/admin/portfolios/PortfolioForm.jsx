"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPortfolio,
  updatePortfolio,
  mediaUrl,
} from "@/lib/portfolio_Api";
import { getCategories } from "@/lib/Category_api";
import RichTextEditor from "./RichTextEditor";

function slugify(v) {
  return (v || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PortfolioForm({
  mode = "create",
  portfolioId = null,
  initialData = null,
}) {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_id: "",
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    image_alt: "",
    is_active: true,
    show_on_landing: false,
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Categories dropdown (active only)
  useEffect(() => {
    getCategories({ size: 100, sortDir: "asc" })
      .then((data) => {
        const active = (data.items || []).filter((c) => c.status === "active");
        setCategories(active);
      })
      .catch(() => setCategories([]));
  }, []);

  // Edit mode: form prefill
  useEffect(() => {
    if (initialData) {
      setForm({
        category_id: initialData.category_id ? String(initialData.category_id) : "",
        title: initialData.title || "",
        slug: initialData.slug || "",
        subtitle: initialData.subtitle || "",
        description: initialData.description || "",
        image_alt: initialData.image_alt || "",
        is_active: initialData.is_active ?? true,
        show_on_landing: initialData.show_on_landing ?? false,
      });
      setSlugEdited(Boolean(initialData.slug));
    }
  }, [initialData]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
  }

  function handleTitleChange(e) {
    const title = e.target.value;
    setForm((f) => ({ ...f, title, slug: slugEdited ? f.slug : slugify(title) }));
    setErrors((er) => ({ ...er, title: "" }));
  }

  function validate() {
    const e = {};
    if (!form.category_id) e.category_id = "Category is required";
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("category_id", form.category_id);
      fd.append("title", form.title.trim());
      fd.append("slug", slugify(form.slug));
      fd.append("subtitle", form.subtitle || "");
      fd.append("description", form.description || "");
      fd.append("image_alt", form.image_alt || "");
      fd.append("is_active", form.is_active ? "true" : "false");
      fd.append("show_on_landing", form.show_on_landing ? "true" : "false");
      if (thumbnailFile) fd.append("thumbnail", thumbnailFile);
      galleryFiles.forEach((file) => fd.append("gallery_images", file));

      if (mode === "edit" && portfolioId) {
        await updatePortfolio(portfolioId, fd);
      } else {
        await createPortfolio(fd);
      }

      router.push("/dashboard/portfolios");
      router.refresh();
    } catch (err) {
      setApiError(err.message || "Failed to save portfolio");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldBase =
    "w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-500/30";
  const fileBase =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-gray-700 hover:file:bg-gray-200";

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900">
          {mode === "edit" ? "Edit Portfolio" : "Create Portfolio"}
        </h1>
        <button
          type="button"
          onClick={() => router.push("/dashboard/portfolios")}
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

        {/* Row: Category + Title */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setField("category_id", e.target.value)}
              className={`${fieldBase} bg-white ${
                errors.category_id ? "border-red-400" : "border-gray-300"
              }`}
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id ? (
              <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={handleTitleChange}
              className={`${fieldBase} ${errors.title ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.title ? (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            ) : null}
          </div>
        </div>

        {/* Row: Slug + Sub Title */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                setField("slug", e.target.value);
              }}
              className={`${fieldBase} ${errors.slug ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.slug ? (
              <p className="mt-1 text-xs text-red-500">{errors.slug}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Sub Title
            </label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setField("subtitle", e.target.value)}
              className={`${fieldBase} border-gray-300`}
            />
          </div>
        </div>

        {/* Description (rich text) */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Description
          </label>
          <RichTextEditor
            value={form.description}
            onChange={(html) => setField("description", html)}
          />
        </div>

        {/* Row: Thumbnail + Gallery */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className={fileBase}
            />
            {mode === "edit" && initialData?.thumbnail && !thumbnailFile ? (
              <img
                src={mediaUrl(initialData.thumbnail)}
                alt="current thumbnail"
                className="mt-2 h-16 w-16 rounded-md border border-gray-200 object-cover"
              />
            ) : null}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Gallery Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
              className={fileBase}
            />
            {mode === "edit" &&
            initialData?.gallery_images?.length &&
            galleryFiles.length === 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {initialData.gallery_images.map((src, i) => (
                  <img
                    key={i}
                    src={mediaUrl(src)}
                    alt={`gallery ${i + 1}`}
                    className="h-16 w-16 rounded-md border border-gray-200 object-cover"
                  />
                ))}
              </div>
            ) : null}
            {mode === "edit" ? (
              <p className="mt-1 text-xs text-gray-400">
                Nayi files chunne par purani gallery replace ho jayegi.
              </p>
            ) : null}
          </div>
        </div>

        {/* Row: Image Alt + Active */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Image Alt
            </label>
            <input
              type="text"
              value={form.image_alt}
              onChange={(e) => setField("image_alt", e.target.value)}
              className={`${fieldBase} border-gray-300`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Active
            </label>
            <select
              value={form.is_active ? "yes" : "no"}
              onChange={(e) => setField("is_active", e.target.value === "yes")}
              className={`${fieldBase} border-gray-300 bg-white`}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        {/* Show on Landing Page */}
        <div className="md:w-1/2 md:pr-3">
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Show on Landing Page
          </label>
          <select
            value={form.show_on_landing ? "yes" : "no"}
            onChange={(e) => setField("show_on_landing", e.target.value === "yes")}
            className={`${fieldBase} border-gray-300 bg-white`}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
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