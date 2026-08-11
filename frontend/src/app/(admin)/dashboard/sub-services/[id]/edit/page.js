"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getSubService } from "@/lib/subServiceApi";
import SubServiceForm from "@/components/admin/subservices/SubServiceForm";

export default function EditSubServicePage({ params }) {
  const { id } = use(params);

  const [subService, setSubService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getSubService(id);
        if (!cancelled) setSubService(data);
      } catch (err) {
        if (!cancelled)
          setError(err.message || "Couldn't load this sub-service.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-rose-700">{error}</p>
        <Link
          href="/dashboard/sub-services"
          className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return <SubServiceForm initial={subService} />;
}
