const registrationsService = require("../services/registrations");
const mongoose = require("mongoose");

async function registerStudent(req, res, next) {
  try {
    const created = await registrationsService.registerStudent(req.body);
    res.status(201).json(created);
  } catch (err) {
    if (
      err.message === "Course not available" ||
      err.message === "Course capacity reached" ||
      err.message === "Prerequisites not satisfied"
    ) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
}

async function listRegistrations(req, res, next) {
  try {
    const query = {};
    if (req.query.student) query.student = req.query.student;
    if (req.query.course) query.course = req.query.course;
    if (req.query.semester) query.semester = req.query.semester;
    const rows = await registrationsService.listRegistrations(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getStudentsInCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Valid course ID is required" });
    }
    const students = await registrationsService.getStudentsInCourse(courseId);
    res.json(students);
  } catch (err) {
    next(err);
  }
}

async function updateRegistration(req, res, next) {
  try {
    const updated = await registrationsService.updateRegistration(
      req.params.id,
      req.body,
    );
    if (!updated) {
      return res.status(404).json({ message: "Registration not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { registerStudent, listRegistrations, getStudentsInCourse, updateRegistration };
