"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "../../constants";
import SeoMetaForm from "@/components/admin/seo-meta/SeoMetaForm";

export default function EditSeoMetaPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/seo-meta/${id}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">SEO Meta not found</div>;

  return <SeoMetaForm mode="edit" initialData={data} id={id} />;
}
