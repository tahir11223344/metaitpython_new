"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTeams, deleteTeam, mediaUrl } from "@/lib/Team_api";

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

export default function TeamListPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("sort_order");
  const [sortDir, setSortDir] = useState("asc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const data = await getTeams({ search, sortBy, sortDir, page, size });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortDir, page, size]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleSort(column) {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
    setPage(1);
  }

  function sortIcon(column) {
    if (sortBy !== column) return "";
    return sortDir === "asc" ? " ▲" : " ▼";
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      await deleteTeam(id);
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        load();
      }
    } catch (e) {
      alert(e.message || "Failed to delete team member");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / size));
  const fromRow = total === 0 ? 0 : (page - 1) * size + 1;
  const toRow = Math.min(page * size, total);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <button
          onClick={() => router.push("/dashboard/teams/create")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <span>＋</span> Add Team
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100">
          <div className="relative w-full sm:max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search team members..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Dynamic Responsive View State */}
        {loading ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            Loading...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 text-sm">{error}</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No team members found.
          </div>
        ) : (
          <>
            {/* 1. Mobile/Tablet Responsive View (Cards) */}
            <div className="block divide-y divide-gray-100 md:hidden">
              {items.map((t) => (
                <div key={t.id} className="p-4 flex flex-col gap-3 bg-white">
                  <div className="flex items-center gap-3">
                    {t.profile_image ? (
                      <img
                        src={mediaUrl(t.profile_image)}
                        alt={t.image_alt || t.name}
                        className="h-14 w-14 rounded-full border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full border border-gray-200 bg-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {t.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {t.designation}
                      </p>
                    </div>
                    <div>
                      {t.is_active ? (
                        <span className="inline-flex rounded bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-1.5 text-xs text-gray-600 border-t border-gray-50 pt-2">
                    <div>
                      <span className="font-medium text-gray-400">Email:</span>{" "}
                      {t.email || "-"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-400">Phone:</span>{" "}
                      {t.phone || "-"}
                    </div>
                    <div>
                      <span className="font-medium text-gray-400">Order:</span>{" "}
                      #{t.sort_order}
                    </div>
                    <div>
                      <span className="font-medium text-gray-400">
                        Created:
                      </span>{" "}
                      {formatDate(t.created_at)}
                    </div>
                  </div>

                  {/* Mobile Direct Inline Buttons */}
                  <div className="flex items-center justify-end gap-2 border-t border-gray-50 pt-2 mt-1">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/teams/edit/${t.id}`)
                      }
                      className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Desktop View (Large Table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500 bg-gray-50/50">
                    <th className="px-5 py-3 font-medium">Image</th>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Designation</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th
                      className="cursor-pointer select-none px-5 py-3 font-medium"
                      onClick={() => toggleSort("sort_order")}
                    >
                      Sort Order{sortIcon("sort_order")}
                    </th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th
                      className="cursor-pointer select-none px-5 py-3 font-medium"
                      onClick={() => toggleSort("created_at")}
                    >
                      Created At{sortIcon("created_at")}
                    </th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                  {items.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/40 transition">
                      <td className="px-5 py-3">
                        {t.profile_image ? (
                          <img
                            src={mediaUrl(t.profile_image)}
                            alt={t.image_alt || t.name}
                            className="h-10 w-10 rounded-md border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md border border-gray-200 bg-gray-100" />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-800">
                        {t.name}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                        {t.designation}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {t.email || "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                        {t.phone || "-"}
                      </td>
                      <td className="px-5 py-3">{t.sort_order}</td>
                      <td className="px-5 py-3">
                        {t.is_active ? (
                          <span className="inline-flex rounded bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-gray-500">
                        {formatDate(t.created_at)}
                      </td>
                      {/* Desktop Buttons Column */}
                      <td className="whitespace-nowrap px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              router.push(`/dashboard/teams/edit/${t.id}`)
                            }
                            title="Edit"
                            className="inline-flex p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            title="Delete"
                            className="inline-flex p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none cursor-pointer"
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

          <div className="flex items-center gap-1 max-w-full overflow-x-auto py-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`min-w-[32px] rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
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
              className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
