"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { getServices } from "@/lib/serviceApi";
import { createSubService, updateSubService, mediaUrl } from "@/lib/subServiceApi";

/* ------------------------------------------------------------------ utils */

function slugify(value) {
  return (value || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyStep = () => ({ title: "", description: "" });
const emptyCommitment = () => ({ image: null, title: "", sub_title: "", _file: null });
const emptyWhyChoose = () => ({ strong_text: "", description: "" });
const emptyFaq = () => ({ question: "", answer: "" });

function blankForm() {
  return {
    service_id: "",
    title: "",
    slug: "",
    short_description: "",
    icon: null,
    is_active: true,
    show_on_services_page: false,
    show_on_landing_page: false,
    sort_order: 0,
    main_points: [""],
    hero_section: { heading: "", short_description: "" },
    campaign_section: { title: "", points: [""] },
    development_process: { title: "", steps: [emptyStep()] },
    commitments_section: { title: "", description: "", points: [emptyCommitment()] },
    why_choose_section: { title: "", points: [emptyWhyChoose()] },
    faqs: [emptyFaq()],
    meta_title: "",
    meta_keyword: "",
    meta_description: "",
  };
}

function toFormState(record) {
  if (!record) return blankForm();
  const base = blankForm();
  return {
    ...base,
    ...record,
    service_id: record.service_id ?? "",
    main_points: record.main_points?.length ? record.main_points : [""],
    hero_section: { ...base.hero_section, ...(record.hero_section || {}) },
    campaign_section: {
      ...base.campaign_section,
      ...(record.campaign_section || {}),
      points: record.campaign_section?.points?.length
        ? record.campaign_section.points
        : [""],
    },
    development_process: {
      ...base.development_process,
      ...(record.development_process || {}),
      steps: record.development_process?.steps?.length
        ? record.development_process.steps
        : [emptyStep()],
    },
    commitments_section: {
      ...base.commitments_section,
      ...(record.commitments_section || {}),
      points: record.commitments_section?.points?.length
        ? record.commitments_section.points.map((p) => ({ ...p, _file: null }))
        : [emptyCommitment()],
    },
    why_choose_section: {
      ...base.why_choose_section,
      ...(record.why_choose_section || {}),
      points: record.why_choose_section?.points?.length
        ? record.why_choose_section.points
        : [emptyWhyChoose()],
    },
    faqs: record.faqs?.length ? record.faqs : [emptyFaq()],
  };
}

/* --------------------------------------------------------------------- ui */

const inputCls =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 " +
  "outline-none transition placeholder:text-slate-400 " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const fileCls =
  "w-full cursor-pointer rounded-md border border-slate-300 bg-white text-sm text-slate-500 " +
  "file:mr-3 file:cursor-pointer file:rounded-l-md file:border-0 file:border-r " +
  "file:border-slate-300 file:bg-slate-50 file:px-4 file:py-2.5 file:text-sm " +
  "file:font-medium file:text-slate-700 hover:file:bg-slate-100";

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

function Card({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200">
      <div className="border-b border-slate-200 px-5 py-3">
        <h4 className="font-semibold text-slate-900">{title}</h4>
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
    </div>
  );
}

function AddButton({ onClick, children = "Add More" }) {
  return (
    <button type="button" onClick={onClick} className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600">
      {children}
    </button>
  );
}

function RemoveButton({ onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="shrink-0 rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40">
      Remove
    </button>
  );
}

function TrashButton({ onClick, disabled, label }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className="shrink-0 rounded-md bg-rose-500 px-3 py-2 text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-40">
      <Trash2 size={16} />
    </button>
  );
}

/** Simple list of strings — Main Points aur Campaign Points ke liye. */
function StringListEditor({ label, placeholder, items, onChange, addLabel }) {
  const update = (i, value) => onChange(items.map((v, idx) => (idx === i ? value : v)));
  const remove = (i) =>
    onChange(items.length === 1 ? [""] : items.filter((_, idx) => idx !== i));

  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-3">
        {items.map((value, i) => (
          <div key={i} className="flex items-center gap-3">
            <input type="text" placeholder={placeholder} className={inputCls} value={value} onChange={(e) => update(i, e.target.value)} />
            <TrashButton onClick={() => remove(i)} disabled={items.length === 1 && !value} label={`Remove ${label} ${i + 1}`} />
          </div>
        ))}
      </div>
      <div className="mt-3">
        <AddButton onClick={() => onChange([...items, ""])}>{addLabel}</AddButton>
      </div>
    </div>
  );
}

function ImageField({ label, existing, file, onPick, onClear, compact }) {
  const inputRef = useRef(null);
  const preview = file ? URL.createObjectURL(file) : mediaUrl(existing);

  useEffect(() => {
    return () => {
      if (file && preview) URL.revokeObjectURL(preview);
    };
  }, [file, preview]);

  return (
    <div>
      {label && <Label>{label}</Label>}
      <input ref={inputRef} type="file" accept="image/*" className={fileCls} onChange={(e) => onPick(e.target.files?.[0] || null)} />
      {preview && (
        <div className={compact ? "mt-2 flex items-center gap-2" : "mt-2 flex items-center gap-3"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="h-10 w-10 rounded border border-slate-200 object-cover" />
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              onClear();
            }}
            className="text-xs font-medium text-rose-600 hover:underline"
          >
            Remove image
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- component */

export default function SubServiceForm({ initial = null }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState(() => toFormState(initial));
  const [iconFile, setIconFile] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesError, setServicesError] = useState("");
  const [slugTouched, setSlugTouched] = useState(() => Boolean(initial?.slug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Select Service dropdown — services module se seedha aata hai
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getServices({ perPage: 100 });
        if (!cancelled) setServices(data.items || []);
      } catch (err) {
        if (!cancelled) setServicesError(err.message || "Couldn't load services.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (initial) {
      setForm(toFormState(initial));
      setSlugTouched(Boolean(initial.slug));
    }
  }, [initial]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setIn = (section, key, value) =>
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));

  const onTitleChange = (value) =>
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));

  /* ---- repeatable rows ---- */

  const steps = form.development_process.steps;
  const commitments = form.commitments_section.points;
  const whyPoints = form.why_choose_section.points;

  const updateRow = (section, key, list, i, field, value) =>
    setIn(section, key, list.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

  const removeRow = (section, key, list, i, blank) =>
    setIn(section, key, list.length === 1 ? [blank()] : list.filter((_, idx) => idx !== i));

  const updateFaq = (i, field, value) =>
    set("faqs", form.faqs.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)));

  const removeFaq = (i) =>
    set("faqs", form.faqs.length === 1 ? [emptyFaq()] : form.faqs.filter((_, idx) => idx !== i));

  /* ---- submit ---- */

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.service_id) return setError("Please select a service.");
    if (!form.title.trim()) return setError("Title is required.");

    const slug = slugify(form.slug || form.title);
    if (!slug) return setError("Slug is required. Use letters, numbers and dashes.");

    const clean = {
      ...form,
      service_id: Number(form.service_id),
      slug,
      main_points: form.main_points.filter((p) => p.trim()),
      campaign_section: {
        ...form.campaign_section,
        points: form.campaign_section.points.filter((p) => p.trim()),
      },
      development_process: {
        ...form.development_process,
        steps: steps.filter((s) => s.title.trim() || s.description.trim()),
      },
      commitments_section: {
        ...form.commitments_section,
        points: commitments.filter((p) => p.title.trim() || p.sub_title.trim() || p._file),
      },
      why_choose_section: {
        ...form.why_choose_section,
        points: whyPoints.filter((p) => p.strong_text.trim() || p.description.trim()),
      },
      faqs: form.faqs.filter((f) => f.question.trim() || f.answer.trim()),
      iconFile,
    };

    setSaving(true);
    try {
      if (isEdit) await updateSubService(initial.id, clean);
      else await createSubService(clean);

      router.push("/dashboard/sub-services");
      router.refresh();
    } catch (err) {
      setError(err.message || "Couldn't save this sub-service.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? "Edit Sub Service" : "Create Sub Service"}
          </h2>
          <button type="button" onClick={() => router.push("/dashboard/sub-services")} className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200">
            <ChevronLeft size={16} />
            Back to List
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          {error && (
            <div className="whitespace-pre-line rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* ---------- basic ---------- */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label required>Service</Label>
              <select className={inputCls} value={form.service_id} onChange={(e) => set("service_id", e.target.value)}>
                <option value="">Select Service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
              {servicesError && <p className="mt-1 text-xs text-rose-600">{servicesError}</p>}
              {!servicesError && services.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">No services yet. Create a service first.</p>
              )}
            </div>

            <div>
              <Label required>Title</Label>
              <input type="text" className={inputCls} value={form.title} onChange={(e) => onTitleChange(e.target.value)} />
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
              <textarea rows={2} className={`${inputCls} resize-y`} value={form.short_description} onChange={(e) => set("short_description", e.target.value)} />
            </div>

            <ImageField
              label="Icon"
              existing={form.icon}
              file={iconFile}
              onPick={setIconFile}
              onClear={() => {
                setIconFile(null);
                set("icon", null);
              }}
            />

            <div>
              <Label>Active</Label>
              <select className={inputCls} value={form.is_active ? "yes" : "no"} onChange={(e) => set("is_active", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <Label>Show on Services Page</Label>
              <select className={inputCls} value={form.show_on_services_page ? "yes" : "no"} onChange={(e) => set("show_on_services_page", e.target.value === "yes")}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <Label>Show on Landing Page</Label>
              <select className={inputCls} value={form.show_on_landing_page ? "yes" : "no"} onChange={(e) => set("show_on_landing_page", e.target.value === "yes")}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>

          <StringListEditor label="Main Points" placeholder="Enter main point" items={form.main_points} onChange={(v) => set("main_points", v)} />

          {/* ---------- page content ---------- */}
          <div>
            <SectionLabel>Page Content</SectionLabel>

            <div className="space-y-5">
              <Card title="Hero Section">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Main Heading</Label>
                    <input type="text" className={inputCls} value={form.hero_section.heading} onChange={(e) => setIn("hero_section", "heading", e.target.value)} />
                  </div>
                  <div>
                    <Label>Short Description</Label>
                    <textarea rows={3} className={`${inputCls} resize-y`} value={form.hero_section.short_description} onChange={(e) => setIn("hero_section", "short_description", e.target.value)} />
                  </div>
                </div>
              </Card>

              <Card title="Campaign Section">
                <div>
                  <Label>Title</Label>
                  <input type="text" className={inputCls} value={form.campaign_section.title} onChange={(e) => setIn("campaign_section", "title", e.target.value)} />
                </div>
                <StringListEditor label="Points" placeholder="Enter campaign point" items={form.campaign_section.points} onChange={(v) => setIn("campaign_section", "points", v)} />
              </Card>

              <Card title="Development Process">
                <div>
                  <Label>Title</Label>
                  <input type="text" className={inputCls} value={form.development_process.title} onChange={(e) => setIn("development_process", "title", e.target.value)} />
                </div>

                <div>
                  <Label>Steps</Label>
                  <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                    {steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <input type="text" placeholder="Step Title" className={`${inputCls} flex-1`} value={step.title} onChange={(e) => updateRow("development_process", "steps", steps, i, "title", e.target.value)} />
                        <textarea rows={2} placeholder="Step Description" className={`${inputCls} flex-1 resize-y`} value={step.description} onChange={(e) => updateRow("development_process", "steps", steps, i, "description", e.target.value)} />
                        <RemoveButton onClick={() => removeRow("development_process", "steps", steps, i, emptyStep)} disabled={steps.length === 1 && !step.title && !step.description} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <AddButton onClick={() => setIn("development_process", "steps", [...steps, emptyStep()])}>
                      Add More Step
                    </AddButton>
                  </div>
                </div>
              </Card>

              <Card title="Commitments Section">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>Title</Label>
                    <input type="text" className={inputCls} value={form.commitments_section.title} onChange={(e) => setIn("commitments_section", "title", e.target.value)} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <textarea rows={3} className={`${inputCls} resize-y`} value={form.commitments_section.description} onChange={(e) => setIn("commitments_section", "description", e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>Points</Label>
                  <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                    {commitments.map((point, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-56 shrink-0">
                          <ImageField
                            existing={point.image}
                            file={point._file}
                            onPick={(f) => updateRow("commitments_section", "points", commitments, i, "_file", f)}
                            onClear={() => {
                              updateRow("commitments_section", "points", commitments, i, "_file", null);
                              setIn("commitments_section", "points", commitments.map((p, idx) => (idx === i ? { ...p, image: null, _file: null } : p)));
                            }}
                            compact
                          />
                        </div>
                        <input type="text" placeholder="Title" className={`${inputCls} flex-1`} value={point.title} onChange={(e) => updateRow("commitments_section", "points", commitments, i, "title", e.target.value)} />
                        <textarea rows={2} placeholder="Sub Title" className={`${inputCls} flex-1 resize-y`} value={point.sub_title} onChange={(e) => updateRow("commitments_section", "points", commitments, i, "sub_title", e.target.value)} />
                        <RemoveButton onClick={() => removeRow("commitments_section", "points", commitments, i, emptyCommitment)} disabled={commitments.length === 1 && !point.title && !point.sub_title && !point._file} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <AddButton onClick={() => setIn("commitments_section", "points", [...commitments, emptyCommitment()])}>
                      Add More Point
                    </AddButton>
                  </div>
                </div>
              </Card>

              <Card title="Why Choose Section">
                <div>
                  <Label>Title</Label>
                  <input type="text" className={inputCls} value={form.why_choose_section.title} onChange={(e) => setIn("why_choose_section", "title", e.target.value)} />
                </div>

                <div>
                  <Label>Points</Label>
                  <div className="space-y-3">
                    {whyPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <input type="text" placeholder="Strong Text" className={`${inputCls} flex-1`} value={point.strong_text} onChange={(e) => updateRow("why_choose_section", "points", whyPoints, i, "strong_text", e.target.value)} />
                        <textarea rows={2} placeholder="Description" className={`${inputCls} flex-1 resize-y`} value={point.description} onChange={(e) => updateRow("why_choose_section", "points", whyPoints, i, "description", e.target.value)} />
                        <RemoveButton onClick={() => removeRow("why_choose_section", "points", whyPoints, i, emptyWhyChoose)} disabled={whyPoints.length === 1 && !point.strong_text && !point.description} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <AddButton onClick={() => setIn("why_choose_section", "points", [...whyPoints, emptyWhyChoose()])}>
                      Add More Point
                    </AddButton>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* ---------- faqs ---------- */}
          <div>
            <SectionLabel>FAQs</SectionLabel>
            <div className="space-y-3">
              {form.faqs.map((faq, i) => (
                <div key={i} className="flex items-start gap-3">
                  <input type="text" placeholder="Question" className={`${inputCls} flex-1`} value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} />
                  <textarea rows={2} placeholder="Answer" className={`${inputCls} flex-1 resize-y`} value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} />
                  <RemoveButton onClick={() => removeFaq(i)} disabled={form.faqs.length === 1 && !faq.question && !faq.answer} />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <AddButton onClick={() => set("faqs", [...form.faqs, emptyFaq()])} />
            </div>
          </div>

          {/* ---------- seo ---------- */}
          <div>
            <SectionLabel>SEO Section</SectionLabel>
            <div className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <input type="text" className={inputCls} value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} />
              </div>
              <div>
                <Label>Meta Keyword</Label>
                <input type="text" className={inputCls} placeholder="keyword one, keyword two" value={form.meta_keyword} onChange={(e) => set("meta_keyword", e.target.value)} />
              </div>
              <div>
                <Label>Meta Description</Label>
                <textarea rows={5} className={`${inputCls} resize-y`} value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? "Saving…" : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}