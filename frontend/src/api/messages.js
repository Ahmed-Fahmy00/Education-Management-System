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

export function getOutbox() {
  return apiFetch("/api/messages/outbox");
}

export function getAllChats(userName, limit = 10, skip = 0) {
  const params = new URLSearchParams({ user: userName, limit, skip });
  return apiFetch(`/api/messages/chats/all?${params}`);
}

export function getConversation(userName, otherUserName) {
  const params = new URLSearchParams({ 
    user: userName, 
    otherUser: otherUserName 
  });
  return apiFetch(`/api/messages/conversation?${params}`);
}

export function getStudents() {
  return apiFetch("/api/students");
}

export function getStaff() {
  return apiFetch("/api/staff");
}
