const announcementsService = require("../services/announcements");

async function createAnnouncement(req, res, next) {
  try {
    const row = await announcementsService.createAnnouncement(req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

async function listAnnouncements(req, res, next) {
  try {
    const query = {};
    if (req.query.course) query.course = req.query.course;
    const rows = await announcementsService.listAnnouncements(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function updateAnnouncement(req, res, next) {
  try {
    const row = await announcementsService.updateAnnouncement(
      req.params.id,
      req.body,
    );
    if (!row) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
}

async function deleteAnnouncement(req, res, next) {
  try {
    const row = await announcementsService.deleteAnnouncement(req.params.id);
    if (!row) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAnnouncement,
  listAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};
