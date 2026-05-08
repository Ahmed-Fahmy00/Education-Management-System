import { apiFetch } from './http';

const API_BASE = '/api/office-hours';

export const officeHoursApi = {
  /**
   * Get all office hours for a specific staff member
   */
  getByStaffId: async (staffId) => {
    return apiFetch(`${API_BASE}/${staffId}`);
  },

  /**
   * Create a new office hour slot
   * Requires Professor/TA role
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
   * Delete an office hour slot
   * Requires owner Professor/TA role
   */
  delete: async (id, userId, userRole) => {
    return apiFetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': userId,
        'x-user-role': userRole,
      },
    });
  },
};
