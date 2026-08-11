"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createTeam, updateTeam, mediaUrl } from "@/lib/Team_api";

/**
 * Reusable Create / Edit Team form.
 *
 * Props:
 *   mode         "create" | "edit"
 *   teamId       required when mode === "edit"
 *   initialData  team object when editing
 */
export default function TeamForm({ mode = "create", teamId = null, initialData = null }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    designation: "",
    sort_order: "0",
    is_active: true,
    email: "",
    phone: "",
    image_alt: "",
    facebook_url: "",
    linkedin_url: "",
    instagram_url: "",
    twitter_url: "",
    bio: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        designation: initialData.designation || "",
        sort_order:
          initialData.sort_order !== undefined && initialData.sort_order !== null
            ? String(initialData.sort_order)
            : "0",
        is_active: initialData.is_active ?? true,
        email: initialData.email || "",
        phone: initialData.phone || "",
        image_alt: initialData.image_alt || "",
        facebook_url: initialData.facebook_url || "",
        linkedin_url: initialData.linkedin_url || "",
        instagram_url: initialData.instagram_url || "",
        twitter_url: initialData.twitter_url || "",
        bio: initialData.bio || "",
      });
    }
  }, [initialData]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.designation.trim()) e.designation = "Designation is required";
    if (form.sort_order === "" || isNaN(Number(form.sort_order))) {
      e.sort_order = "Sort order must be a number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("designation", form.designation.trim());
      fd.append("sort_order", String(Number(form.sort_order) || 0));
      fd.append("is_active", form.is_active ? "true" : "false");
      fd.append("email", form.email.trim());
      fd.append("phone", form.phone.trim());
      fd.append("image_alt", form.image_alt.trim());
      fd.append("facebook_url", form.facebook_url.trim());
      fd.append("linkedin_url", form.linkedin_url.trim());
      fd.append("instagram_url", form.instagram_url.trim());
      fd.append("twitter_url", form.twitter_url.trim());
      fd.append("bio", form.bio.trim());
      if (imageFile) fd.append("profile_image", imageFile);

      if (mode === "edit" && teamId) {
        await updateTeam(teamId, fd);
      } else {
        await createTeam(fd);
      }

      router.push("/dashboard/teams");
      router.refresh();
    } catch (err) {
      setApiError(err.message || "Failed to save team member");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldBase =
    "w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-500/30";
  const fileBase =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-gray-700 hover:file:bg-gray-200";
  const label = "mb-1.5 block text-sm font-medium text-gray-800";

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900">
          {mode === "edit" ? "Edit Team" : "Create Team"}
        </h1>
        <button
          type="button"
          onClick={() => router.push("/dashboard/teams")}
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

        {/* Row 1: Name + Designation */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={label}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className={`${fieldBase} ${errors.name ? "border-red-400" : "border-gray-300"}`}
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            ) : null}
          </div>

          <div>
            <label className={label}>
              Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.designation}
              onChange={(e) => setField("designation", e.target.value)}
              className={`${fieldBase} ${
                errors.designation ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.designation ? (
              <p className="mt-1 text-xs text-red-500">{errors.designation}</p>
            ) : null}
          </div>
        </div>

        {/* Row 2: Sort Order + Active + Email + Phone */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={label}>
              Sort Order <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setField("sort_order", e.target.value)}
              className={`${fieldBase} ${
                errors.sort_order ? "border-red-400" : "border-gray-300"
              }`}
            />
            {errors.sort_order ? (
              <p className="mt-1 text-xs text-red-500">{errors.sort_order}</p>
            ) : null}
          </div>

          <div>
            <label className={label}>
              Active <span className="text-red-500">*</span>
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

          <div>
            <label className={label}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className={`${fieldBase} border-gray-300`}
            />
          </div>

          <div>
            <label className={label}>Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className={`${fieldBase} border-gray-300`}
            />
          </div>
        </div>

        {/* Row 3: Profile Image + Image Alt */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={label}>Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className={fileBase}
            />
            {mode === "edit" && initialData?.profile_image && !imageFile ? (
              <img
                src={mediaUrl(initialData.profile_image)}
                alt="current profile"
                className="mt-2 h-16 w-16 rounded-md border border-gray-200 object-cover"
              />
            ) : null}
          </div>

          <div>
            <label className={label}>Image Alt</label>
            <input
              type="text"
              value={form.image_alt}
              onChange={(e) => setField("image_alt", e.target.value)}
              className={`${fieldBase} border-gray-300`}
            />
          </div>
        </div>

        {/* Row 4: Facebook + LinkedIn */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={label}>Facebook URL</label>
            <input
              type="url"
              value={form.facebook_url}
              onChange={(e) => setField("facebook_url", e.target.value)}
              className={`${fieldBase} border-gray-300`}
            />
          </div>

          <div>
            <label className={label}>LinkedIn URL</label>
            <input
              type="url"
              value={form.linkedin_url}
              onChange={(e) => setField("linkedin_url", e.target.value)}
              className={`${fieldBase} border-gray-300`}
            />
          </div>
        </div>

        {/* Row 5: Instagram + Twitter/X */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className={label}>Instagram URL</label>
            <input
              type="url"
              value={form.instagram_url}
              onChange={(e) => setField("instagram_url", e.target.value)}
              className={`${fieldBase} border-gray-300`}
            />
          </div>

          <div>
            <label className={label}>Twitter/X URL</label>
            <input
              type="url"
              value={form.twitter_url}
              onChange={(e) => setField("twitter_url", e.target.value)}
              className={`${fieldBase} border-gray-300`}
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className={label}>Bio / Short Intro</label>
          <textarea
            rows={5}
            value={form.bio}
            onChange={(e) => setField("bio", e.target.value)}
            placeholder="Short description about this team member..."
            className={`${fieldBase} resize-y border-gray-300`}
          />
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