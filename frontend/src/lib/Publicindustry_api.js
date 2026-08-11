// Public (server-side) industry fetching — SEO ke liye.
// GET /industries aur GET /industries/slug/{slug} PUBLIC hone chahiye.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

/** List page ke liye — sirf active industries */
export async function fetchIndustries() {
  try {
    const res = await fetch(
      `${API_URL}/industries?is_active=true&size=100&sort_dir=asc`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((it) => ({
      id: it.id,
      name: it.name,
      slug: it.slug,
      description: it.description || "",
      image: mediaUrl(it.image),
      image_alt: it.image_alt || it.name,
    }));
  } catch {
    return [];
  }
}

/** Detail page ke liye — slug se poora record (sub_details ke saath) */
export async function fetchIndustryBySlug(slug) {
  try {
    const res = await fetch(`${API_URL}/industries/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
