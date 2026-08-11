// src/app/blogs/[slug]/page.js
import BlogDetailHero from "@/components/blogs/BlogDetailHero";
import BlogContent from "@/components/blogs/BlogContent";
import { fetchBlogs, fetchBlogBySlug, mediaUrl } from "@/lib/Blog_api";
import { notFound } from "next/navigation";

const SITE_URL = "https://www.metaitservices.co";

/**
 * API ke blog ko component-friendly shape mein badalta hai.
 *
 * Purane static data ke field names (excerpt/date/content/author) bhi saath rakhe
 * hain, taake BlogDetailHero / BlogContent jo bhi padhein, chal jaye.
 */
function normalizeBlog(raw) {
  if (!raw) return null;

  const image = raw.image ? mediaUrl(raw.image) : "";

  return {
    ...raw,

    // API fields (as-is)
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    image,
    image_alt: raw.image_alt || raw.title,

    // Legacy aliases (purane static data jaise)
    excerpt: raw.short_description || "",
    content: raw.description || "", // rich text HTML
    body: raw.description || "",
    category: raw.category?.name || "",
    categoryObj: raw.category || null,
    date: raw.created_at,
    readTime: raw.read_time || "",
    // Blog model mein author field nahi hai — Organization use kar rahe hain
    author: "Meta IT Services",
  };
}

export async function generateStaticParams() {
  const blogs = await fetchBlogs({ size: 100 });
  return blogs.map((blog) => ({ slug: blog.slug }));
}

// ---- Dynamic SEO Metadata — dashboard ke Meta fields se ----
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const raw = await fetchBlogBySlug(slug);

  if (!raw) {
    return {
      title: "Blog Not Found | Meta IT Services",
      robots: { index: false, follow: false },
    };
  }

  const blog = normalizeBlog(raw);
  const pageUrl = `${SITE_URL}/blogs/${blog.slug}`;
  const ogImage = blog.image || `${SITE_URL}/images/og-blog.jpg`;

  const title = blog.meta_title || `${blog.title} | Meta IT Services Blog`;
  const description = blog.meta_description || blog.excerpt || "";

  const keywords = blog.meta_keyword
    ? blog.meta_keyword
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : [blog.title, blog.category, "Meta IT Services", "blog"].filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: blog.meta_title || blog.title,
      description,
      url: pageUrl,
      siteName: "Meta IT Services",
      images: [{ url: ogImage, width: 1200, height: 630, alt: blog.title }],
      locale: "en_US",
      type: "article",
      publishedTime: blog.created_at,
      modifiedTime: blog.updated_at,
      authors: [blog.author],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.meta_title || blog.title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ---- Structured Data: Article + Breadcrumb ----
function ArticleJsonLd({ blog }) {
  const pageUrl = `${SITE_URL}/blogs/${blog.slug}`;
  const ogImage = blog.image || `${SITE_URL}/images/og-blog.jpg`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.meta_description || blog.excerpt,
    image: ogImage,
    datePublished: blog.created_at,
    dateModified: blog.updated_at || blog.created_at,
    author: {
      "@type": "Organization",
      name: blog.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Meta IT Services",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/meta-logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    ...(blog.category ? { articleSection: blog.category } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blogs`,
      },
      { "@type": "ListItem", position: 3, name: blog.title, item: pageUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const raw = await fetchBlogBySlug(slug);

  // Slug galat ya blog inactive -> 404
  if (!raw) return notFound();

  const blog = normalizeBlog(raw);

  return (
    <>
      <ArticleJsonLd blog={blog} />
      <BlogDetailHero blog={blog} />
      <BlogContent blog={blog} />
    </>
  );
}
