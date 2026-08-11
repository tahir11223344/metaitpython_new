"use client";

import { useCallback, useEffect, useState } from "react";
import { getCategories, deleteCategory } from "@/lib/Category_api";
import CategoryModal from "@/components/admin/category/Categorymodal";

function formatDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  } catch {
    return "-";
  }
}

function StatusBadge({ status }) {
  const active = status === "active";
  return (
    <span
      className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function YesNoBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold ${
        value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

export default function CategoryListPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState("desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCategories({ search, sortDir, page, size });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [search, sortDir, page, size]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setModalMode("create");
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(cat) {
    setModalMode("edit");
    setEditing(cat);
    setModalOpen(true);
    setOpenMenu(null);
  }

  function handleSaved() {
    setModalOpen(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      setOpenMenu(null);
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        load();
      }
    } catch (e) {
      alert(e.message || "Failed to delete category");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / size));
  const fromRow = total === 0 ? 0 : (page - 1) * size + 1;
  const toRow = Math.min(page * size, total);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Categories</h1>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Category"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <span aria-hidden>＋</span> Add Category
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-y border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Show on Header</th>
                <th
                  className="cursor-pointer select-none px-5 py-3 font-medium"
                  onClick={() =>
                    setSortDir((d) => (d === "desc" ? "asc" : "desc"))
                  }
                >
                  Created At {sortDir === "desc" ? "▼" : "▲"}
                </th>
                <th className="px-5 py-3 font-medium">Updated At</th>
                <th className="px-5 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                items.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}
                  >
                    <td className="px-5 py-4 align-top font-medium text-gray-800">
                      {c.name}
                    </td>
                    <td className="px-5 py-4 align-top text-gray-600">
                      {c.slug}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-4 align-top">
                      <YesNoBadge value={c.show_on_header} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      {formatDate(c.updated_at)}
                    </td>
                    <td className="px-5 py-4 align-top text-center">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setOpenMenu((m) => (m === c.id ? null : c.id))
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Actions <span aria-hidden>▾</span>
                        </button>

                        {openMenu === c.id ? (
                          <div
                            className="absolute right-0 z-10 mt-1 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                            onMouseLeave={() => setOpenMenu(null)}
                          >
                            <button
                              onClick={() => openEdit(c)}
                              className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="block w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Showing {fromRow} to {toRow} of {total} records
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`min-w-[32px] rounded-md px-2 py-1.5 text-xs font-medium transition ${
                  n === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit modal */}
      <CategoryModal
        open={modalOpen}
        mode={modalMode}
        initialData={editing}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
