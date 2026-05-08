import { apiFetch } from "./http";

const API_BASE = "/api/students";

export const studentApi = {
  searchStudents: async (query = "") => {
    const params = new URLSearchParams();
    if (query && query.trim()) {
      params.set("q", query.trim());
    }
    return apiFetch(`${API_BASE}${params.toString() ? `?${params.toString()}` : ""}`);
  },

  getStudentById: async (id) => {
    return apiFetch(`${API_BASE}/${id}`);
  },

  updateStudent: async (id, data, userId, userRole) => {
    return apiFetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: {
        "x-user-id": userId,
        "x-user-role": userRole,
      },
      body: JSON.stringify(data),
    });
  },
};