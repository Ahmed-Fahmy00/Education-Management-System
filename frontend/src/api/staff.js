import { apiFetch } from './http';

const API_BASE = '/api/staff';

export const staffApi = {
  /**
   * Search and filter profiles
   */
  getProfiles: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`${API_BASE}${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single profile by ID
   */
  getProfileById: async (id) => {
    return apiFetch(`${API_BASE}/${id}`);
  },

  /**
   * Create a new profile
   */
  createProfile: async (data, userId, userRole) => {
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
   * Update an existing profile
   */
  updateProfile: async (id, data, userId, userRole) => {
    return apiFetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'x-user-id': userId,
        'x-user-role': userRole,
      },
      body: JSON.stringify(data),
    });
  },
};
