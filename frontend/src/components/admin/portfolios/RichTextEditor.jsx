"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

// Custom Image extension to support alignment (left, center, right)
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: null,
      },
      align: {
        default: "left",
        parseHTML: (element) => element.getAttribute("data-align") || "left",
        renderHTML: (attributes) => {
          return {
            "data-align": attributes.align,
            style: `display: block; margin: ${
              attributes.align === "center"
                ? "0 auto"
                : attributes.align === "right"
                ? "0 0 0 auto"
                : "0 auto 0 0"
            };`,
          };
        },
      },
    };
  },
});

export default function RichTextEditor({ value = "", onChange }) {
  const fileInputRef = useRef(null);
  const wrapperRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const [, forceRerender] = useState(0);

  const [linkModal, setLinkModal] = useState(null);
  const [linkBubble, setLinkBubble] = useState(null); 
  const [altModal, setAltModal] = useState(null);

  // Image floating bubble state for alignment & alt
  const [imageBubble, setImageBubble] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit, 
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: {
          class: "cursor-pointer",
        }
      }), 
      CustomImage
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    onSelectionUpdate: ({ editor }) => {
      forceRerender((n) => n + 1);
      updateLinkBubble(editor);
      updateImageBubble(editor);
    },
    editorProps: {
      attributes: {
        class: "rte-prose min-h-[200px] px-4 py-3 focus:outline-none",
      },
      handleClick(view, pos, event) {
        const target = event.target;
        if (target && target.closest && target.closest("a")) {
          event.preventDefault();
          return true;
        }
        return false;
      },
      handleClickOn(view, pos, node, nodePos, event) {
        if (node.type.name === "image") {
          editor.commands.setNodeSelection(nodePos);
          return true;
        }
        return false;
      },
    },
  });

  function updateLinkBubble(ed) {
    if (!ed || !wrapperRef.current || !ed.isActive("link")) {
      setLinkBubble(null);
      return;
    }
    const href = ed.getAttributes("link").href || "";
    const { from } = ed.state.selection;
    const coords = ed.view.coordsAtPos(from);
    const wrapperBox = wrapperRef.current.getBoundingClientRect();

    setLinkBubble({
      href,
      top: coords.top - wrapperBox.top + wrapperRef.current.scrollTop - 44,
      left: coords.left - wrapperBox.left,
    });
  }

  function updateImageBubble(ed) {
    if (!ed || !wrapperRef.current || !ed.isActive("image")) {
      setImageBubble(null);
      return;
    }
    const nodeAttrs = ed.getAttributes("image");
    const { from } = ed.state.selection;
    const coords = ed.view.coordsAtPos(from);
    const wrapperBox = wrapperRef.current.getBoundingClientRect();

    setImageBubble({
      pos: from,
      align: nodeAttrs.align || "left",
      alt: nodeAttrs.alt || "",
      top: coords.top - wrapperBox.top + wrapperRef.current.scrollTop - 50,
      left: coords.left - wrapperBox.left,
    });
  }

  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const token = getToken();
      const res = await fetch(`${API_URL}/media/image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error((err && err.detail) || "Image upload failed");
      }

      const data = await res.json();
      const src = data.url?.startsWith("http") ? data.url : `${API_URL}${data.url}`;
      editor.chain().focus().setImage({ src, alt: "", align: "left" }).run();
    } catch (err) {
      alert(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (!editor) {
    return <div className="min-h-[240px] rounded-lg border border-gray-300 bg-gray-50" />;
  }

  const Btn = ({ onClick, active, disabled, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`rounded px-2 py-1 text-sm transition disabled:opacity-50 ${
        active ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );

  function openLinkModal() {
    const attrs = editor.getAttributes("link");
    const rel = attrs.rel || "";
    setLinkBubble(null);
    setLinkModal({
      url: attrs.href || "",
      openNewTab: attrs.target === "_blank",
      noFollow: rel.includes("nofollow"),
      sponsored: rel.includes("sponsored"),
      doFollow: !rel.includes("nofollow"),
    });
  }

  function closeLinkModal() {
    setLinkModal(null);
  }

  function applyLink() {
    if (!linkModal) return;
    const { url, openNewTab, noFollow, sponsored } = linkModal;

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkModal(null);
      return;
    }

    const relParts = [];
    if (openNewTab) relParts.push("noopener", "noreferrer");
    if (noFollow) relParts.push("nofollow");
    if (sponsored) relParts.push("sponsored");

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url.trim(),
        target: openNewTab ? "_blank" : null,
        rel: relParts.length ? relParts.join(" ") : null,
      })
      .run();

    setLinkModal(null);
  }

  function removeLinkFromBubble() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkBubble(null);
  }

  function applyAlt() {
    if (!altModal) return;
    editor
      .chain()
      .setNodeSelection(altModal.pos)
      .updateAttributes("image", { alt: altModal.alt })
      .run();
    setAltModal(null);
  }

  function setImageAlignment(align) {
    editor.chain().focus().updateAttributes("image", { align }).run();
    setImageBubble((prev) => (prev ? { ...prev, align } : null));
  }

  return (
    <div
      ref={wrapperRef}
      className="relative max-h-[600px] overflow-y-auto rounded-lg border border-gray-300"
    >
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-1 rounded-t-lg border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo">↶</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo">↷</Btn>
        <span className="mx-1 h-5 w-px bg-gray-300" />

        <select
          value={
            editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
              ? "h3"
              : "p"
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .toggleHeading({ level: v === "h2" ? 2 : 3 })
                .run();
          }}
          className="rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 outline-none"
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <span className="mx-1 h-5 w-px bg-gray-300" />

        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <b>B</b>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <i>I</i>
        </Btn>
        <Btn onClick={openLinkModal} active={editor.isActive("link")} title="Link">🔗</Btn>

        <Btn
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="Upload image"
        >
          {uploading ? "⏳" : "🖼️"}
        </Btn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          ❝
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          • List
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          1. List
        </Btn>
      </div>

      <EditorContent editor={editor} />

      {/* Image Floating Bubble (Alignments + Alt Button) */}
      {imageBubble && !linkModal && !altModal && (
        <div
          className="absolute z-20 flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-lg"
          style={{ top: imageBubble.top, left: imageBubble.left }}
        >
          <button
            type="button"
            onClick={() => setImageAlignment("left")}
            className={`rounded px-1.5 py-0.5 text-xs ${
              imageBubble.align === "left" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
            title="Align Left"
          >
            Left
          </button>
          <button
            type="button"
            onClick={() => setImageAlignment("center")}
            className={`rounded px-1.5 py-0.5 text-xs ${
              imageBubble.align === "center" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
            title="Align Center"
          >
            Center
          </button>
          <button
            type="button"
            onClick={() => setImageAlignment("right")}
            className={`rounded px-1.5 py-0.5 text-xs ${
              imageBubble.align === "right" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
            title="Align Right"
          >
            Right
          </button>
          <span className="mx-1 h-4 w-px bg-gray-300" />
          <button
            type="button"
            onClick={() => setAltModal({ pos: imageBubble.pos, alt: imageBubble.alt })}
            className="rounded px-2 py-0.5 text-xs font-semibold text-blue-600 hover:bg-gray-100"
            title="Edit Alt Text"
          >
            ALT
          </button>
        </div>
      )}

      {/* Link click bubble */}
      {linkBubble && !linkModal && (
        <div
          className="absolute z-20 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg"
          style={{ top: linkBubble.top, left: linkBubble.left }}
        >
          <a
            href={linkBubble.href}
            target="_blank"
            rel="noopener noreferrer"
            className="max-w-[220px] truncate text-sm text-blue-600 underline hover:text-blue-800"
          >
            {linkBubble.href}
          </a>
          <button type="button" title="Edit link" onClick={openLinkModal} className="text-gray-500 hover:text-gray-800">
            ✏️
          </button>
          <button type="button" title="Remove link" onClick={removeLinkFromBubble} className="text-gray-500 hover:text-red-600">
            🔗✕
          </button>
        </div>
      )}

      {/* Link Create/Edit Modal */}
      {linkModal && (
        <div className="absolute inset-0 z-30 flex items-start justify-center bg-black/20 pt-12" onClick={closeLinkModal}>
          <div className="w-72 rounded-lg border border-blue-300 bg-white p-3 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              type="text"
              placeholder="Link URL"
              value={linkModal.url}
              onChange={(e) => setLinkModal((m) => ({ ...m, url: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && applyLink()}
              className="mb-2 w-full rounded border border-blue-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
            />
            <Toggle label="Open in new tab" checked={linkModal.openNewTab} onChange={(v) => setLinkModal((m) => ({ ...m, openNewTab: v }))} />
            <Toggle label="Do-Follow" checked={linkModal.doFollow} onChange={(v) => setLinkModal((m) => ({ ...m, doFollow: v, noFollow: v ? false : m.noFollow }))} />
            <Toggle label="No-Follow" checked={linkModal.noFollow} onChange={(v) => setLinkModal((m) => ({ ...m, noFollow: v, doFollow: v ? false : m.doFollow }))} />
            <Toggle label="Sponsored Tag" checked={linkModal.sponsored} onChange={(v) => setLinkModal((m) => ({ ...m, sponsored: v }))} />
            <div className="mt-3 flex items-center justify-center gap-8 border-t border-gray-100 pt-2">
              <button type="button" onClick={applyLink} className="text-xl text-green-600 hover:text-green-700">✔</button>
              <button type="button" onClick={closeLinkModal} className="text-xl text-red-500 hover:text-red-600">✕</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Alt-Tag Modal */}
      {altModal && (
        <div className="absolute inset-0 z-30 flex items-start justify-center bg-black/20 pt-12" onClick={() => setAltModal(null)}>
          <div className="w-72 rounded-lg border border-blue-300 bg-white p-3 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <label className="mb-1 block text-xs font-medium text-gray-500">Alt Text</label>
            <input
              autoFocus
              type="text"
              placeholder="Image ka alt text likhein"
              value={altModal.alt}
              onChange={(e) => setAltModal((m) => ({ ...m, alt: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && applyAlt()}
              className="mb-2 w-full rounded border border-blue-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
            />
            <div className="mt-2 flex items-center justify-center gap-8 border-t border-gray-100 pt-2">
              <button type="button" onClick={applyAlt} className="text-xl text-green-600 hover:text-green-700">✔</button>
              <button type="button" onClick={() => setAltModal(null)} className="text-xl text-red-500 hover:text-red-600">✕</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .rte-prose h2 { font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0; }
        .rte-prose h3 { font-size: 1.25rem; font-weight: 700; margin: 0.5rem 0; }
        .rte-prose p { margin: 0.4rem 0; }
        .rte-prose ul { list-style: disc; padding-left: 1.5rem; margin: 0.4rem 0; }
        .rte-prose ol { list-style: decimal; padding-left: 1.5rem; margin: 0.4rem 0; }
        .rte-prose blockquote { border-left: 3px solid #d1d5db; padding-left: 0.75rem; color: #6b7280; margin: 0.5rem 0; }
        
        /* Updated link styles to handle bold/strong correctly with !important */
        .rte-prose a, 
        .rte-prose a strong, 
        .rte-prose strong a, 
        .rte-prose a b, 
        .rte-prose b a, 
        .rte-prose a * { 
          color: #2563eb !important; 
          text-decoration: underline; 
        }
        
        .rte-prose img { max-width: 100%; height: auto; border-radius: 0.5rem; cursor: pointer; }
      `}</style>
    </div>
  );
}