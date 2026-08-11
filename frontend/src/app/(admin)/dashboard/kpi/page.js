"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getKpiSections, deleteKpiSection } from "@/lib/kpi_api";

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

export default function KpiSectionListPage() {
  const router = useRouter();

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
      const data = await getKpiSections({ search, sortDir, page, size });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || "Failed to load KPI sections");
    } finally {
      setLoading(false);
    }
  }, [search, sortDir, page, size]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this KPI section?")) return;
    try {
      await deleteKpiSection(id);
      setOpenMenu(null);
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        load();
      }
    } catch (e) {
      alert(e.message || "Failed to delete KPI section");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / size));
  const fromRow = total === 0 ? 0 : (page - 1) * size + 1;
  const toRow = Math.min(page * size, total);

  return (
    <div className="mx-auto max-w-8xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">KPI Sections</h1>

      <div className="rounded-xl border border-gray-200 bg-white shadow-2xl">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            onClick={() => router.push("/dashboard/kpi/create")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <span aria-hidden>＋</span> Add KPI Section
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="border-y border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Tag</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Subtitle</th>
                <th className="px-5 py-3 font-medium">Points Count</th>
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
                    colSpan={8}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    No KPI sections found.
                  </td>
                </tr>
              ) : (
                items.map((k, idx) => (
                  <tr
                    key={k.id}
                    className={idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}
                  >
                    <td className="px-5 py-4 align-top font-medium text-gray-800">
                      {k.id}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top font-medium text-gray-800">
                      {k.tag}
                    </td>
                    <td className="max-w-[240px] px-5 py-4 align-top text-gray-700">
                      {k.title}
                    </td>
                    <td className="max-w-[460px] px-5 py-4 align-top text-gray-600">
                      {k.subtitle}
                    </td>
                    <td className="px-5 py-4 align-top">{k.points_count}</td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      {formatDate(k.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      {formatDate(k.updated_at)}
                    </td>
                    <td className="px-5 py-4 align-top text-center">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setOpenMenu((m) => (m === k.id ? null : k.id))
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Actions <span aria-hidden>▾</span>
                        </button>

                        {openMenu === k.id ? (
                          <div
                            className="absolute right-0 z-10 mt-1 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                            onMouseLeave={() => setOpenMenu(null)}
                          >
                            <button
                              onClick={() =>
                                router.push(`/dashboard/kpi/edit/${k.id}`)
                              }
                              className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(k.id)}
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
    </div>
  );
}
