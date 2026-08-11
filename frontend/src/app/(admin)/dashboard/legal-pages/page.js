"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, FileText } from "lucide-react";
import { getLegalPages } from "@/lib/Legalpage_api";

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

export default function LegalPagesListPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLegalPages();
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || "Failed to load pages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function goEdit(type) {
    router.push(`/dashboard/legal-pages/${type}`);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-4 sm:py-8">
      <h1 className="mb-1 text-xl font-bold text-gray-900 sm:text-2xl">
        Legal Pages
      </h1>
      <p className="mb-4 text-sm text-gray-500 sm:mb-6">
        Privacy Policy, Terms and Disclaimer content.
      </p>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <p className="px-4 py-12 text-center text-sm text-gray-400">
            Loading...
          </p>
        ) : error ? (
          <p className="px-4 py-12 text-center text-sm text-red-500">{error}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((p) => (
              <li
                key={p.page_type}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText size={16} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{p.label}</p>
                      {p.exists ? (
                        <span className="inline-flex rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                          Configured
                        </span>
                      ) : (
                        <span className="inline-flex rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          Not configured
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-sm text-gray-500">
                      {p.heading || "No heading set"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      /{p.page_type}
                      {p.exists ? ` · Updated ${formatDate(p.updated_at)}` : ""}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => goEdit(p.page_type)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  <Pencil size={14} />
                  {p.exists ? "Edit" : "Set up"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
