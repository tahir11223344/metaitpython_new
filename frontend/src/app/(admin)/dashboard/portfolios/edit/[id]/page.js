"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPortfolio } from "@/lib/portfolio_Api";
import PortfolioForm from "@/components/admin/portfolios/PortfolioForm";

export default function EditPortfolioPage() {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getPortfolio(id)
      .then(setPortfolio)
      .catch((e) => setError(e.message || "Failed to load portfolio"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <PortfolioForm mode="edit" portfolioId={id} initialData={portfolio} />
      )}
    </div>
  );
}
