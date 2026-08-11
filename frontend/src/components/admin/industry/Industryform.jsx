"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createIndustry, updateIndustry } from "@/lib/Industry_api";
import RichTextEditor from "@/components/admin/portfolios/RichTextEditor";
import {
  AddButton,
  CountedField,
  EmptyHint,
  ImageUploader,
  MultiImageUploader,
  RepeatItem,
  SectionCard,
  SelectInput,
  TextArea,
  TextInput,
} from "@/components/admin/industry/FormUI";

const emptySortable = () => ({ title: "", content: "", sort_order: 0 });

const emptySlide = () => ({
  title: "",
  excerpt: "",
  description: "",
  image: "",
  image_alt: "",
  sort_order: 0,
  gallery_images: [],
});

const defaultSubDetails = () => ({
  hero: {
    kicker: "",
    title: "",
    side_title: "",
    side_description: "",
    bottom_text: "",
    slides: [],
  },
  accordion: { section_title: "", section_description: "", image: "", items: [] },
  tabs: { section_title: "", items: [] },
  services: { title: "", highlight_text: "", description: "", items: [] },
  experience: { title: "", cta_label: "", cta_url: "", images: [] },
});

/**
 * Create / Edit Industry.
 *
 * Props:
 *   mode         "create" | "edit"
 *   industryId   required when mode === "edit"
 *   initialData  industry object when editing
 */
export default function IndustryForm({
  mode = "create",
  industryId = null,
  initialData = null,
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    image_alt: "",
    is_active: true,
    meta_title: "",
    meta_keyword: "",
    meta_description: "",
    sub_details: defaultSubDetails(),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Edit mode prefill (merge defaults for any missing keys)
  useEffect(() => {
    if (!initialData) return;
    const d = defaultSubDetails();
    const s = initialData.sub_details || {};
    setForm({
      name: initialData.name || "",
      slug: initialData.slug || "",
      description: initialData.description || "",
      image: initialData.image || "",
      image_alt: initialData.image_alt || "",
      is_active: initialData.is_active ?? true,
      meta_title: initialData.meta_title || "",
      meta_keyword: initialData.meta_keyword || "",
      meta_description: initialData.meta_description || "",
      sub_details: {
        hero: { ...d.hero, ...(s.hero || {}) },
        accordion: { ...d.accordion, ...(s.accordion || {}) },
        tabs: { ...d.tabs, ...(s.tabs || {}) },
        services: { ...d.services, ...(s.services || {}) },
        experience: { ...d.experience, ...(s.experience || {}) },
      },
    });
  }, [initialData]);

  /* ---------------- state helpers ---------------- */

  function setTop(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function setSection(section, field, value) {
    setForm((f) => ({
      ...f,
      sub_details: {
        ...f.sub_details,
        [section]: { ...f.sub_details[section], [field]: value },
      },
    }));
  }

  function getList(section, key = "items") {
    return form.sub_details[section][key] || [];
  }

  function setList(section, key, list) {
    // sort_order is always set automatically based on position
    const normalized = list.map((item, i) =>
      "sort_order" in item ? { ...item, sort_order: i + 1 } : item
    );
    setSection(section, key, normalized);
  }

  function addToList(section, key, template) {
    setList(section, key, [...getList(section, key), template()]);
  }

  function removeFromList(section, key, index) {
    setList(
      section,
      key,
      getList(section, key).filter((_, i) => i !== index)
    );
  }

  function moveInList(section, key, index, dir) {
    const list = [...getList(section, key)];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setList(section, key, list);
  }

  function setItemField(section, key, index, field, value) {
    const list = [...getList(section, key)];
    list[index] = { ...list[index], [field]: value };
    setList(section, key, list);
  }

  /* ---------------- submit ---------------- */

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.slug.trim()) e.slug = "Slug is required";
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
        name: form.name.trim(),
        slug: form.slug.trim(), // sent exactly as typed
        description: form.description || null,
        image: form.image || null,
        image_alt: form.image_alt || null,
        is_active: form.is_active,
        meta_title: form.meta_title || null,
        meta_keyword: form.meta_keyword || null,
        meta_description: form.meta_description || null,
        sub_details: form.sub_details,
      };

      if (mode === "edit" && industryId) {
        await updateIndustry(industryId, payload);
      } else {
        await createIndustry(payload);
      }

      router.push("/dashboard/industries");
      router.refresh();
    } catch (err) {
      setApiError(err.message || "Failed to save industry");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  const sd = form.sub_details;
  const slideCount = sd.hero.slides.length;
  const counts = useMemo(
    () => ({
      slides: sd.hero.slides.length,
      accordion: sd.accordion.items.length,
      tabs: sd.tabs.items.length,
      services: sd.services.items.length,
    }),
    [sd]
  );

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-gray-900">
          {mode === "edit" ? "Edit Industry" : "Create Industry"}
        </h1>
        <button
          type="button"
          onClick={() => router.push("/dashboard/industries")}
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

      {/* ---------------- Main info ---------------- */}
      <SectionCard title="Basic Information">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label="Name"
            required
            error={errors.name}
            value={form.name}
            onChange={(e) => setTop("name", e.target.value)}
          />
          <TextInput
            label="Slug"
            required
            error={errors.slug}
            hint="Used in the URL, e.g. /industries/healthcare"
            value={form.slug}
            onChange={(e) => setTop("slug", e.target.value)}
          />
        </div>

        <TextArea
          label="Description"
          rows={4}
          value={form.description}
          onChange={(e) => setTop("description", e.target.value)}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <ImageUploader
            label="Image"
            value={form.image}
            onChange={(url) => setTop("image", url)}
          />
          <TextInput
            label="Image Alt"
            value={form.image_alt}
            onChange={(e) => setTop("image_alt", e.target.value)}
          />
        </div>

        <div className="md:w-1/2 md:pr-2.5">
          <SelectInput
            label="Active"
            value={form.is_active ? "yes" : "no"}
            onChange={(e) => setTop("is_active", e.target.value === "yes")}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </SelectInput>
        </div>
      </SectionCard>

      <p className="px-1 pt-2 text-sm font-semibold text-gray-500">
        Industry Detail (sub_details)
      </p>

      {/* ---------------- Hero Section ---------------- */}
      <SectionCard title="Hero Section">
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label="Hero Kicker"
            value={sd.hero.kicker}
            onChange={(e) => setSection("hero", "kicker", e.target.value)}
          />
          <TextInput
            label="Hero Title"
            value={sd.hero.title}
            onChange={(e) => setSection("hero", "title", e.target.value)}
          />
          <TextInput
            label="Hero Side Title"
            value={sd.hero.side_title}
            onChange={(e) => setSection("hero", "side_title", e.target.value)}
          />
          <TextArea
            label="Hero Side Description"
            rows={3}
            value={sd.hero.side_description}
            onChange={(e) =>
              setSection("hero", "side_description", e.target.value)
            }
          />
        </div>
        <div className="md:w-1/2 md:pr-2.5">
          <TextInput
            label="Hero Bottom Text"
            value={sd.hero.bottom_text}
            onChange={(e) => setSection("hero", "bottom_text", e.target.value)}
          />
        </div>
      </SectionCard>

      {/* ---------------- Hero Slider ---------------- */}
      <SectionCard title="Hero Slider" badge={`${counts.slides} slides`}>
        {slideCount === 0 ? (
          <EmptyHint>No slides yet. Click "Add Slide" to get started.</EmptyHint>
        ) : (
          <div className="space-y-4">
            {sd.hero.slides.map((slide, i) => (
              <RepeatItem
                key={i}
                title={`Slide #${i + 1}`}
                canMoveUp={i > 0}
                canMoveDown={i < slideCount - 1}
                onMoveUp={() => moveInList("hero", "slides", i, -1)}
                onMoveDown={() => moveInList("hero", "slides", i, 1)}
                onRemove={() => removeFromList("hero", "slides", i)}
              >
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextInput
                      label="Title"
                      value={slide.title}
                      onChange={(e) =>
                        setItemField("hero", "slides", i, "title", e.target.value)
                      }
                    />
                    <TextInput
                      label="Excerpt"
                      value={slide.excerpt}
                      onChange={(e) =>
                        setItemField("hero", "slides", i, "excerpt", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <p className="mb-1.5 text-sm font-medium text-gray-800">
                      Description
                    </p>
                    <RichTextEditor
                      value={slide.description}
                      onChange={(html) =>
                        setItemField("hero", "slides", i, "description", html)
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <ImageUploader
                      label="Image"
                      value={slide.image}
                      onChange={(url) =>
                        setItemField("hero", "slides", i, "image", url)
                      }
                    />
                    <TextInput
                      label="Image Alt"
                      value={slide.image_alt}
                      onChange={(e) =>
                        setItemField(
                          "hero",
                          "slides",
                          i,
                          "image_alt",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <MultiImageUploader
                    label="Gallery Images"
                    value={slide.gallery_images}
                    onChange={(urls) =>
                      setItemField("hero", "slides", i, "gallery_images", urls)
                    }
                  />
                </div>
              </RepeatItem>
            ))}
          </div>
        )}

        <AddButton onClick={() => addToList("hero", "slides", emptySlide)}>
          Add Slide
        </AddButton>
      </SectionCard>

      {/* ---------------- Detail Accordion Section ---------------- */}
      <SectionCard
        title="Detail Accordion Section"
        badge={`${counts.accordion} items`}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label="Section Title"
            value={sd.accordion.section_title}
            onChange={(e) =>
              setSection("accordion", "section_title", e.target.value)
            }
          />
          <TextArea
            label="Section Description"
            rows={3}
            value={sd.accordion.section_description}
            onChange={(e) =>
              setSection("accordion", "section_description", e.target.value)
            }
          />
        </div>

        <ImageUploader
          label="Image"
          value={sd.accordion.image}
          onChange={(url) => setSection("accordion", "image", url)}
        />

        {counts.accordion === 0 ? (
          <EmptyHint>No items yet. Click "Add Item" to create one.</EmptyHint>
        ) : (
          <div className="space-y-4">
            {sd.accordion.items.map((item, i) => (
              <RepeatItem
                key={i}
                title={`Item #${i + 1}`}
                canMoveUp={i > 0}
                canMoveDown={i < counts.accordion - 1}
                onMoveUp={() => moveInList("accordion", "items", i, -1)}
                onMoveDown={() => moveInList("accordion", "items", i, 1)}
                onRemove={() => removeFromList("accordion", "items", i)}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Title"
                    value={item.title}
                    onChange={(e) =>
                      setItemField("accordion", "items", i, "title", e.target.value)
                    }
                  />
                  <TextArea
                    label="Content"
                    rows={3}
                    value={item.content}
                    onChange={(e) =>
                      setItemField(
                        "accordion",
                        "items",
                        i,
                        "content",
                        e.target.value
                      )
                    }
                  />
                </div>
              </RepeatItem>
            ))}
          </div>
        )}

        <AddButton onClick={() => addToList("accordion", "items", emptySortable)}>
          Add Item
        </AddButton>
      </SectionCard>

      {/* ---------------- Detail Tabs Section ---------------- */}
      <SectionCard title="Detail Tabs Section" badge={`${counts.tabs} tabs`}>
        <TextInput
          label="Section Title"
          value={sd.tabs.section_title}
          onChange={(e) => setSection("tabs", "section_title", e.target.value)}
        />

        {counts.tabs === 0 ? (
          <EmptyHint>No tabs yet. Click "Add Tab" to create one.</EmptyHint>
        ) : (
          <div className="space-y-4">
            {sd.tabs.items.map((tab, i) => (
              <RepeatItem
                key={i}
                title={`Tab #${i + 1}`}
                canMoveUp={i > 0}
                canMoveDown={i < counts.tabs - 1}
                onMoveUp={() => moveInList("tabs", "items", i, -1)}
                onMoveDown={() => moveInList("tabs", "items", i, 1)}
                onRemove={() => removeFromList("tabs", "items", i)}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Tab Title"
                    value={tab.title}
                    onChange={(e) =>
                      setItemField("tabs", "items", i, "title", e.target.value)
                    }
                  />
                  <TextArea
                    label="Tab Content"
                    rows={3}
                    value={tab.content}
                    onChange={(e) =>
                      setItemField("tabs", "items", i, "content", e.target.value)
                    }
                  />
                </div>
              </RepeatItem>
            ))}
          </div>
        )}

        <AddButton onClick={() => addToList("tabs", "items", emptySortable)}>
          Add Tab
        </AddButton>
      </SectionCard>

      {/* ---------------- Detail Services Section ---------------- */}
      <SectionCard
        title="Detail Services Section"
        badge={`${counts.services} items`}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label="Title"
            value={sd.services.title}
            onChange={(e) => setSection("services", "title", e.target.value)}
          />
          <TextInput
            label="Highlight Text"
            value={sd.services.highlight_text}
            onChange={(e) =>
              setSection("services", "highlight_text", e.target.value)
            }
          />
        </div>

        <TextArea
          label="Description"
          rows={4}
          value={sd.services.description}
          onChange={(e) => setSection("services", "description", e.target.value)}
        />

        <p className="border-t border-gray-100 pt-4 text-sm font-medium text-gray-700">
          Accordion Items
        </p>

        {counts.services === 0 ? (
          <EmptyHint>No items yet.</EmptyHint>
        ) : (
          <div className="space-y-4">
            {sd.services.items.map((item, i) => (
              <RepeatItem
                key={i}
                title={`Item #${i + 1}`}
                canMoveUp={i > 0}
                canMoveDown={i < counts.services - 1}
                onMoveUp={() => moveInList("services", "items", i, -1)}
                onMoveDown={() => moveInList("services", "items", i, 1)}
                onRemove={() => removeFromList("services", "items", i)}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput
                    label="Title"
                    value={item.title}
                    onChange={(e) =>
                      setItemField("services", "items", i, "title", e.target.value)
                    }
                  />
                  <TextArea
                    label="Content"
                    rows={3}
                    value={item.content}
                    onChange={(e) =>
                      setItemField("services", "items", i, "content", e.target.value)
                    }
                  />
                </div>
              </RepeatItem>
            ))}
          </div>
        )}

        <AddButton onClick={() => addToList("services", "items", emptySortable)}>
          Add Accordion Item
        </AddButton>
      </SectionCard>

      {/* ---------------- Detail Experience Section ---------------- */}
      <SectionCard title="Detail Experience Section">
        <TextInput
          label="Title"
          value={sd.experience.title}
          onChange={(e) => setSection("experience", "title", e.target.value)}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <TextInput
            label="CTA Label"
            value={sd.experience.cta_label}
            onChange={(e) => setSection("experience", "cta_label", e.target.value)}
          />
          <TextInput
            label="CTA URL"
            value={sd.experience.cta_url}
            onChange={(e) => setSection("experience", "cta_url", e.target.value)}
          />
        </div>

        <MultiImageUploader
          label="Images"
          hint="The design showed 4 — you can add or remove as many as you need."
          value={sd.experience.images}
          onChange={(urls) => setSection("experience", "images", urls)}
        />
      </SectionCard>

      {/* ---------------- SEO ---------------- */}
      <SectionCard title="SEO Section">
        <CountedField
          label="Meta Title"
          limit={60}
          value={form.meta_title}
          onChange={(v) => setTop("meta_title", v)}
        />
        <TextInput
          label="Meta Keyword"
          hint="Separate keywords with commas"
          value={form.meta_keyword}
          onChange={(e) => setTop("meta_keyword", e.target.value)}
        />
        <CountedField
          label="Meta Description"
          limit={160}
          textarea
          rows={4}
          value={form.meta_description}
          onChange={(v) => setTop("meta_description", v)}
        />
      </SectionCard>

      {/* ---------------- Sticky save bar ---------------- */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <p className="hidden text-xs text-gray-500 sm:block">
            {mode === "edit" ? "Editing" : "Creating"}: {form.name || "Untitled"}
          </p>
          <div className="flex w-full gap-3 sm:w-auto">
            <button
              type="button"
              onClick={() => router.push("/dashboard/industries")}
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