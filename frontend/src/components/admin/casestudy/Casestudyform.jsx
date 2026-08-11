"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, X } from "lucide-react";
import {
  createCaseStudy,
  updateCaseStudy,
  uploadFile,
  mediaUrl,
} from "@/lib/Casestudy_api";
import RichTextEditor from "@/components/admin/portfolios/RichTextEditor";
import {
  ImageUploader,
  SectionCard,
  SelectInput,
  TextInput,
} from "@/components/admin/industry/FormUI";

/* ------------------------------------------------------------------ */
/* Document uploader (PDF/DOC/XLS...) — /media/file pe upload karta hai */
/* ------------------------------------------------------------------ */
function DocumentUploader({ value, name, onChange }) {
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
      const data = await uploadFile(file);
      onChange({ url: data.url, name: data.name });
    } catch (ex) {
      setErr(ex.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-800">
        Document
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          <Upload size={14} />
          {busy ? "Uploading..." : value ? "Change Document" : "Choose File"}
        </button>

        {value ? (
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <FileText size={15} className="shrink-0 text-gray-500" />
            <a
              href={mediaUrl(value)}
              target="_blank"
              rel="noopener noreferrer"
              className="max-w-[220px] truncate text-sm text-blue-600 hover:underline"
            >
              {name || "Document"}
            </a>
            <button
              type="button"
              onClick={() => onChange({ url: "", name: "" })}
              title="Remove document"
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
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
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
        onChange={handleFile}
        className="hidden"
      />
      {err ? <p className="mt-1 text-xs text-red-500">{err}</p> : null}
      <p className="mt-1 text-xs text-gray-400">
        PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV or ZIP
      </p>
    </div>
  );
}

/**
 * Create / Edit Case Study.
 *
 * NOTE — imports: RichTextEditor aur FormUI aapke maujooda folders se aa rahe hain.
 * Agar aap unhe kahin aur le jayein to upar ke 2 imports badal dein.
 */
export default function CaseStudyForm({
  mode = "create",
  caseStudyId = null,
  initialData = null,
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    image_alt: "",
    document: "",
    document_name: "",
    description: "",
    is_active: true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!initialData) return;
    setForm({
      title: initialData.title || "",
      subtitle: initialData.subtitle || "",
      image: initialData.image || "",
      image_alt: initialData.image_alt || "",
      document: initialData.document || "",
      document_name: initialData.document_name || "",
      description: initialData.description || "",
      is_active: initialData.is_active ?? true,
    });
  }, [initialData]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
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
        subtitle: form.subtitle || null,
        image: form.image || null,
        image_alt: form.image_alt || null,
        document: form.document || null,
        document_name: form.document_name || null,
        description: form.description || null,
        is_active: form.is_active,
      };

      if (mode === "edit" && caseStudyId) {
        await updateCaseStudy(caseStudyId, payload);
      } else {
        await createCaseStudy(payload);
      }

      router.push("/dashboard/case-studies");
      router.refresh();
    } catch (err) {
      setApiError(err.message || "Failed to save case study");
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
          {mode === "edit" ? "Edit Case Study" : "Create Case Study"}
        </h1>
        <button
          type="button"
          onClick={() => router.push("/dashboard/case-studies")}
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

      <SectionCard title="Case Study">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label="Title"
            required
            error={errors.title}
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
          />
          <TextInput
            label="Sub Title"
            value={form.subtitle}
            onChange={(e) => setField("subtitle", e.target.value)}
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

        <div className="grid gap-5 md:grid-cols-2">
          <DocumentUploader
            value={form.document}
            name={form.document_name}
            onChange={({ url, name }) =>
              setForm((f) => ({ ...f, document: url, document_name: name }))
            }
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

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <p className="hidden text-xs text-gray-500 sm:block">
            {mode === "edit" ? "Editing" : "Creating"}: {form.title || "Untitled"}
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={() => router.push("/dashboard/case-studies")}
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