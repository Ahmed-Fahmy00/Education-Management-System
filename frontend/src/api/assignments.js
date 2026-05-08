import { apiFetch } from './http';

const API_BASE = '/api/assignments';

export const assignmentApi = {
  /**
   * Get all courses for dropdowns
   */
  getCourses: async () => {
    return apiFetch(`${API_BASE}/courses`);
  },

  /**
   * Get all assignments (Admin view)
   */
  getAllAssignments: async (userId, userRole) => {
    return apiFetch(API_BASE, {
      headers: {
        'x-user-id': userId,
        'x-user-role': userRole,
      },
    });
  },

  /**
   * Create a new assignment
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
   * Delete an assignment
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

  /**
   * Get courses for a specific staff member
   */
  getStaffCourses: async (staffId, userId, userRole) => {
    return apiFetch(`${API_BASE}/staff/${staffId}/courses`, {
      headers: {
        'x-user-id': userId,
        'x-user-role': userRole,
      },
    });
  },
  
  /**
   * Helper to get all staff for admin dropdown
   */
  getAllStaff: async () => {
    return apiFetch('/api/staff');
  }
};
