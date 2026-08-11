"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLegalPage, getLegalPageTypes } from "@/lib/Legalpage_api";
import LegalPageForm from "@/components/admin/legalpageform/Legalpageform";

export default function EditLegalPage() {
  const { type } = useParams();

  const [data, setData] = useState(null);
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!type) return;

    Promise.all([getLegalPageTypes(), getLegalPage(type)])
      .then(([types, page]) => {
        const found = (types || []).find((t) => t.key === type);
        if (!found) {
          setError("Unknown page type");
          return;
        }
        setLabel(found.label);
        setData(page); // null = abhi tak configure nahi hua
      })
      .catch((e) => setError(e.message || "Failed to load page"))
      .finally(() => setLoading(false));
  }, [type]);

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
        <LegalPageForm pageType={type} label={label} initialData={data} />
      )}
    </div>
  );
}
