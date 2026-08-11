// src/app/portfolio/page.js
import ContactCTA from "@/components/contactus/ContactCTA";
import PortfolioHero from "@/components/portfolio/PortfolioHero";
import PortfolioSection from "@/components/portfolio/PortfolioSection";

export const metadata = {
  title: "Our Portfolio | Work & Success Stories | Meta IT Services",
  description:
    "Explore the innovative projects and successful case studies delivered by Meta IT. See how we help businesses grow with workflow automation, AI, and digital transformation.",
  keywords:
    "Meta IT portfolio, digital transformation projects, automation case studies, IT success stories, business software solutions",
  openGraph: {
    title: "Our Portfolio | Meta IT Services",
    description:
      "Explore our latest projects and see how we solve complex business challenges with technology.",
    url: "https://metait.com/portfolio",
    type: "website",
  },
  alternates: {
    canonical: "https://metait.com/portfolio",
  },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

// Server-side fetch => data initial HTML mein aata hai (SEO friendly).
// revalidate: har 60s baad refresh (ISR). GET /portfolios PUBLIC hona chahiye.
async function getPortfolios() {
  try {
    const res = await fetch(`${API_URL}/portfolios?size=100&sort_dir=desc`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || [])
      .filter((p) => p.is_active) // sirf active portfolios public pe
      .map((p) => ({
        id: p.id,
        title: p.title,
        desc: p.subtitle || "",
        fullDesc: p.description || "", // HTML (rich editor se)
        category: p.category?.name || "",
        thumbnail: mediaUrl(p.thumbnail),
        gallery: (p.gallery_images || []).map(mediaUrl),
        imageAlt: p.image_alt || p.title,
      }));
  } catch {
    return [];
  }
}

export default async function PortfolioPage() {
  const portfolios = await getPortfolios();

  return (
    <>
      <PortfolioHero />
      <PortfolioSection items={portfolios} />
      <ContactCTA />
    </>
  );
}
