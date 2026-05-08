import { apiFetch } from "./http";

export function registerStudentEnrollment({ student, course, semester }) {
  return apiFetch("/api/registrations", {
    method: "POST",
    body: JSON.stringify({ student, course, semester }),
  });
}

export function listRegistrations(query = "") {
  const path = query ? `/api/registrations?${query}` : "/api/registrations";
  return apiFetch(path);
}

export function getStudentsInCourse(courseId) {
  return apiFetch(`/api/registrations/course/${courseId}/students`);
}

export function updateRegistration(registrationId, payload) {
  return apiFetch(`/api/registrations/${registrationId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function dropStudentEnrollment(registrationId) {
  return updateRegistration(registrationId, { status: "dropped" });
}

export function gradeStudent(registrationId, grade) {
  return apiFetch(`/api/registrations/${registrationId}/grade`, {
    method: "PATCH",
    body: JSON.stringify({ grade }),
  });
}

export function completeCourse(courseId) {
  return apiFetch(`/api/registrations/course/${courseId}/complete`, {
    method: "POST",
  });
}
