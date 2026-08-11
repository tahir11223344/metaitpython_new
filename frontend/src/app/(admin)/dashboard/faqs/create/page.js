import FaqForm from "@/components/admin/faqs/FaqForm";

export default function CreateFaqPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <FaqForm mode="create" />
    </div>
  );
}