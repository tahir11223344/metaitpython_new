"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFaqPages, createFaq, updateFaq } from "@/lib/faqApi";

/**
 * Reusable Create / Edit FAQ form.
 *
 * Props:
 *   mode        "create" | "edit"
 *   faqId       required when mode === "edit"
 *   initialData { page, question, answer } when editing
 */
export default function FaqForm({ mode = "create", faqId = null, initialData = null }) {
  const router = useRouter();

  const [pages, setPages] = useState([]);
  const [form, setForm] = useState({
    page: initialData?.page || "",
    question: initialData?.question || "",
    answer: initialData?.answer || "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    getFaqPages()
      .then((data) => setPages(Array.isArray(data) ? data : []))
      .catch(() => setPages([]));
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        page: initialData.page || "",
        question: initialData.question || "",
        answer: initialData.answer || "",
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
    if (!form.page) e.page = "Please select a page";
    if (!form.question.trim()) e.question = "Question is required";
    if (!form.answer.trim()) e.answer = "Answer is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        page: form.page,
        question: form.question.trim(),
        answer: form.answer.trim(),
      };

      if (mode === "edit" && faqId) {
        await updateFaq(faqId, payload);
      } else {
        await createFaq(payload);
      }

      router.push("/dashboard/faqs");
      router.refresh();
    } catch (err) {
      setApiError(err.message || "Failed to save FAQ");
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    "w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h1 className="text-lg font-bold text-gray-900">
          {mode === "edit" ? "Edit FAQ" : "Create FAQ"}
        </h1>
        <button
          type="button"
          onClick={() => router.push("/dashboard/faqs")}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
        >
          <span aria-hidden>←</span> Back to FAQ List
        </button>
      </div>

      <div className="space-y-6 px-6 py-6">
        {apiError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        {/* Pages */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Pages <span className="text-red-500">*</span>
          </label>
          <select
            name="page"
            value={form.page}
            onChange={handleChange}
            className={`${inputBase} bg-white ${
              errors.page ? "border-red-400" : "border-gray-300"
            }`}
          >
            <option value="" disabled>
              Select a page
            </option>
            {pages.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.page ? (
            <p className="mt-1 text-xs text-red-500">{errors.page}</p>
          ) : null}
        </div>

        {/* Question */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="question"
            value={form.question}
            onChange={handleChange}
            className={`${inputBase} ${
              errors.question ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.question ? (
            <p className="mt-1 text-xs text-red-500">{errors.question}</p>
          ) : null}
        </div>

        {/* Answer */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Answer <span className="text-red-500">*</span>
          </label>
          <textarea
            name="answer"
            rows={6}
            value={form.answer}
            onChange={handleChange}
            className={`${inputBase} resize-y ${
              errors.answer ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.answer ? (
            <p className="mt-1 text-xs text-red-500">{errors.answer}</p>
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