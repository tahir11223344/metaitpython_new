"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { getBrands, deleteBrand, mediaUrl } from "@/lib/Brand_api";

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

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex rounded bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
      Active
    </span>
  ) : (
    <span className="inline-flex rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
      Inactive
    </span>
  );
}

function LogoPreview({ src, alt }) {
  if (!src) {
    return (
      <div className="h-12 w-20 rounded-md border border-gray-200 bg-gray-100" />
    );
  }
  // Logos aksar transparent hote hain — checkered background pe achhe dikhte hain
  return (
    <div className="flex h-12 w-20 items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-1.5">
      <img
        src={mediaUrl(src)}
        alt={alt}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

function WebsiteLink({ url }) {
  if (!url) return <span className="text-gray-400">-</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-[200px] items-center gap-1 text-blue-600 hover:underline"
      title={url}
    >
      <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
      <ExternalLink size={12} className="shrink-0" />
    </a>
  );
}

function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        title="Edit"
        aria-label="Edit"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onDelete}
        title="Delete"
        aria-label="Delete"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export default function BrandListPage() {
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
      const data = await getBrands({ search, sortBy, sortDir, page, size });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message || "Failed to load brands");
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

  function goEdit(id) {
    router.push(`/dashboard/brands/edit/${id}`);
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this brand?")) return;
    try {
      await deleteBrand(id);
      if (items.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        load();
      }
    } catch (e) {
      alert(e.message || "Failed to delete brand");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / size));
  const fromRow = total === 0 ? 0 : (page - 1) * size + 1;
  const toRow = Math.min(page * size, total);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
      <h1 className="mb-4 text-xl font-bold text-gray-900 sm:mb-6 sm:text-2xl">
        Brands
      </h1>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
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
            onClick={() => router.push("/dashboard/brands/create")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
          >
            <span aria-hidden>＋</span> Add Brand
          </button>
        </div>

        {/* DESKTOP table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-y border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-medium">Logo</th>
                <th
                  className="cursor-pointer select-none whitespace-nowrap px-4 py-3 font-medium"
                  onClick={() => toggleSort("company_name")}
                >
                  Company Name{sortIcon("company_name")}
                </th>
                <th className="px-4 py-3 font-medium">Website</th>
                <th className="px-4 py-3 font-medium">Logo Alt</th>
                <th
                  className="cursor-pointer select-none whitespace-nowrap px-4 py-3 font-medium"
                  onClick={() => toggleSort("sort_order")}
                >
                  Sort Order{sortIcon("sort_order")}
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th
                  className="cursor-pointer select-none whitespace-nowrap px-4 py-3 font-medium"
                  onClick={() => toggleSort("created_at")}
                >
                  Created At{sortIcon("created_at")}
                </th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No brands found.
                  </td>
                </tr>
              ) : (
                items.map((b, idx) => (
                  <tr
                    key={b.id}
                    className={idx % 2 === 1 ? "bg-gray-50/60" : "bg-white"}
                  >
                    <td className="px-4 py-4">
                      <LogoPreview
                        src={b.logo}
                        alt={b.logo_alt || b.company_name}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-800">
                      {b.company_name}
                    </td>
                    <td className="px-4 py-4">
                      <WebsiteLink url={b.website} />
                    </td>
                    <td className="max-w-[200px] px-4 py-4 text-gray-600">
                      {b.logo_alt || "-"}
                    </td>
                    <td className="px-4 py-4">{b.sort_order}</td>
                    <td className="px-4 py-4">
                      <StatusBadge active={b.is_active} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {formatDate(b.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <ActionButtons
                          onEdit={() => goEdit(b.id)}
                          onDelete={() => handleDelete(b.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE cards */}
        <div className="border-t border-gray-100 lg:hidden">
          {loading ? (
            <p className="px-4 py-10 text-center text-sm text-gray-400">
              Loading...
            </p>
          ) : error ? (
            <p className="px-4 py-10 text-center text-sm text-red-500">
              {error}
            </p>
          ) : items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-gray-400">
              No brands found.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((b) => (
                <li key={b.id} className="p-4">
                  <div className="flex gap-3">
                    <LogoPreview
                      src={b.logo}
                      alt={b.logo_alt || b.company_name}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate font-semibold text-gray-900">
                          {b.company_name}
                        </p>
                        <StatusBadge active={b.is_active} />
                      </div>

                      <div className="mt-1 text-xs">
                        <WebsiteLink url={b.website} />
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        Sort Order: {b.sort_order} · {formatDate(b.created_at)}
                      </p>

                      <div className="mt-3">
                        <ActionButtons
                          onEdit={() => goEdit(b.id)}
                          onDelete={() => handleDelete(b.id)}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:px-5">
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

          <div className="flex flex-wrap items-center justify-center gap-1">
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
