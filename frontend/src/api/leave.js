import { apiFetch } from './http';

const API_BASE = '/api/leave';

export const leaveApi = {
  /**
   * Submit a new leave request
   */
  create: async (data, userId, userRole) => {
    return apiFetch(API_BASE, {
      method: 'POST',
      headers: {
        'x-user-id': userId,
        'x-user-role': userRole,
      },
      body: JSON.stringify(data),
    });
  },

  /**
   * Get own leave requests
   */
  getMyRequests: async (userId, userRole) => {
    return apiFetch(`${API_BASE}/my`, {
      headers: {
        'x-user-id': userId,
        'x-user-role': userRole,
      },
    });
  },

  /**
   * Get all leave requests (Admin only)
   */
  getAllRequests: async (userId, userRole, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`${API_BASE}${query ? `?${query}` : ''}`, {
      headers: {
        'x-user-id': userId,
        'x-user-role': userRole,
      },
    });
  },

  /**
   * Update status (Admin only)
   */
  updateStatus: async (id, status, reason, userId, userRole) => {
    return apiFetch(`${API_BASE}/${id}/status`, {
      method: 'PUT',
      headers: {
        'x-user-id': userId,
        'x-user-role': userRole,
      },
      body: JSON.stringify({ status, reason }),
    });
  },
};
