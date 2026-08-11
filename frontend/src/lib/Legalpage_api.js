// Legal Pages API (Privacy Policy / Terms / Disclaimer).
//
//   get*   -> admin/dashboard ke liye (token bhejta hai)
//   fetch* -> public website ke liye (server component se, bina token, cached)

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    null
  );
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  if (options.body) headers["Content-Type"] = "application/json";

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

/* ---------------- ADMIN ---------------- */

/** Saare legal pages (jo abhi tak nahi bhare gaye wo bhi, exists:false ke saath) */
export function getLegalPages() {
  return request("/legal-pages");
}

export function getLegalPageTypes() {
  return request("/legal-pages/types");
}

/** Ek page — abhi tak configure na hua ho to null */
export async function getLegalPage(pageType) {
  try {
    return await request(`/legal-pages/${pageType}`);
  } catch (e) {
    if ((e.message || "").toLowerCase().includes("not configured")) return null;
    throw e;
  }
}

/** Upsert — record na ho to ban jata hai, ho to update */
export function saveLegalPage(pageType, payload) {
  return request(`/legal-pages/${pageType}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/* ---------------- PUBLIC (server-side) ---------------- */

export async function fetchLegalPage(pageType) {
  try {
    const res = await fetch(`${BASE_URL}/legal-pages/${pageType}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
