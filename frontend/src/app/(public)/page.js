import AboutAgencySection from "@/components/home/AboutAgencySection";
import B2BHeroSection from "@/components/home/B2BHeroSection";
import FAQSection from "@/components/home/FAQSection";
import HeadingSlider from "@/components/home/HeadingSlider";
import Hero from "@/components/home/Hero";
import KpiTabsSection from "@/components/home/KpiTabsSection";
import Portfolio from "@/components/home/Portfolio";
import { fetchPortfolios } from "@/lib/portfolio_Api";
import SEOContentSection from "@/components/home/SEOContentSection";
import ServicesSliderSection from "@/components/home/ServicesSliderSection";
import { fetchServicesForSlider } from "@/lib/serviceApi";
import StatsCounter from "@/components/home/StatsCounter";
import TestimonialSlider from "@/components/home/TestimonialSlider";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import "swiper/css/bundle";

export const metadata = {
  title:
    "Meta IT Services | Leading Workflow Automation & Digital Growth Agency",
  description:
    "Meta IT provides expert workflow automation, AI integration, and digital growth strategies to help businesses scale, reduce costs, and increase ROI.",
  keywords:
    "workflow automation, AI integration, digital growth, business process automation, Meta IT, IT solutions",
  openGraph: {
    title: "Meta IT Services | Empowering Business Automation",
    description:
      "Transform your business operations with Meta IT's intelligent workflow and AI solutions.",
    url: "https://metait.com",
    siteName: "Meta IT Services",
    images: [
      {
        url: "/meta-it-og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: "https://metait.com",
  },
};

export default async function HomePage() {
  const portfolios = await fetchPortfolios({ size: 12 });
    const sliderServices = await fetchServicesForSlider({ perPage: 12 });
  return (
    <>
      <Hero />
      <HeadingSlider />
      <StatsCounter />
      <WhyChooseUsSection />
      <KpiTabsSection />
      <AboutAgencySection />
      <ServicesSliderSection services={sliderServices} />
      <B2BHeroSection />
      <Portfolio projects={portfolios} />
      <TestimonialSlider />
      <FAQSection />
      <SEOContentSection />
    </>
  );
}

