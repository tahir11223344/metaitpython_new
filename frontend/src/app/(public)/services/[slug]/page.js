// src/app/services/[slug]/page.js
import { cache } from "react";
import { notFound } from "next/navigation";

import ServicesSliderSection from "@/components/home/ServicesSliderSection";
import TestimonialSlider from "@/components/home/TestimonialSlider";
import AutomationDesign from "@/components/services/AutomationDesign";
import AutomationSection from "@/components/services/AutomationSection";
import ContactFormSection from "@/components/services/ContactFormSection";
import MarketingProsSection from "@/components/services/MarketingProsSection";
import ServicesDetailHeroSection from "@/components/services/ServicesDetailHeroSection";
import ServicesDetailView from "@/components/services/ServicesDetailView";
import {
  getPublicService,
  getPublicServices,
  mediaUrl,
} from "@/lib/serviceApi";
import ServiceFAQSection from "@/components/services/Servicefaqsection";

const SITE = "https://www.metaitservices.co";

export const revalidate = 300;

// Build ke baad admin se nayi service add ho to wo bhi on-demand render ho jayegi
export const dynamicParams = true;

/**
 * `cache()` is liye ke generateMetadata aur Page dono ise call karte hain —
 * warna har request par do fetch jatin.
 *
 * 404 par `null` return hota hai. Baqi errors (500, network) throw hote hain,
 * kyunke backend down hone par notFound() dikhana ghalat hoga — Next us 404 ko
 * cache kar leta hai aur backend wapas aane par bhi page missing rehta hai.
 */
const loadService = cache(async (slug) => {
  try {
    return await getPublicService(slug);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
});

// ---- SEO Metadata ----
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await loadService(slug);

  if (!service) {
    return {
      title: "Service Not Found | Meta IT Services",
      description: "The requested service could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE}/services/${service.slug}`;

  // Admin ke SEO fields pehle, warna page content se fallback
  const title =
    service.meta_title?.trim() || `${service.title} | Meta IT Services`;
  const description =
    service.meta_description?.trim() ||
    service.short_description?.trim() ||
    `Explore our professional ${service.title} services at Meta IT.`;

  const image = service.thumbnail
    ? mediaUrl(service.thumbnail)
    : `${SITE}/images/og-services.jpg`;

  return {
    title,
    description,
    keywords: service.meta_keyword
      ? service.meta_keyword
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Meta IT Services",
      images: [{ url: image, alt: service.thumbnail_alt || service.title }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export async function generateStaticParams() {
  try {
    // Build ke waqt fresh list chahiye, cached nahi
    const data = await getPublicServices({ revalidate: 0 });
    return (data.items || []).map((service) => ({ slug: service.slug }));
  } catch (err) {
    // Build ke waqt backend na chale to build fail na ho — pages on-demand ban jayenge
    console.warn("[services/[slug]] Could not prebuild slugs:", err.message);
    return [];
  }
}

// ---- Structured Data ----
function ServiceJsonLd({ service }) {
  const url = `${SITE}/services/${service.slug}`;

  const graph = [
    {
      "@type": "Service",
      name: service.title,
      description: service.short_description || undefined,
      url,
      image: service.thumbnail ? mediaUrl(service.thumbnail) : undefined,
      provider: {
        "@type": "Organization",
        name: "Meta IT Services",
        url: SITE,
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        {
          "@type": "ListItem",
          position: 2,
          name: "Services",
          item: `${SITE}/services`,
        },
        { "@type": "ListItem", position: 3, name: service.title, item: url },
      ],
    },
  ];

  // FAQPage schema Google me rich results deta hai — admin ki FAQs se seedha banta hai
  const faqs = (service.faqs || []).filter(
    (f) => f.question?.trim() && f.answer?.trim(),
  );
  if (faqs.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}

export default async function Page({ params }) {
  const { slug } = await params;
  const service = await loadService(slug);

  if (!service) return notFound();

  return (
    <>
      <ServiceJsonLd service={service} />
      <ServicesDetailHeroSection service={service} />
      <ServicesDetailView service={service} />
      <AutomationSection section={service.section_one} />
      <AutomationDesign section={service.section_two} />
      <MarketingProsSection />
      <ContactFormSection />
      <ServicesSliderSection />
      <TestimonialSlider />
      <ServiceFAQSection faqs={service.faqs} />
    </>
  );
}
