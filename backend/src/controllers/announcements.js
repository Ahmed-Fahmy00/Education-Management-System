const announcementsService = require("../services/announcements");
const mongoose = require("mongoose");

async function createAnnouncement(req, res, next) {
  try {
    const { title, body, type, course } = req.body;
    const instructorId = req.user?.id;

    if (!instructorId) {
      return res.status(401).json({ message: "Instructor ID required" });
    }
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }
    if (!type || !["general", "course"].includes(type)) {
      return res.status(400).json({ message: "Valid announcement type is required" });
    }
    if (type === "course" && !course) {
      return res.status(400).json({ message: "Course ID is required for course announcements" });
    }

    const payload = {
      instructor: instructorId,
      type,
      title: title.trim(),
      body: body.trim(),
    };

    if (type === "course") {
      payload.course = course;
    }

    const row = await announcementsService.createAnnouncement(payload);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

async function listAnnouncements(req, res, next) {
  try {
    const query = {};
    if (req.query.course) query.course = req.query.course;
    if (req.query.type) query.type = req.query.type;
    const rows = await announcementsService.listAnnouncements(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getAnnouncementsByCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Valid course ID is required" });
    }
    const rows = await announcementsService.getAnnouncementsByCourse(courseId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getGeneralAnnouncements(req, res, next) {
  try {
    const rows = await announcementsService.getGeneralAnnouncements();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getAnnouncementsByInstructor(req, res, next) {
  try {
    const { instructorId } = req.params;
    if (!instructorId || !mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ message: "Valid instructor ID is required" });
    }
    const rows = await announcementsService.getAnnouncementsByInstructor(instructorId);
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
  getAnnouncementsByCourse,
  getGeneralAnnouncements,
  getAnnouncementsByInstructor,
  updateAnnouncement,
  deleteAnnouncement,
};
