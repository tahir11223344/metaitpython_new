// Case Study API — admin CRUD + file upload helpers.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  // Aapki app token "token" key pe rakhti hai (RichTextEditor jaisa)
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
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

/** Image upload -> { url, name, size } */
export async function uploadImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  return request("/media/image", { method: "POST", body: fd });
}

/** Document upload (PDF/DOC/XLS...) -> { url, name, size } */
export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  return request("/media/file", { method: "POST", body: fd });
}

export function getCaseStudies({
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
  return request(`/case-studies?${params.toString()}`);
}

export function getCaseStudy(id) {
  return request(`/case-studies/${id}`);
}

export function createCaseStudy(payload) {
  return request("/case-studies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCaseStudy(id, payload) {
  return request(`/case-studies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteCaseStudy(id) {
  return request(`/case-studies/${id}`, { method: "DELETE" });
}

/* ---------------- PUBLIC (website, server-side) ---------------- */

export async function fetchCaseStudies({ size = 50 } = {}) {
  try {
    const res = await fetch(
      `${BASE_URL}/case-studies?is_active=true&size=${size}&sort_dir=desc`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((cs) => ({
      id: cs.id,
      title: cs.title,
      subtitle: cs.subtitle || "",
      image: mediaUrl(cs.image),
      imageAlt: cs.image_alt || cs.title,
      document: mediaUrl(cs.document),
      documentName: cs.document_name || "",
      description: cs.description || "",
      createdAt: cs.created_at,
    }));
  } catch {
    return [];
  }
}
