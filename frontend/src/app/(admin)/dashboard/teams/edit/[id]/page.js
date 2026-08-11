"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTeam } from "@/lib/Team_api";
import TeamForm from "@/components/admin/teams/TeamForm";

export default function EditTeamPage() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getTeam(id)
      .then(setTeam)
      .catch((e) => setError(e.message || "Failed to load team member"))
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
        <TeamForm mode="edit" teamId={id} initialData={team} />
      )}
    </div>
  );
}
