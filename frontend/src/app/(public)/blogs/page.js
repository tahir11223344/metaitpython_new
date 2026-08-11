export const dynamic = "force-dynamic";
// src/app/blogs/page.js
import BlogHero from "@/components/blogs/BlogHero";
import LatestUpdatesSection from "@/components/blogs/LatestUpdatesSection";
import { fetchBlogs } from "@/lib/Blog_api";

const SITE_URL = "https://www.metaitservices.co";

// ---- SEO Metadata ----
export const metadata = {
  title:
    "Blog | Meta IT Services â€” Insights on AI, Automation & Digital Growth",
  description:
    "Read the latest insights from Meta IT Services on AI automation, cloud infrastructure, cybersecurity, digital marketing, and enterprise technology trends.",
  keywords: [
    "Meta IT Services blog",
    "technology blog",
    "AI automation articles",
    "digital marketing insights",
    "cybersecurity blog",
    "enterprise technology news",
  ],
  alternates: {
    canonical: `${SITE_URL}/blogs`,
  },
  openGraph: {
    title: "Blog | Meta IT Services",
    description:
      "Insights on AI, automation, cloud, cybersecurity, and digital growth from the Meta IT Services team.",
    url: `${SITE_URL}/blogs`,
    siteName: "Meta IT Services",
    images: [
      {
        url: `${SITE_URL}/images/og-blog.jpg`,
        width: 1200,
        height: 630,
        alt: "Meta IT Services Blog",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Meta IT Services",
    description:
      "Insights on AI, automation, cloud, cybersecurity, and digital growth from the Meta IT Services team.",
    images: [`${SITE_URL}/images/og-blog.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ---- Structured Data: Blog + ItemList of posts ----
function BlogJsonLd({ blogs }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Meta IT Services Blog",
    url: `${SITE_URL}/blogs`,
    blogPost: blogs.map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.shortDescription,
      url: `${SITE_URL}/blogs/${blog.slug}`,
      datePublished: blog.createdAt,
      author: {
        "@type": "Organization",
        name: "Meta IT Services",
      },
      ...(blog.image ? { image: blog.image } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function BlogPage() {
  // Server-side fetch => content initial HTML mein (SEO friendly)
  const blogs = await fetchBlogs({ size: 100 });

  return (
    <>
      <BlogJsonLd blogs={blogs} />
      <BlogHero />
      <LatestUpdatesSection blogs={blogs} />
    </>
  );
}

