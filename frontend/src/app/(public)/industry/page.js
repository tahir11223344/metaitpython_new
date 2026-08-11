export const dynamic = "force-dynamic";
import GlobalReachHeroSection from "@/components/GlobalReachHeroSection";
import IndustriesListSection from "@/components/IndustriesListSection";
import IndustryHeroSection from "@/components/IndustryHeroSection";
import { fetchIndustries } from "@/lib/Industry_api";

const SITE_URL = "https://metaitservices.co";

export const metadata = {
  title: "Industries We Serve | Vortexian Tech",
  description:
    "Vortexian Tech delivers tailored digital, marketing, and technology solutions across diverse industries worldwide. Explore how we drive growth for your sector.",
  keywords: [
    "industries we serve",
    "digital solutions by industry",
    "Vortexian Tech industries",
    "technology solutions for businesses",
    "industry specific digital agency",
  ],
  alternates: {
    canonical: `${SITE_URL}/industry`,
  },
  openGraph: {
    title: "Industries We Serve | Vortexian Tech",
    description:
      "Explore how Vortexian Tech empowers businesses across multiple industries with innovative digital, marketing, and technology solutions.",
    url: `${SITE_URL}/industry`,
    siteName: "Vortexian Tech",
    images: [
      {
        url: `${SITE_URL}/og-images/industries-og.jpg`,
        width: 1200,
        height: 630,
        alt: "Vortexian Tech - Industries We Serve",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Industries We Serve | Vortexian Tech",
    description:
      "Explore how Vortexian Tech empowers businesses across multiple industries with tailored digital solutions.",
    images: [`${SITE_URL}/og-images/industries-og.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default async function IndustryPage() {
  // Server-side fetch => content initial HTML mein (SEO friendly)
  const industries = await fetchIndustries();

  // JSON-LD: Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Industries",
        item: `${SITE_URL}/industry`,
      },
    ],
  };

  // JSON-LD: CollectionPage â€” ab asli industries ki list ke saath
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Industries We Serve",
    description:
      "Vortexian Tech delivers tailored digital, marketing, and technology solutions across diverse industries worldwide.",
    url: `${SITE_URL}/industry`,
    isPartOf: {
      "@type": "WebSite",
      name: "Vortexian Tech",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Vortexian Tech",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: industries.map((ind, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: ind.name,
        url: `${SITE_URL}/industry/${ind.slug}`,
      })),
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionSchema),
        }}
      />

      <IndustryHeroSection />
      <GlobalReachHeroSection />
      <IndustriesListSection industries={industries} />
    </>
  );
}

