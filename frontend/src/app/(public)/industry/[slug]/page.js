import { notFound } from "next/navigation";
import IndustryDetailSection from "@/components/IndustryDetailSection";
import IndustryFAQSection from "@/components/IndustryFAQSection";
import WhySelectMetaITSection from "@/components/WhySelectMetaITSection";
import IndustryFAQTextSection from "@/components/IndustryFAQTextSection";
import ProjectCTASection from "@/components/ProjectCTASection";
import IndustryDetailHeroSection from "@/components/IndustryDetailHeroSection";
import {
  fetchIndustries,
  fetchIndustryBySlug,
  mediaUrl,
} from "@/lib/Publicindustry_api";

const SITE_URL = "https://metaitservices.co";

const byOrder = (a, b) => (a.sort_order || 0) - (b.sort_order || 0);

/**
 * Build time pe saare slugs API se aate hain.
 * API na chale to [] return hota hai — page phir bhi on-demand render ho jata hai.
 */
export async function generateStaticParams() {
  const industries = await fetchIndustries();
  return industries.map((industry) => ({ slug: industry.slug }));
}

/**
 * SEO — dashboard ke Meta Title / Meta Description / Meta Keyword use hote hain,
 * na hon to name/description fallback.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const industry = await fetchIndustryBySlug(slug);

  if (!industry) {
    return {
      title: "Industry Not Found | Vortexian Tech",
      robots: { index: false, follow: false },
    };
  }

  const title = industry.meta_title || `${industry.name} | Vortexian Tech`;
  const description = industry.meta_description || industry.description || "";
  const url = `${SITE_URL}/industry/${industry.slug}`;
  const image = industry.image ? mediaUrl(industry.image) : null;

  return {
    title,
    description,
    keywords: industry.meta_keyword
      ? industry.meta_keyword
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
      : undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Vortexian Tech",
      type: "website",
      locale: "en_US",
      ...(image
        ? {
            images: [
              {
                url: image,
                width: 1200,
                height: 630,
                alt: industry.image_alt || industry.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
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
}

export default async function IndustryDetailPage({ params }) {
  const { slug } = await params;
  const industry = await fetchIndustryBySlug(slug);

  // Slug galat ya industry inactive -> 404
  if (!industry) notFound();

  const sd = industry.sub_details || {};
  const hero = sd.hero || {};
  const accordion = sd.accordion || {};
  const services = sd.services || {};

  /**
   * FAQs — accordion items (title/content) hi sabse behtar FAQ source hain.
   *
   * NOTE: aapke IndustryFAQTextSection ka expected shape mujhe nahi pata, isliye
   * neeche teenon common naming conventions daal di hain (q/a, question/answer,
   * title/content). Component jo bhi padta hai, chal jayega — baaki keys hata dein.
   */
  const faqs = [...(accordion.items || [])].sort(byOrder).map((item) => ({
    q: item.title,
    a: item.content,
    question: item.title,
    answer: item.content,
    title: item.title,
    content: item.content,
  }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Industries",
        item: `${SITE_URL}/industry`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: industry.name,
        item: `${SITE_URL}/industry/${industry.slug}`,
      },
    ],
  };

  // Accordion items se FAQPage schema — Google rich results ke liye
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs
            .filter((f) => f.q && f.a)
            .map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <IndustryDetailHeroSection
        title={hero.title || `${industry.name} Digital Marketing`}
        description={hero.side_description || industry.description}
        kicker={hero.kicker}
        sideTitle={hero.side_title}
        bottomText={hero.bottom_text}
      />

      {/* `industry` prop pass kiya hai — is component ko static data ki jagah
                yahi data use karna chahiye (neeche README note dekhein) */}
      <IndustryDetailSection slug={slug} industry={industry} />

      <IndustryFAQSection
        logo={accordion.image ? mediaUrl(accordion.image) : undefined}
        title={accordion.section_title || `${industry.name} Digital Marketing`}
        description={accordion.section_description || industry.description}
        faqs={faqs}
      />

      <WhySelectMetaITSection
        heading={
          sd.tabs?.section_title ||
          `Why Select Meta IT As Your ${industry.name} Agency?`
        }
        tabs={[...(sd.tabs?.items || [])].sort(byOrder)}
      />

      <IndustryFAQTextSection
        title={sd.services?.title || `${industry.name} IT Solutions`}
        subtitle={
          sd.services?.highlight_text ||
          `Meta IT Services Serve ${industry.name}`
        }
        description={sd.services?.description || industry.description}
        faqs={[...(sd.services?.items || [])].sort(byOrder)}
      />

      <ProjectCTASection />
      {/* <ProjectCTASection
        title={sd.experience?.title || "Have A Project In Mind?"}
        buttonText={sd.experience?.cta_label || "Contact Us"}
        buttonLink={sd.experience?.cta_url || "/contact-us"}
        images={sd.experience?.images || []}
      /> */}
    </>
  );
}
