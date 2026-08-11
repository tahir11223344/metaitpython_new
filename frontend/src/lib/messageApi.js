/** Contact Us page ka form. Services page wale form ke liye contactApi.js dekhein. */

import apiClient from "./apiClient";

const BASE = "/contact-messages";

function toMessage(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((e) => {
        const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : "";
        return field ? `${field}: ${e.msg}` : e.msg;
      })
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

/* ----------------------------------------------------------------- public */

export function submitContactMessage(values) {
  return run(apiClient.post(BASE, values));
}

/* ------------------------------------------------------------------ admin */

export function getContactMessages({
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

export function setMessageRead(id, isRead = true) {
  return run(
    apiClient.patch(`${BASE}/${id}/read`, null, {
      params: { is_read: isRead },
    }),
  );
}

export function deleteContactMessage(id) {
  return run(apiClient.delete(`${BASE}/${id}`));
}
