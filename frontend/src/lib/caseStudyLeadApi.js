/** Case study download leads (gated download). */

import apiClient from "./apiClient";

const BASE = "/case-study-leads";

function toMessage(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) =>
        Array.isArray(e.loc) ? `${e.loc[e.loc.length - 1]}: ${e.msg}` : e.msg,
      )
      .join("\n");
  }
  if (typeof detail === "string" && detail.trim()) return detail;
  return error?.message || "Request failed";
}

async function run(promise) {
  try {
    const { data } = await promise;
    return data;
  } catch (error) {
    const err = new Error(toMessage(error));
    err.status = error?.response?.status;
    throw err;
  }
}

/**
 * Lead save karta hai aur { document_url, document_name } wapas leta hai.
 * URL server se aata hai — is liye frontend ko document field ka naam guess
 * nahi karna parta.
 */
export function submitCaseStudyLead(values) {
  return run(apiClient.post(BASE, values));
}

/* ------------------------------------------------------------------ admin */

export function getCaseStudyLeads({
  search = "",
  unreadOnly = false,
  page = 1,
  perPage = 20,
} = {}) {
  const params = { page, per_page: perPage };
  if (search) params.search = search;
  if (unreadOnly) params.unread_only = true;
  return run(apiClient.get(BASE, { params }));
}

export function setCaseStudyLeadRead(id, isRead = true) {
  return run(
    apiClient.patch(`${BASE}/${id}/read`, null, {
      params: { is_read: isRead },
    }),
  );
}

export function deleteCaseStudyLead(id) {
  return run(apiClient.delete(`${BASE}/${id}`));
}
