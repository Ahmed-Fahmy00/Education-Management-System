import { apiFetch } from "./http";

export function sendMessage(payload) {
  return apiFetch("/api/messages", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getInbox() {
  return apiFetch("/api/messages/inbox");
}

export function getStudents() {
  return apiFetch("/api/students");
}
