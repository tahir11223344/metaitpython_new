"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrand, updateBrand } from "@/lib/Brand_api";
import {
  ImageUploader,
  SectionCard,
  SelectInput,
  TextInput,
} from "@/components/admin/industry/FormUI";

/**
 * Create / Edit Brand.
 *
 * NOTE: FormUI aapke industry folder se aa raha hai. Agar aapne wo file kahin aur
 * rakhi hai to upar wala import badal dein.
 *
 * Props:
 *   mode        "create" | "edit"
 *   brandId     required when mode === "edit"
 *   initialData brand object when editing
 */
export default function BrandForm({
  mode = "create",
  brandId = null,
  initialData = null,
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    company_name: "",
    website: "",
    logo: "",
    logo_alt: "",
    sort_order: "0",
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!initialData) return;
    setForm({
      company_name: initialData.company_name || "",
      website: initialData.website || "",
      logo: initialData.logo || "",
      logo_alt: initialData.logo_alt || "",
      sort_order:
        initialData.sort_order !== undefined && initialData.sort_order !== null
          ? String(initialData.sort_order)
          : "0",
      is_active: initialData.is_active ?? true,
    });
  }, [initialData]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.company_name.trim()) e.company_name = "Company name is required";
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
        company_name: form.company_name.trim(),
        website: form.website.trim() || null,
        logo: form.logo || null,
        logo_alt: form.logo_alt || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };

      if (mode === "edit" && brandId) {
        await updateBrand(brandId, payload);
      } else {
        await createBrand(payload);
      }

      router.push("/dashboard/brands");
      router.refresh();
    } catch (err) {
      setApiError(err.message || "Failed to save brand");
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
          {mode === "edit" ? "Edit Brand" : "Create Brand"}
        </h1>
        <button
          type="button"
          onClick={() => router.push("/dashboard/brands")}
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

      <SectionCard title="Brand">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label="Company Name"
            required
            error={errors.company_name}
            value={form.company_name}
            onChange={(e) => setField("company_name", e.target.value)}
          />
          <TextInput
            label="Website"
            hint="https:// khud lag jayega agar na likhein"
            placeholder="example.com"
            value={form.website}
            onChange={(e) => setField("website", e.target.value)}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ImageUploader
            label="Logo"
            hint="Transparent PNG ya SVG best rehta hai"
            value={form.logo}
            onChange={(url) => setField("logo", url)}
          />
          <TextInput
            label="Logo Alt"
            value={form.logo_alt}
            onChange={(e) => setField("logo_alt", e.target.value)}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label="Sort Order"
            type="number"
            hint="Chhota number pehle dikhta hai"
            value={form.sort_order}
            onChange={(e) => setField("sort_order", e.target.value)}
          />
          <SelectInput
            label="Active"
            value={form.is_active ? "yes" : "no"}
            onChange={(e) => setField("is_active", e.target.value === "yes")}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </SelectInput>
        </div>
      </SectionCard>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <p className="hidden text-xs text-gray-500 sm:block">
            {mode === "edit" ? "Editing" : "Creating"}:{" "}
            {form.company_name || "Untitled"}
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={() => router.push("/dashboard/brands")}
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