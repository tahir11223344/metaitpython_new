"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getServices, deleteService, mediaUrl } from "@/lib/serviceApi";

const PER_PAGE = 20;

function formatDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

export default function ServicesListPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(""); // "" | "true" | "false"

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getServices({
        search,
        isActive: activeFilter === "" ? null : activeFilter === "true",
        page,
        perPage: PER_PAGE,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Couldn't load services.");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter, page]);

  // search type karte waqt har keystroke par request na jaye
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleDelete(service) {
    const ok = window.confirm(
      `Delete "${service.title}"? This can't be undone.`,
    );
    if (!ok) return;

    setDeletingId(service.id);
    try {
      await deleteService(service.id);
      // aakhri row delete hui to pichle page par chale jao
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else load();
    } catch (err) {
      setError(err.message || "Couldn't delete this service.");
    } finally {
      setDeletingId(null);
    }
  }

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            Services{" "}
            {!loading && (
              <span className="text-sm font-normal text-slate-500">
                ({total})
              </span>
            )}
          </h2>
          <Link
            href="/dashboard/services/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white
                       transition hover:bg-blue-700"
          >
            Create Service
          </Link>
        </div>

        {/* filters */}
        <div className="flex flex-wrap gap-3 border-b border-slate-200 bg-slate-50 px-6 py-3">
          <input
            type="search"
            placeholder="Search title or slug…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2
                       text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <select
            value={activeFilter}
            onChange={(e) => {
              setPage(1);
              setActiveFilter(e.target.value);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {error && (
          <div className="border-b border-rose-200 bg-rose-50 px-6 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Service</th>
                <th className="px-6 py-3 font-semibold">Slug</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Updated</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Loading…
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-slate-600">
                      {search || activeFilter
                        ? "No services match your search."
                        : "No services yet."}
                    </p>
                    {!search && !activeFilter && (
                      <Link
                        href="/dashboard/services/new"
                        className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
                      >
                        Create your first service
                      </Link>
                    )}
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((s) => (
                  <tr key={s.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {s.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaUrl(s.thumbnail)}
                            alt={s.thumbnail_alt || ""}
                            className="h-10 w-10 rounded border border-slate-200 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded border border-dashed border-slate-300" />
                        )}
                        <span className="font-medium text-slate-900">
                          {s.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-500">{s.slug}</td>
                    <td className="px-6 py-3">
                      <span
                        className={
                          s.is_active
                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                        }
                      >
                        {s.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {formatDate(s.updated_at)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/dashboard/services/${s.id}/edit`)
                          }
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm
                                     font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s)}
                          disabled={deletingId === s.id}
                          className="rounded-md bg-rose-500 px-3 py-1.5 text-sm font-medium
                                     text-white transition hover:bg-rose-600 disabled:opacity-50"
                        >
                          {deletingId === s.id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3">
            <span className="text-sm text-slate-500">
              Page {page} of {lastPage}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm
                           transition hover:bg-slate-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm
                           transition hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
