import { apiFetch } from './http'

export function getStudentCourseRequirements() {
  return apiFetch('/api/courses/requirements')
}

export function getCoursesByInstructorId(instructorId) {
  return apiFetch(`/api/courses/instructor/${instructorId}`)
}

export function getCourseById(courseId) {
  return apiFetch(`/api/courses/${courseId}`)
}

export function getAllCourses() {
  return apiFetch('/api/courses')
}