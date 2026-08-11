// Industry API — admin (auth wale) aur public (server-side) dono functions yahin hain.
//
// Naming convention:
//   get*   -> admin/dashboard ke liye (token bhejta hai)
//   fetch* -> public website ke liye (server component se, bina token, cached)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  // Agar aapki app token kisi aur key pe rakhti hai to yahan badlein
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
      // FastAPI validation errors: field ka naam bhi dikhayein
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

/** Relative path ko full URL banata hai: "/uploads/x.jpg" -> "http://host/uploads/x.jpg" */
export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

/* ------------------------------------------------------------------ */
/* ADMIN (dashboard) — auth token ke saath                             */
/* ------------------------------------------------------------------ */

/** Ek image upload karke uska stored path return karta hai ("/uploads/editor/x.jpg") */
export async function uploadImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  const data = await request("/media/image", { method: "POST", body: fd });
  return data.url;
}

export function getIndustries({
  search = "",
  isActive = undefined,
  sortDir = "desc",
  page = 1,
  size = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive !== undefined && isActive !== "") {
    params.set("is_active", String(isActive));
  }
  params.set("sort_dir", sortDir);
  params.set("page", String(page));
  params.set("size", String(size));
  return request(`/industries?${params.toString()}`);
}

export function getIndustry(id) {
  return request(`/industries/${id}`);
}

export function createIndustry(payload) {
  return request("/industries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateIndustry(id, payload) {
  return request(`/industries/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteIndustry(id) {
  return request(`/industries/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/* PUBLIC (website) — server components se, SEO ke liye                */
/* GET /industries aur GET /industries/slug/{slug} PUBLIC hone chahiye */
/* ------------------------------------------------------------------ */

/** List page ke liye — sirf active industries, ready-to-render shape mein */
export async function fetchIndustries() {
  try {
    const res = await fetch(
      `${BASE_URL}/industries?is_active=true&size=100&sort_dir=asc`,
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
    const res = await fetch(`${BASE_URL}/industries/slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
