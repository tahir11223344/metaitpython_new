// src/app/(public)/services/[slug]/[subSlug]/page.js

import { cache } from "react";
import { notFound } from "next/navigation";

import SubServiceHero from "@/components/services/SubServiceHero";
import ServiceContentSection from "@/components/services/ServiceContentSection";
import TestimonialSlider from "@/components/home/TestimonialSlider";
import ServicesSliderSection from "@/components/home/ServicesSliderSection";

import {
  getPublicService,
  getPublicServices,
  mediaUrl,
} from "@/lib/serviceApi";
import { getPublicSubService } from "@/lib/subServiceApi";
import ServiceFAQSection from "@/components/services/Servicefaqsection";

const SITE = "https://www.metaitservices.co";

export const revalidate = 300;
export const dynamicParams = true;

/**
 * `cache()` is liye ke generateMetadata aur Page dono inhe call karte hain —
 * warna har request par do-do fetch jatin.
 *
 * 404 par null. Baqi errors throw hote hain, kyunke backend down hone par
 * notFound() dikhana ghalat hai — Next us 404 ko cache kar leta hai aur backend
 * wapas aane par bhi page missing rehta hai.
 */
const loadSubService = cache(async (serviceSlug, subSlug) => {
  try {
    return await getPublicSubService(serviceSlug, subSlug);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
});

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
  const { slug, subSlug } = await params;

  const [subService, parentService] = await Promise.all([
    loadSubService(slug, subSlug),
    loadService(slug),
  ]);

  if (!subService || !parentService) {
    return {
      title: "Service Not Found | Meta IT Services",
      description: "The requested service could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE}/services/${slug}/${subSlug}`;

  // Admin ke SEO fields pehle, warna page content se fallback
  const title =
    subService.meta_title?.trim() ||
    `${subService.title} | ${parentService.title} | Meta IT Services`;

  const description =
    subService.meta_description?.trim() ||
    subService.short_description?.trim() ||
    subService.hero_section?.short_description?.trim() ||
    `Explore our ${subService.title} solutions under ${parentService.title} at Meta IT.`;

  const image = subService.icon
    ? mediaUrl(subService.icon)
    : `${SITE}/images/og-services.jpg`;

  return {
    title,
    description,
    keywords: subService.meta_keyword
      ? subService.meta_keyword
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
      images: [{ url: image, alt: subService.title }],
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
    // Build ke waqt fresh data chahiye, cached nahi
    const services = await getPublicServices({ revalidate: 0 });

    const nested = await Promise.all(
      (services.items || []).map(async (service) => {
        const full = await getPublicService(service.slug, { revalidate: 0 });
        return (full.sub_services || []).map((sub) => ({
          slug: service.slug,
          subSlug: sub.slug,
        }));
      }),
    );

    return nested.flat();
  } catch (err) {
    // Build ke waqt backend na chale to build fail na ho — pages on-demand banenge
    console.warn(
      "[services/[slug]/[subSlug]] Could not prebuild slugs:",
      err.message,
    );
    return [];
  }
}

// ---- Structured Data ----
function SubServiceJsonLd({ subService, parentService }) {
  const url = `${SITE}/services/${parentService.slug}/${subService.slug}`;

  const graph = [
    {
      "@type": "Service",
      name: subService.title,
      description: subService.short_description || undefined,
      url,
      image: subService.icon ? mediaUrl(subService.icon) : undefined,
      isPartOf: {
        "@type": "Service",
        name: parentService.title,
        url: `${SITE}/services/${parentService.slug}`,
      },
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
        {
          "@type": "ListItem",
          position: 3,
          name: parentService.title,
          item: `${SITE}/services/${parentService.slug}`,
        },
        { "@type": "ListItem", position: 4, name: subService.title, item: url },
      ],
    },
  ];

  const faqs = (subService.faqs || []).filter(
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

export default async function SubServicePage({ params }) {
  const { slug, subSlug } = await params;

  const [subService, parentService] = await Promise.all([
    loadSubService(slug, subSlug),
    loadService(slug),
  ]);

  if (!subService || !parentService) return notFound();

  return (
    <>
      <SubServiceJsonLd subService={subService} parentService={parentService} />

      <SubServiceHero subService={subService} parentService={parentService} />

      <ServiceContentSection
        heading={subService.title}
        description={subService.short_description}
        solutionsTitle={subService.campaign_section?.title}
        solutions={subService.campaign_section?.points || []}
        processTitle={subService.development_process?.title}
        processSteps={subService.development_process?.steps || []}
        commitments={subService.commitments_section}
        whyChoose={subService.why_choose_section}
      />

      <TestimonialSlider />
      <ServiceFAQSection faqs={subService.faqs} />
      <ServicesSliderSection />
    </>
  );
}
