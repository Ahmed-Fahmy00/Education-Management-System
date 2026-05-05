import { apiFetch } from './http'

export function getStudentCourseRequirements() {
  return apiFetch('/api/courses/requirements')
}