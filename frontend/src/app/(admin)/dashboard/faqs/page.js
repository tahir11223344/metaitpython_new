"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFaqs, deleteFaq } from "@/lib/faqApi";

function formatDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso)
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-"); // "18-Feb-2026"
  } catch {
    return "-";
  }
}

function userName(u) {
  if (!u) return "-";
  return u.full_name || u.email || "-";
}

export default function FaqListPage() {
  const router = useRouter();

  const [faqs, setFaqs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const size = 10;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortDir, setSortDir] = useState("desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Debounce the search box so we don't fire a request per keystroke
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
      const data = await getFaqs({ search, sortDir, page, size });
      setFaqs(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || "Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  }, [search, sortDir, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await deleteFaq(id);
      if (faqs.length === 1 && page > 1) {
        setPage((p) => p - 1); // step back if we removed the last row on a page
      } else {
        load();
      }
    } catch (e) {
      alert(e.message || "Failed to delete FAQ");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / size));

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">FAQs</h1>

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
            onClick={() => router.push("/dashboard/faqs/create")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <span aria-hidden>＋</span> Add FAQ
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead>
              <tr className="border-y border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-5 py-3 font-medium">Page</th>
                <th className="px-5 py-3 font-medium">Question</th>
                <th className="px-5 py-3 font-medium">Answer</th>
                <th className="px-5 py-3 font-medium">Created By</th>
                <th
                  className="cursor-pointer select-none px-5 py-3 font-medium"
                  onClick={() =>
                    setSortDir((d) => (d === "desc" ? "asc" : "desc"))
                  }
                >
                  Created At {sortDir === "desc" ? "▼" : "▲"}
                </th>
                <th className="px-5 py-3 font-medium">Updated By</th>
                <th className="px-5 py-3 font-medium">Updated At</th>
                <th className="px-5 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : faqs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400">
                    No FAQs found.
                  </td>
                </tr>
              ) : (
                faqs.map((f, idx) => (
                  <tr key={f.id} className={idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}>
                    <td className="px-5 py-4 align-top font-medium text-gray-800">
                      {f.page}
                    </td>
                    <td className="max-w-[220px] px-5 py-4 align-top text-blue-600">
                      {f.question}
                    </td>
                    <td className="max-w-[420px] px-5 py-4 align-top text-gray-600">
                      {f.answer}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      {userName(f.created_by)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      {formatDate(f.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      {userName(f.updated_by)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      {formatDate(f.updated_at)}
                    </td>
                    <td className="px-5 py-4 align-top text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Direct Edit Button */}
                        <button
                          onClick={() =>
                            router.push(`/dashboard/faqs/edit/${f.id}`)
                          }
                          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 shadow-sm"
                        >
                          Edit
                        </button>
                        
                        {/* Direct Delete Button */}
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 shadow-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row">
          <p className="text-xs text-gray-500">
            {total} total • Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}