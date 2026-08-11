"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBlog } from "@/lib/Blog_api";
import BlogForm from "@/components/admin/blogs/Blogform";

export default function EditBlogPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getBlog(id)
      .then(setBlog)
      .catch((e) => setError(e.message || "Failed to load blog"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-[1200px] px-3 py-6 sm:px-4 sm:py-8">
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <BlogForm mode="edit" blogId={id} initialData={blog} />
      )}
    </div>
  );
}
