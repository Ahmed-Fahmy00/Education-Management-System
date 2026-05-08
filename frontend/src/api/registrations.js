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

export function getStudentsInCourse(courseId) {
  return apiFetch(`/api/registrations/course/${courseId}/students`)
}

export function updateRegistrationGrade(registrationId, { grade, status }) {
  const payload = {}
  if (grade !== undefined) payload.grade = grade
  if (status !== undefined) payload.status = status
  return apiFetch(`/api/registrations/${registrationId}/grade`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
