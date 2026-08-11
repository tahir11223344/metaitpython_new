import PortfolioForm from "@/components/admin/portfolios/PortfolioForm";

export default function CreatePortfolioPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <PortfolioForm mode="create" />
    </div>
  );
}
