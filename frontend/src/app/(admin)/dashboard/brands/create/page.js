import BrandForm from "@/components/admin/brands/Brandform";

export default function CreateBrandPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-3 py-6 sm:px-4 sm:py-8">
      <BrandForm mode="create" />
    </div>
  );
}
