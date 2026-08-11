"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createService, updateService, mediaUrl } from "@/lib/serviceApi";

/* ------------------------------------------------------------------ utils */

function slugify(value) {
  return (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyPoint = () => ({ title: "", sub_title: "" });
const emptyFaq = () => ({ question: "", answer: "" });

function blankForm() {
  return {
    title: "",
    slug: "",
    short_description: "",
    thumbnail: null,
    thumbnail_alt: "",
    is_active: true,
    sort_order: 0,
    section_one: { heading: "", image: null, image_alt: "", points: [emptyPoint()] },
    section_two: {
      heading: "",
      description: "",
      image: null,
      image_alt: "",
      points: [emptyPoint()],
    },
    faqs: [emptyFaq()],
    meta_title: "",
    meta_keyword: "",
    meta_description: "",
  };
}

/** API record -> form state. Khali arrays ko ek blank row de dete hain. */
function toFormState(record) {
  if (!record) return blankForm();
  const base = blankForm();
  return {
    ...base,
    ...record,
    section_one: {
      ...base.section_one,
      ...(record.section_one || {}),
      points: record.section_one?.points?.length
        ? record.section_one.points
        : [emptyPoint()],
    },
    section_two: {
      ...base.section_two,
      ...(record.section_two || {}),
      points: record.section_two?.points?.length
        ? record.section_two.points
        : [emptyPoint()],
    },
    faqs: record.faqs?.length ? record.faqs : [emptyFaq()],
  };
}

/* ------------------------------------------------------------------- ui */

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 " +
  "outline-none transition placeholder:text-slate-400 " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const fileCls =
  "w-full cursor-pointer rounded-md border border-slate-300 bg-white text-sm text-slate-500 " +
  "file:mr-3 file:cursor-pointer file:rounded-l-md file:border-0 file:border-r " +
  "file:border-slate-300 file:bg-slate-50 file:px-4 file:py-2.5 file:text-sm " +
  "file:font-medium file:text-slate-700 hover:file:bg-slate-100 " +
  "focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100";

function Label({ children, required }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}

function SectionLabel({ children }) {
  return <h3 className="mb-3 text-base font-semibold text-[#1b3a6b]">{children}</h3>;
}

function AddMoreButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white
                 transition hover:bg-green-600 focus:outline-none focus:ring-2
                 focus:ring-green-300"
    >
      Add More
    </button>
  );
}

function RemoveButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white
                 transition hover:bg-rose-600 focus:outline-none focus:ring-2
                 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      Remove
    </button>
  );
}

/** File picker + mojooda image ka preview. */
function ImageField({ label, existing, file, onPick, onClear }) {
  const inputRef = useRef(null);
  const preview = file ? URL.createObjectURL(file) : mediaUrl(existing);

  useEffect(() => {
    return () => {
      if (file && preview) URL.revokeObjectURL(preview);
    };
  }, [file, preview]);

  return (
    <div>
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={fileCls}
        onChange={(e) => onPick(e.target.files?.[0] || null)}
      />
      {preview && (
        <div className="mt-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="h-14 w-14 rounded border border-slate-200 object-cover"
          />
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              onClear();
            }}
            className="text-sm font-medium text-rose-600 hover:underline"
          >
            Remove image
          </button>
        </div>
      )}
    </div>
  );
}

/** Title + Sub Title rows (Section One aur Section Two dono me same). */
function PointsEditor({ points, onChange }) {
  const update = (i, key, value) =>
    onChange(points.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));

  const remove = (i) =>
    onChange(points.length === 1 ? [emptyPoint()] : points.filter((_, idx) => idx !== i));

  return (
    <div>
      <Label>Points</Label>
      <div className="space-y-3">
        {points.map((point, i) => (
          <div key={i} className="flex items-start gap-3">
            <input
              type="text"
              placeholder="Title"
              className={`${inputCls} flex-1`}
              value={point.title}
              onChange={(e) => update(i, "title", e.target.value)}
            />
            <textarea
              rows={2}
              placeholder="Sub Title"
              className={`${inputCls} flex-1 resize-y`}
              value={point.sub_title}
              onChange={(e) => update(i, "sub_title", e.target.value)}
            />
            <RemoveButton
              onClick={() => remove(i)}
              disabled={points.length === 1 && !point.title && !point.sub_title}
            />
          </div>
        ))}
      </div>
      <div className="mt-3">
        <AddMoreButton onClick={() => onChange([...points, emptyPoint()])} />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- component */

export default function ServiceForm({ initial = null }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState(() => toFormState(initial));
  const [files, setFiles] = useState({ thumb: null, one: null, two: null });
  const [slugTouched, setSlugTouched] = useState(() => Boolean(initial?.slug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initial) {
      setForm(toFormState(initial));
      setSlugTouched(Boolean(initial.slug));
    }
  }, [initial]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const setSection = (which, key, value) =>
    setForm((prev) => ({ ...prev, [which]: { ...prev[which], [key]: value } }));

  // Title likhte waqt slug khud ban jaata hai — jab tak user ne slug haath se na chhua ho
  const onTitleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const updateFaq = (i, key, value) =>
    set(
      "faqs",
      form.faqs.map((f, idx) => (idx === i ? { ...f, [key]: value } : f))
    );

  const removeFaq = (i) =>
    set("faqs", form.faqs.length === 1 ? [emptyFaq()] : form.faqs.filter((_, idx) => idx !== i));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Title zaroori hai.");
    const slug = slugify(form.slug || form.title);
    if (!slug) return setError("Slug zaroori hai (english letters/numbers me).");

    // khali rows submit se pehle nikal do
    const clean = {
      ...form,
      slug,
      section_one: {
        ...form.section_one,
        points: form.section_one.points.filter((p) => p.title.trim() || p.sub_title.trim()),
      },
      section_two: {
        ...form.section_two,
        points: form.section_two.points.filter((p) => p.title.trim() || p.sub_title.trim()),
      },
      faqs: form.faqs.filter((f) => f.question.trim() || f.answer.trim()),
      thumbnailFile: files.thumb,
      sectionOneFile: files.one,
      sectionTwoFile: files.two,
    };

    setSaving(true);
    try {
      if (isEdit) await updateService(initial.id, clean);
      else await createService(clean);

      router.push("/dashboard/services");
      router.refresh();
    } catch (err) {
      setError(err.message || "Save nahi ho saka.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? "Edit Service" : "Create Service"}
          </h2>
          <button
            type="button"
            onClick={() => router.push("/dashboard/services")}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-4 py-2
                       text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            <ChevronLeft size={16} />
            Back to List
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          {error && (
            <div className="whitespace-pre-line rounded-md border border-rose-200 bg-rose-50
                            px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* ---------- basic ---------- */}
          <div>
            <Label required>Title</Label>
            <input
              type="text"
              className={inputCls}
              value={form.title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>

          <div>
            <Label required>Slug</Label>
            <input
              type="text"
              className={inputCls}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
              onBlur={(e) => set("slug", slugify(e.target.value))}
            />
          </div>

          <div>
            <Label>Short Description</Label>
            <textarea
              rows={4}
              className={`${inputCls} resize-y`}
              value={form.short_description}
              onChange={(e) => set("short_description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <ImageField
                label="Thumbnail"
                existing={form.thumbnail}
                file={files.thumb}
                onPick={(f) => setFiles((p) => ({ ...p, thumb: f }))}
                onClear={() => {
                  setFiles((p) => ({ ...p, thumb: null }));
                  set("thumbnail", null);
                }}
              />
            </div>
            <div>
              <Label>Image Alt</Label>
              <input
                type="text"
                className={inputCls}
                value={form.thumbnail_alt}
                onChange={(e) => set("thumbnail_alt", e.target.value)}
              />
            </div>
            <div>
              <Label>Active</Label>
              <select
                className={inputCls}
                value={form.is_active ? "yes" : "no"}
                onChange={(e) => set("is_active", e.target.value === "yes")}
              >
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {/* ---------- engaging content ---------- */}
          <div>
            <SectionLabel>Engaging Content</SectionLabel>

            {/* Section One */}
            <div className="rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 px-5 py-3">
                <h4 className="font-semibold text-slate-900">Section One</h4>
              </div>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <Label>Heading</Label>
                  <input
                    type="text"
                    className={inputCls}
                    value={form.section_one.heading}
                    onChange={(e) => setSection("section_one", "heading", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ImageField
                    label="Image"
                    existing={form.section_one.image}
                    file={files.one}
                    onPick={(f) => setFiles((p) => ({ ...p, one: f }))}
                    onClear={() => {
                      setFiles((p) => ({ ...p, one: null }));
                      setSection("section_one", "image", null);
                    }}
                  />
                  <div>
                    <Label>Image Alt</Label>
                    <input
                      type="text"
                      className={inputCls}
                      value={form.section_one.image_alt}
                      onChange={(e) => setSection("section_one", "image_alt", e.target.value)}
                    />
                  </div>
                </div>

                <PointsEditor
                  points={form.section_one.points}
                  onChange={(pts) => setSection("section_one", "points", pts)}
                />
              </div>
            </div>

            {/* Section Two */}
            <div className="mt-5 rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 px-5 py-3">
                <h4 className="font-semibold text-slate-900">Section Two</h4>
              </div>
              <div className="space-y-4 px-5 py-5">
                <div>
                  <Label>Heading</Label>
                  <input
                    type="text"
                    className={inputCls}
                    value={form.section_two.heading}
                    onChange={(e) => setSection("section_two", "heading", e.target.value)}
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <textarea
                    rows={4}
                    className={`${inputCls} resize-y`}
                    value={form.section_two.description}
                    onChange={(e) => setSection("section_two", "description", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ImageField
                    label="Image"
                    existing={form.section_two.image}
                    file={files.two}
                    onPick={(f) => setFiles((p) => ({ ...p, two: f }))}
                    onClear={() => {
                      setFiles((p) => ({ ...p, two: null }));
                      setSection("section_two", "image", null);
                    }}
                  />
                  <div>
                    <Label>Image Alt</Label>
                    <input
                      type="text"
                      className={inputCls}
                      value={form.section_two.image_alt}
                      onChange={(e) => setSection("section_two", "image_alt", e.target.value)}
                    />
                  </div>
                </div>

                <PointsEditor
                  points={form.section_two.points}
                  onChange={(pts) => setSection("section_two", "points", pts)}
                />
              </div>
            </div>
          </div>

          {/* ---------- faqs ---------- */}
          <div>
            <SectionLabel>FAQs</SectionLabel>
            <div className="space-y-3">
              {form.faqs.map((faq, i) => (
                <div key={i} className="flex items-start gap-3">
                  <input
                    type="text"
                    placeholder="Question"
                    className={`${inputCls} flex-1`}
                    value={faq.question}
                    onChange={(e) => updateFaq(i, "question", e.target.value)}
                  />
                  <textarea
                    rows={2}
                    placeholder="Answer"
                    className={`${inputCls} flex-1 resize-y`}
                    value={faq.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
                  />
                  <RemoveButton
                    onClick={() => removeFaq(i)}
                    disabled={form.faqs.length === 1 && !faq.question && !faq.answer}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <AddMoreButton onClick={() => set("faqs", [...form.faqs, emptyFaq()])} />
            </div>
          </div>

          {/* ---------- seo ---------- */}
          <div>
            <SectionLabel>SEO Section</SectionLabel>
            <div className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <input
                  type="text"
                  className={inputCls}
                  value={form.meta_title}
                  onChange={(e) => set("meta_title", e.target.value)}
                />
              </div>
              <div>
                <Label>Meta Keyword</Label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="keyword one, keyword two"
                  value={form.meta_keyword}
                  onChange={(e) => set("meta_keyword", e.target.value)}
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <textarea
                  rows={5}
                  className={`${inputCls} resize-y`}
                  value={form.meta_description}
                  onChange={(e) => set("meta_description", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ---------- submit ---------- */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white
                         transition hover:bg-blue-700 focus:outline-none focus:ring-2
                         focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}