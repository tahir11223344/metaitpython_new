"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getService } from "@/lib/serviceApi";
import ServiceForm from "@/components/admin/services/ServiceForm";

export default function EditServicePage({ params }) {
  // Next 15+ me params ek promise hai
  const { id } = use(params);

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getService(id);
        if (!cancelled) setService(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Couldn't load this service.");
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
      <div
        className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-white p-12
                      text-center text-slate-500 shadow-sm"
      >
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-rose-700">{error}</p>
        <Link
          href="/dashboard/services"
          className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return <ServiceForm initial={service} />;
}
