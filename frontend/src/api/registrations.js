import { apiFetch } from './http'

export function registerStudentEnrollment({ student, course, semester }) {
  return apiFetch('/api/registrations', {
    method: 'POST',
    body: JSON.stringify({ student, course, semester }),
  })
}

export function listRegistrations(query = '') {
  const path = query ? `/api/registrations?${query}` : '/api/registrations'
  return apiFetch(path)
}
