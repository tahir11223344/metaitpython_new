// src/app/about-us/page.js
import AboutHeroSection from "@/components/about-us/AboutHeroSection";
import AboutStateSection from "@/components/about-us/AboutStateSection";
import CompanyBenefitsTabs from "@/components/about-us/Companybenefitstabs";
import GrowBrandSection from "@/components/about-us/Growbrandsection";
import MeetTheTeamSection from "@/components/about-us/Meettheteamsection";
import WhyChooseUsSection from "@/components/about-us/WhyChooseUsSection";
import B2BHeroSection from "@/components/home/B2BHeroSection";
import TestimonialSlider from "@/components/home/TestimonialSlider";
import MarketingProsSection from "@/components/services/MarketingProsSection";

const SITE_URL = "https://www.metaitservices.co";

// ---- SEO Metadata ----
export const metadata = {
    title: "About Us | Meta IT Services — Digital Marketing & IT Solutions",
    description:
        "Founded in 2022 with 15 years of prior experience, Meta IT Services has delivered 50+ complete projects and 200+ happy clients through bespoke digital marketing and IT strategies.",
    keywords: [
        "About Meta IT Services",
        "Meta IT Services company",
        "digital marketing agency about us",
        "IT solutions firm history",
        "Meta IT team",
    ],
    alternates: {
        canonical: `${SITE_URL}/about-us`,
    },
    openGraph: {
        title: "About Us | Meta IT Services",
        description:
            "Meta IT Services combines deep expertise with a relentless pursuit of client growth — discover our story, our results, and our team.",
        url: `${SITE_URL}/about-us`,
        siteName: "Meta IT Services",
        images: [
            {
                url: `${SITE_URL}/images/og-about.jpg`,
                width: 1200,
                height: 630,
                alt: "About Meta IT Services",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "About Us | Meta IT Services",
        description:
            "Founded in 2022, Meta IT Services has delivered 50+ complete projects and 200+ happy clients through bespoke digital strategies.",
        images: [`${SITE_URL}/images/og-about.jpg`],
    },
    robots: {
        index: true,
        follow: true,
    },
};

// ---- Structured Data (JSON-LD) — AboutPage + Organization ----
function AboutJsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About Meta IT Services",
        url: `${SITE_URL}/about-us`,
        mainEntity: {
            "@type": "Organization",
            name: "Meta IT Services",
            url: SITE_URL,
            foundingDate: "2022",
            description:
                "Meta IT Services is an industry-leading IT solutions and digital marketing firm delivering bespoke strategies with deep expertise and measurable ROI.",
            logo: `${SITE_URL}/images/meta-logo.png`,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export default function AboutUsPage() {
    return (
        <>
            <AboutJsonLd />
            <AboutHeroSection />

            <AboutStateSection />
            <WhyChooseUsSection />

            <CompanyBenefitsTabs />
            <B2BHeroSection />
            <GrowBrandSection />
            <MeetTheTeamSection />
            <MarketingProsSection />
            <TestimonialSlider />

        </>
    );
}