"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveLegalPage } from "@/lib/Legalpage_api";
import RichTextEditor from "@/components/admin/portfolios/RichTextEditor";
import { SectionCard, TextInput } from "@/components/admin/industry/FormUI";


export default function LegalPageForm({ pageType, label, initialData = null }) {
  const router = useRouter();

  const [form, setForm] = useState({
    heading: "",
    subtitle: "",
    content: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!initialData) return;
    setForm({
      heading: initialData.heading || "",
      subtitle: initialData.subtitle || "",
      content: initialData.content || "",
    });
  }, [initialData]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setSaved(false);
  }

  async function handleSubmit() {
    setApiError("");
    setSubmitting(true);
    try {
      await saveLegalPage(pageType, {
        heading: form.heading || null,
        subtitle: form.subtitle || null,
        content: form.content || null,
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setApiError(err.message || "Failed to save page");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{label}</h1>
          <p className="text-xs text-gray-400">/{pageType}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard/legal-pages")}
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

      {saved ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Saved successfully.
        </div>
      ) : null}

      <SectionCard title="Page Content">
        <TextInput
          label="Heading"
          value={form.heading}
          onChange={(e) => setField("heading", e.target.value)}
        />

        <TextInput
          label="Sub Title"
          value={form.subtitle}
          onChange={(e) => setField("subtitle", e.target.value)}
        />

        <div>
          <p className="mb-1.5 block text-sm font-medium text-gray-800">
            Content
          </p>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setField("content", html)}
          />
        </div>
      </SectionCard>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <p className="hidden text-xs text-gray-500 sm:block">
            Editing: {label}
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={() => router.push("/dashboard/legal-pages")}
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
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}