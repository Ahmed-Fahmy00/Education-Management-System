const Announcement = require("../models/Announcement");

function createAnnouncement(payload) {
  return Announcement.create(payload);
}

function listAnnouncements(query = {}) {
  return Announcement.find(query)
    .populate("course", "code title")
    .populate("instructor", "name email")
    .sort({ createdAt: -1 });
}

function getAnnouncementsByCourse(courseId) {
  return Announcement.find({ type: "course", course: courseId })
    .populate("course", "code title")
    .populate("instructor", "name email")
    .sort({ createdAt: -1 });
}

function getGeneralAnnouncements() {
  return Announcement.find({ type: "general" })
    .populate("instructor", "name email")
    .sort({ createdAt: -1 });
}

function getAnnouncementsByInstructor(instructorId) {
  return Announcement.find({ instructor: instructorId })
    .populate("course", "code title")
    .populate("instructor", "name email")
    .sort({ createdAt: -1 });
}

function updateAnnouncement(id, payload) {
  return Announcement.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
}

function deleteAnnouncement(id) {
  return Announcement.findByIdAndDelete(id);
}

module.exports = {
  createAnnouncement,
  listAnnouncements,
  getAnnouncementsByCourse,
  getGeneralAnnouncements,
  getAnnouncementsByInstructor,
  updateAnnouncement,
  deleteAnnouncement,
};
