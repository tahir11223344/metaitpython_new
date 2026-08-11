/** Chatbot leads — admin inbox. */

import apiClient from "./apiClient";

const BASE = "/chat/leads";

function toMessage(error) {
  const detail = error?.response?.data?.detail;
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

export function getLeads({ unreadOnly = false, page = 1, perPage = 20 } = {}) {
  const params = { page, per_page: perPage };
  if (unreadOnly) params.unread_only = true;
  return run(apiClient.get(BASE, { params }));
}

export function setLeadRead(id, isRead = true) {
  return run(
    apiClient.patch(`${BASE}/${id}/read`, null, {
      params: { is_read: isRead },
    }),
  );
}

export function deleteLead(id) {
  return run(apiClient.delete(`${BASE}/${id}`));
}
