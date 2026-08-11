import { notFound } from "next/navigation";
import { fetchLegalPage } from "@/lib/Legalpage_api";

/**
 * Privacy Policy / Terms / Disclaimer — teenon public pages yahi component
 * use karte hain. Server component hai, isliye content initial HTML mein aata
 * hai (SEO friendly).
 */
export default async function LegalPage({ pageType, fallbackHeading }) {
  const page = await fetchLegalPage(pageType);

  // Dashboard mein abhi tak set nahi hua -> 404
  if (!page) notFound();

  return (
    <section className="w-full bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-[1250px]">
        <h1 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
          {page.heading || fallbackHeading}
        </h1>

        {page.subtitle ? (
          <p className="mt-3 text-base leading-relaxed text-gray-600">
            {page.subtitle}
          </p>
        ) : null}

        <div className="mt-6 h-px w-full bg-gray-200" />

        {page.content ? (
          <div
            className="legal-rte mt-8"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : null}

        <p className="mt-12 text-xs text-gray-400">
          Last updated:{" "}
          {new Date(page.updated_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Editor ke HTML ka styling */}
      <style>{`
        .legal-rte h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin: 2rem 0 0.75rem; }
        .legal-rte h2 { font-size: 1.375rem; font-weight: 700; color: #0f172a; margin: 2rem 0 0.75rem; }
        .legal-rte h3 { font-size: 1.125rem; font-weight: 700; color: #0f172a; margin: 1.5rem 0 0.5rem; }
        .legal-rte > :first-child { margin-top: 0; }
        .legal-rte p { color: #374151; line-height: 1.8; margin-bottom: 1rem; }
        .legal-rte ul { list-style: disc; padding-left: 1.5rem; margin: 0 0 1.25rem; color: #374151; line-height: 1.8; }
        .legal-rte ol { list-style: decimal; padding-left: 1.5rem; margin: 0 0 1.25rem; color: #374151; line-height: 1.8; }
        .legal-rte li { margin-bottom: 0.4rem; }
        .legal-rte li::marker { color: #f97316; }
        .legal-rte a, .legal-rte a * { color: #f97316; text-decoration: underline; }
        .legal-rte strong { font-weight: 700; color: #0f172a; }
        .legal-rte blockquote { border-left: 3px solid #e5e7eb; padding-left: 1rem; color: #6b7280; margin: 1.25rem 0; }
        .legal-rte img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1.25rem 0; }
        .legal-rte hr { border: 0; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
      `}</style>
    </section>
  );
}