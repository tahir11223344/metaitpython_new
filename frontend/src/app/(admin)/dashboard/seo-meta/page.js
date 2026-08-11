"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { API_BASE_URL } from "./constants";

export default function SeoMetaListPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/seo-meta/?search=${encodeURIComponent(search)}`,
      );
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Failed to fetch SEO Meta list", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this SEO Meta?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/seo-meta/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">SEO Meta</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="relative w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <Link
            href="/dashboard/seo-meta/create"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            + Add SEO Meta
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs uppercase text-left">
                <th className="px-4 py-3">Page</th>
                <th className="px-4 py-3">Meta Title</th>
                <th className="px-4 py-3">Meta Keywords</th>
                <th className="px-4 py-3">Meta Description</th>
                <th className="px-4 py-3">Is Active</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Updated At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-400">
                    No SEO Meta found
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{item.page_name}</td>
                    <td className="px-4 py-3">{item.meta_title}</td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {item.meta_keyword}
                    </td>
                    <td className="px-4 py-3 max-w-sm truncate">
                      {item.meta_description}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium text-white ${
                          item.is_active ? "bg-green-500" : "bg-gray-400"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === item.id ? null : item.id)
                        }
                        className="border border-gray-200 rounded-md px-3 py-1 text-xs flex items-center gap-1"
                      >
                        Actions ▾
                      </button>
                      {openMenuId === item.id && (
                        <div className="absolute right-4 mt-1 w-32 bg-white border border-gray-100 rounded-md shadow-md z-10">
                          <Link
                            href={`/dashboard/seo-meta/edit/${item.id}`}
                            className="block px-4 py-2 text-sm hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
