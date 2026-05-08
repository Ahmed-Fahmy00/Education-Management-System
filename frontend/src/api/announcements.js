import { apiFetch } from './http';

export async function createAnnouncement(data) {
  return apiFetch('/api/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAnnouncementsByCourse(courseId) {
  return apiFetch(`/api/announcements/course/${courseId}`, {
    method: 'GET',
  });
}

export async function getGeneralAnnouncements() {
  return apiFetch('/api/announcements/general', {
    method: 'GET',
  });
}

export async function getAnnouncementsByInstructor(instructorId) {
  return apiFetch(`/api/announcements/instructor/${instructorId}`, {
    method: 'GET',
  });
}

export async function updateAnnouncement(id, data) {
  return apiFetch(`/api/announcements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteAnnouncement(id) {
  return apiFetch(`/api/announcements/${id}`, {
    method: 'DELETE',
  });
}
