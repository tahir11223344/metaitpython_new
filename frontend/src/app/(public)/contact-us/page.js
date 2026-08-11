// src/app/contact/page.js

import ContactHero from "@/components/contactus/ContactHero";
import ContactUsSection from "@/components/contactus/ContactUsSection";
import MapSection from "@/components/contactus/MapSection";

// ---- SEO Metadata (Next.js App Router) ----
export const metadata = {
    title: "Contact Us | Meta IT Services — Get a Free Consultation",
    description:
        "Get in touch with Meta IT Services for AI automation, workflow, cloud, and digital marketing solutions. Call +1 (469) 767 8853 or email contact@metaitservices.co — response within 24 hours.",
    keywords: [
        "contact Meta IT Services",
        "Meta IT consultation",
        "workflow automation agency contact",
        "digital marketing agency Garland TX",
        "IT services contact",
    ],
    alternates: {
        canonical: "https://www.metaitservices.co/contact",
    },
    openGraph: {
        title: "Contact Us | Meta IT Services",
        description:
            "Ready to start your project? Reach out to Meta IT Services today for a free consultation on automation, AI, and digital growth solutions.",
        url: "https://www.metaitservices.co/contact",
        siteName: "Meta IT Services",
        images: [
            {
                url: "https://www.metaitservices.co/images/og-contact.jpg",
                width: 1200,
                height: 630,
                alt: "Contact Meta IT Services",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact Us | Meta IT Services",
        description:
            "Get in touch with Meta IT Services for AI automation, workflow, cloud, and digital marketing solutions.",
        images: ["https://www.metaitservices.co/images/og-contact.jpg"],
    },
    robots: {
        index: true,
        follow: true,
    },
};

// ---- Structured Data (JSON-LD) — helps Google show rich contact info ----
function ContactJsonLd() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact Meta IT Services",
        url: "https://www.metaitservices.co/contact",
        mainEntity: {
            "@type": "Organization",
            name: "Meta IT Services",
            email: "contact@metaitservices.co",
            telephone: "+1-469-767-8853",
            url: "https://www.metaitservices.co",
            address: {
                "@type": "PostalAddress",
                streetAddress: "555 N. 5th St, Suite 109",
                addressLocality: "Garland",
                addressRegion: "TX",
                postalCode: "75040",
                addressCountry: "US",
            },
            openingHours: "Mo-Fr 09:00-18:00",
            sameAs: [
                "https://www.facebook.com/metaitservices",
                "https://twitter.com/metaitservices",
                "https://www.linkedin.com/company/metaitservices",
                "https://www.instagram.com/metaitservices",
            ],
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export default function ContactUsPage() {
    return (
        <div className="w-full max-w-full">
            <ContactJsonLd />
            <ContactHero />


            <ContactUsSection />
            <MapSection />
        
        </div>
    );
}