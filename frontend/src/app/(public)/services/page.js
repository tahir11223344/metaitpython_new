export const dynamic = "force-dynamic";
// src/app/services/page.js
import B2BHeroSection from "@/components/home/B2BHeroSection";
import StatsCounter from "@/components/home/StatsCounter";
import AISection from "@/components/services/AISection";
import ConversionSection from "@/components/services/ConversionSection";
import ServicesB2BSection from "@/components/services/ServicesB2BSection";
import ServicesHeroSection from "@/components/services/ServicesHeroSection";
import ServicesList from "@/components/services/ServicesList";
import { getPublicServices } from "@/lib/serviceApi";

const SITE = "https://www.metaitservices.co";

// Page har 5 minute baad regenerate hoga â€” admin se service add karne ke baad
// itni der me live ho jayegi.
export const revalidate = 300;

// ---- SEO Metadata (Next.js App Router) ----
export const metadata = {
  title: "Our Services | Meta IT Services â€” AI, Automation & Digital Growth",
  description:
    "Explore Meta IT Services' full range of solutions: workflow automation, data analytics, custom software development, cloud infrastructure, cybersecurity, and UI/UX design â€” built to scale your business.",
  keywords: [
    "Meta IT services",
    "workflow automation services",
    "data analytics services",
    "custom software development",
    "cloud infrastructure migration",
    "cybersecurity risk management",
    "UI/UX design agency",
    "AI automation company",
  ],
  alternates: {
    canonical: `${SITE}/services`,
  },
  openGraph: {
    title: "Our Services | Meta IT Services",
    description:
      "From AI automation to cloud migration â€” discover how Meta IT Services helps businesses scale smarter, faster, and more securely.",
    url: `${SITE}/services`,
    siteName: "Meta IT Services",
    images: [
      {
        url: `${SITE}/images/og-services.jpg`,
        width: 1200,
        height: 630,
        alt: "Meta IT Services â€” Our Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Services | Meta IT Services",
    description:
      "Explore Meta IT Services' full range of AI, automation, cloud, and digital growth solutions.",
    images: [`${SITE}/images/og-services.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ---- Structured Data (JSON-LD) â€” lists all services for rich results ----
function ServicesJsonLd({ services }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Meta IT Services â€” Our Services",
    url: `${SITE}/services`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: service.title,
          description: service.short_description || undefined,
          url: `${SITE}/services/${service.slug}`,
          provider: {
            "@type": "Organization",
            name: "Meta IT Services",
            url: SITE,
          },
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ---- Breadcrumb Structured Data ----
function BreadcrumbJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: `${SITE}/services`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ServicesPage() {
  // Ek hi baar fetch â€” JSON-LD aur ServicesList dono isi ko use karte hain
  let services = [];
  let loadError = null;
  try {
    const data = await getPublicServices();
    services = data.items || [];
  } catch (err) {
    loadError = err.message;
    console.error("[ServicesPage] Failed to load services:", err.message);
  }

  return (
    <main>
      {services.length > 0 && <ServicesJsonLd services={services} />}
      <BreadcrumbJsonLd />
      <ServicesHeroSection />
      <StatsCounter />
      <ServicesList services={services} error={loadError} />
      <AISection />
      <ServicesB2BSection />
      <ConversionSection />
      <B2BHeroSection />
    </main>
  );
}

