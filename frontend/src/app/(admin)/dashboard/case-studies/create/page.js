import CaseStudyForm from "@/components/admin/casestudy/Casestudyform";

export default function CreateCaseStudyPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-3 py-6 sm:px-4 sm:py-8">
      <CaseStudyForm mode="create" />
    </div>
  );
}
