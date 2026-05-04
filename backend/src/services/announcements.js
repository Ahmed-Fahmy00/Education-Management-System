const Announcement = require("../models/Announcement");

function createAnnouncement(payload) {
  return Announcement.create(payload);
}

function listAnnouncements(query = {}) {
  return Announcement.find(query)
    .populate("course", "code title")
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
  updateAnnouncement,
  deleteAnnouncement,
};
