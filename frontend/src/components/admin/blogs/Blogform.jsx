"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBlog, updateBlog, getBlogTypes } from "@/lib/Blog_api";
import { getCategories } from "@/lib/Category_api";
import RichTextEditor from "@/components/admin/portfolios/RichTextEditor";
import {
  CountedField,
  ImageUploader,
  SectionCard,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/admin/industry/FormUI";


export default function BlogForm({
  mode = "create",
  blogId = null,
  initialData = null,
}) {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category_id: "",
    is_active: true,
    type: "",
    read_time: "",
    image: "",
    image_alt: "",
    short_description: "",
    description: "",
    meta_title: "",
    meta_keyword: "",
    meta_description: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Dropdowns
  useEffect(() => {
    getCategories({ size: 100, sortDir: "asc" })
      .then((data) =>
        setCategories((data.items || []).filter((c) => c.status === "active"))
      )
      .catch(() => setCategories([]));

    getBlogTypes()
      .then((data) => setTypes(Array.isArray(data) ? data : []))
      .catch(() => setTypes([]));
  }, []);

  // Edit mode prefill
  useEffect(() => {
    if (!initialData) return;
    setForm({
      title: initialData.title || "",
      slug: initialData.slug || "",
      category_id: initialData.category_id ? String(initialData.category_id) : "",
      is_active: initialData.is_active ?? true,
      type: initialData.type || "",
      read_time: initialData.read_time || "",
      image: initialData.image || "",
      image_alt: initialData.image_alt || "",
      short_description: initialData.short_description || "",
      description: initialData.description || "",
      meta_title: initialData.meta_title || "",
      meta_keyword: initialData.meta_keyword || "",
      meta_description: initialData.meta_description || "",
    });
  }, [initialData]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Blog title is required";
    if (!form.slug.trim()) e.slug = "Blog slug is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setApiError("");
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        category_id: form.category_id ? Number(form.category_id) : null,
        is_active: form.is_active,
        type: form.type || null,
        read_time: form.read_time || null,
        image: form.image || null,
        image_alt: form.image_alt || null,
        short_description: form.short_description || null,
        description: form.description || null,
        meta_title: form.meta_title || null,
        meta_keyword: form.meta_keyword || null,
        meta_description: form.meta_description || null,
      };

      if (mode === "edit" && blogId) {
        await updateBlog(blogId, payload);
      } else {
        await createBlog(payload);
      }

      router.push("/dashboard/blogs");
      router.refresh();
    } catch (err) {
      setApiError(err.message || "Failed to save blog");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-gray-900">
          {mode === "edit" ? "Edit Blog" : "Create Blog"}
        </h1>
        <button
          type="button"
          onClick={() => router.push("/dashboard/blogs")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
        >
          <span aria-hidden>←</span> Back to List
        </button>
      </div>

      {apiError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      ) : null}

      {/* Basic info */}
      <SectionCard title="Basic Information">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label="Blog Title"
            required
            error={errors.title}
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
          />
          <TextInput
            label="Blog Slug"
            required
            error={errors.slug}
            hint="Used in the URL, e.g. /blog/my-first-post"
            value={form.slug}
            onChange={(e) => setField("slug", e.target.value)}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <SelectInput
            label="Category"
            value={form.category_id}
            onChange={(e) => setField("category_id", e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectInput>

          <SelectInput
            label="Active"
            value={form.is_active ? "yes" : "no"}
            onChange={(e) => setField("is_active", e.target.value === "yes")}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </SelectInput>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <SelectInput
            label="Type"
            value={form.type}
            onChange={(e) => setField("type", e.target.value)}
          >
            <option value="">Select Type</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectInput>

          <TextInput
            label="Read Time"
            hint="e.g. 5 min read"
            value={form.read_time}
            onChange={(e) => setField("read_time", e.target.value)}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ImageUploader
            label="Image"
            value={form.image}
            onChange={(url) => setField("image", url)}
          />
          <TextInput
            label="Image Alt"
            value={form.image_alt}
            onChange={(e) => setField("image_alt", e.target.value)}
          />
        </div>
      </SectionCard>

      {/* Content */}
      <SectionCard title="Content">
        <TextArea
          label="Short Description"
          rows={3}
          hint="Blog cards / listing par dikhne wala chhota text"
          value={form.short_description}
          onChange={(e) => setField("short_description", e.target.value)}
        />

        <div>
          <p className="mb-1.5 block text-sm font-medium text-gray-800">
            Description
          </p>
          <RichTextEditor
            value={form.description}
            onChange={(html) => setField("description", html)}
          />
        </div>
      </SectionCard>

      {/* SEO */}
      <SectionCard title="SEO Section">
        <CountedField
          label="Meta Title"
          limit={60}
          value={form.meta_title}
          onChange={(v) => setField("meta_title", v)}
        />
        <TextInput
          label="Meta Keywords"
          hint="Separate keywords with commas"
          value={form.meta_keyword}
          onChange={(e) => setField("meta_keyword", e.target.value)}
        />
        <CountedField
          label="Meta Description"
          limit={160}
          textarea
          rows={4}
          value={form.meta_description}
          onChange={(v) => setField("meta_description", v)}
        />
      </SectionCard>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <p className="hidden text-xs text-gray-500 sm:block">
            {mode === "edit" ? "Editing" : "Creating"}: {form.title || "Untitled"}
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={() => router.push("/dashboard/blogs")}
              className="flex-1 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {submitting ? "Saving..." : mode === "edit" ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}