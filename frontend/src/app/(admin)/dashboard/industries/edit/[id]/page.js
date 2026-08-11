"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getIndustry } from "@/lib/Industry_api";
import IndustryForm from "@/components/admin/industry/Industryform";

export default function EditIndustryPage() {
  const { id } = useParams();
  const [industry, setIndustry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getIndustry(id)
      .then(setIndustry)
      .catch((e) => setError(e.message || "Failed to load industry"))
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
        <IndustryForm mode="edit" industryId={id} initialData={industry} />
      )}
    </div>
  );
}
