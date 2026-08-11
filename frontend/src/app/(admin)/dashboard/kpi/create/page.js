import KpiSectionForm from "@/components/admin/kpi/Kpisectionform";

export default function CreateKpiSectionPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <KpiSectionForm mode="create" />
    </div>
  );
}