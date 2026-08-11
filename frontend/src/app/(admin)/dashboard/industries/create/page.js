import IndustryForm from "@/components/admin/industry/Industryform";

export default function CreateIndustryPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-3 py-6 sm:px-4 sm:py-8">
      <IndustryForm mode="create" />
    </div>
  );
}
