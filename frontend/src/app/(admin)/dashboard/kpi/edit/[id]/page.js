"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getKpiSection } from "@/lib/kpi_api";
import KpiSectionForm from "@/components/admin/kpi/Kpisectionform";

export default function EditKpiSectionPage() {
  const { id } = useParams();
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getKpiSection(id)
      .then(setKpi)
      .catch((e) => setError(e.message || "Failed to load KPI section"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <KpiSectionForm mode="edit" kpiId={id} initialData={kpi} />
      )}
    </div>
  );
}