export const dynamic = "force-dynamic";
// src/app/casestudies/page.js

import CaseStudiesGrid from "@/components/casestudy/CaseStudiesGrid";
import CaseStudyHeroSection from "@/components/casestudy/CaseStudyHeroSection";
import NewsletterSection from "@/components/casestudy/NewsletterSection";
import StrategySection from "@/components/casestudy/StrategySection";
import ContactCTA from "@/components/contactus/ContactCTA";
import { fetchCaseStudies } from "@/lib/Casestudy_api";

export const metadata = {
  title: "Success Stories & Case Studies | Meta IT Services",
  description:
    "Explore our real-world success stories. Discover how Meta IT has helped businesses achieve digital growth, workflow automation, and operational efficiency through our tailored solutions.",
  keywords:
    "case studies, IT success stories, business transformation, workflow automation results, Meta IT portfolio",
  openGraph: {
    title: "Proven Results: Meta IT Case Studies",
    description:
      "See how we empower businesses with intelligent IT solutions and automation.",
    url: "https://metait.com/casestudies",
    type: "website",
  },
  alternates: {
    canonical: "https://metait.com/casestudies",
  },
};

export default async function CaseStudiesPage() {
  // Server-side fetch => content initial HTML mein (SEO friendly)
  const caseStudies = await fetchCaseStudies({ size: 50 });

  return (
    <>
      <CaseStudyHeroSection />
      <section className="py-20 px-6 lg:px-20 bg-[#FCE2D6]">
        <StrategySection />
        <CaseStudiesGrid caseStudies={caseStudies} />
      </section>
      <ContactCTA />
      <NewsletterSection />
    </>
  );
}

