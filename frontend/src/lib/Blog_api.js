// Blog API — admin (auth wale) aur public (server-side) dono functions yahin hain.
//
//   get*   -> admin/dashboard ke liye (token bhejta hai)
//   fetch* -> public website ke liye (server component se, bina token, cached)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    null
  );
}

async function request(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  if (!isFormData && options.body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    let message =
      (data && (data.detail || data.message)) || "Something went wrong";
    if (Array.isArray(message)) {
      message = message
        .map((m) => {
          const loc = Array.isArray(m.loc) ? m.loc.slice(1).join(".") : "";
          return loc ? `${loc}: ${m.msg}` : m.msg || JSON.stringify(m);
        })
        .join(", ");
    }
    throw new Error(message);
  }

  return data;
}

export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

/* ------------------------------------------------------------------ */
/* ADMIN                                                               */
/* ------------------------------------------------------------------ */

/** Image upload karke uska stored path return karta hai */
export async function uploadImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  const data = await request("/media/image", { method: "POST", body: fd });
  return data.url;
}

/** Type dropdown ke options */
export function getBlogTypes() {
  return request("/blogs/types");
}

export function getBlogs({
  search = "",
  categoryId = undefined,
  type = "",
  isActive = undefined,
  sortDir = "desc",
  page = 1,
  size = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (categoryId) params.set("category_id", String(categoryId));
  if (type) params.set("type", type);
  if (isActive !== undefined && isActive !== "") {
    params.set("is_active", String(isActive));
  }
  params.set("sort_dir", sortDir);
  params.set("page", String(page));
  params.set("size", String(size));
  return request(`/blogs?${params.toString()}`);
}

export function getBlog(id) {
  return request(`/blogs/${id}`);
}

export function createBlog(payload) {
  return request("/blogs", { method: "POST", body: JSON.stringify(payload) });
}

export function updateBlog(id, payload) {
  return request(`/blogs/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteBlog(id) {
  return request(`/blogs/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/* PUBLIC (website) — server components se, SEO ke liye                */
/* GET /blogs aur GET /blogs/slug/{slug} PUBLIC hone chahiye           */
/* ------------------------------------------------------------------ */

export async function fetchBlogs({ categoryId, size = 50 } = {}) {
  try {
    const params = new URLSearchParams({
      is_active: "true",
      size: String(size),
      sort_dir: "desc",
    });
    if (categoryId) params.set("category_id", String(categoryId));

    const res = await fetch(`${BASE_URL}/blogs?${params.toString()}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      category: b.category?.name || "",
      type: b.type || "",
      readTime: b.read_time || "",
      image: mediaUrl(b.image),
      imageAlt: b.image_alt || b.title,
      shortDescription: b.short_description || "",
      createdAt: b.created_at,
    }));
  } catch {
    return [];
  }
}

export async function fetchBlogBySlug(slug) {
  try {
    const res = await fetch(`${BASE_URL}/blogs/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
