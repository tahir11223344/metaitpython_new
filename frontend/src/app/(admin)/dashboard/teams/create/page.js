import TeamForm from "@/components/admin/teams/TeamForm";

export default function CreateTeamPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <TeamForm mode="create" />
    </div>
  );
}
