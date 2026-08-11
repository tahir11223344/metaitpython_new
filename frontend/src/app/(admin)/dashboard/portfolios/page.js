"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPortfolios, deletePortfolio, mediaUrl } from "@/lib/portfolio_Api";

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

export default function PortfolioListPage() {
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
      const data = await getPortfolios({ search, sortDir, page, size });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || "Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  }, [search, sortDir, page, size]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this portfolio?")) return;
    try {
      await deletePortfolio(id);
      setOpenMenu(null);
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        load();
      }
    } catch (e) {
      alert(e.message || "Failed to delete portfolio");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / size));
  const fromRow = total === 0 ? 0 : (page - 1) * size + 1;
  const toRow = Math.min(page * size, total);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Portfolios</h1>

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
              placeholder="Search"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            onClick={() => router.push("/dashboard/portfolios/create")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <span aria-hidden>＋</span> Add Portfolio
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead>
              <tr className="border-y border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Sub Title</th>
                <th className="px-5 py-3 font-medium">Thumbnail</th>
                <th className="px-5 py-3 font-medium">Gallery Images</th>
                <th className="px-5 py-3 font-medium">Is Active</th>
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
                    colSpan={10}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-10 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    No portfolios found.
                  </td>
                </tr>
              ) : (
                items.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}
                  >
                    <td className="whitespace-nowrap px-5 py-4 align-top text-gray-700">
                      {p.category?.name || "-"}
                    </td>
                    <td className="max-w-[200px] px-5 py-4 align-top font-medium text-gray-800">
                      {p.title}
                    </td>
                    <td className="max-w-[160px] px-5 py-4 align-top text-gray-600">
                      {p.slug}
                    </td>
                    <td className="max-w-[360px] px-5 py-4 align-top text-gray-600">
                      {p.subtitle || "-"}
                    </td>
                    <td className="px-5 py-4 align-top">
                      {p.thumbnail ? (
                        <img
                          src={mediaUrl(p.thumbnail)}
                          alt={p.image_alt || p.title}
                          className="h-11 w-11 rounded-md border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-md border border-gray-200 bg-gray-100" />
                      )}
                    </td>
                    <td className="px-5 py-4 text-center align-top">
                      {p.gallery_count}
                    </td>
                    <td className="px-5 py-4 align-top">
                      {p.is_active ? (
                        <span className="inline-flex rounded bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      {formatDate(p.updated_at)}
                    </td>
                    <td className="px-5 py-4 align-top text-center">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setOpenMenu((m) => (m === p.id ? null : p.id))
                          }
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Actions <span aria-hidden>▾</span>
                        </button>

                        {openMenu === p.id ? (
                          <div
                            className="absolute right-0 z-10 mt-1 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
                            onMouseLeave={() => setOpenMenu(null)}
                          >
                            <button
                              onClick={() =>
                                router.push(
                                  `/dashboard/portfolios/edit/${p.id}`,
                                )
                              }
                              className="block w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
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
