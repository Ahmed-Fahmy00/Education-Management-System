const registrationsService = require("../services/registrations");
const transcriptsService = require("../services/transcripts");
const mongoose = require("mongoose");

async function registerStudent(req, res, next) {
  try {
    const created = await registrationsService.registerStudent(req.body);
    res.status(201).json(created);
  } catch (err) {
    if (
      err.message === "Course not available" ||
      err.message === "Course capacity reached" ||
      err.message === "Prerequisites not satisfied" ||
      err.message ===
        "You are already enrolled in this course for this semester"
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
    // Fetch the current registration to check its status
    const CourseRegistration = require("../models/CourseRegistration");
    const existing = await CourseRegistration.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Registration not found" });
    }
    // Block dropping a completed registration
    if (existing.status === "completed" && req.body.status === "dropped") {
      return res
        .status(400)
        .json({ message: "Cannot drop a completed course" });
    }
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

async function completeCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Valid course ID is required" });
    }
    const registrations = await registrationsService.completeCourse(courseId);

    // Auto-generate transcripts for all affected students
    const studentIds = [
      ...new Set(
        registrations
          .filter((r) => r.student?._id)
          .map((r) => r.student._id.toString()),
      ),
    ];
    await Promise.allSettled(
      studentIds.map((sid) => transcriptsService.generateTranscript(sid)),
    );

    res.json({ message: "Course completed", count: registrations.length });
  } catch (err) {
    next(err);
  }
}

async function gradeStudent(req, res, next) {
  try {
    const { id } = req.params;
    const { grade } = req.body;
    if (!grade) {
      return res.status(400).json({ message: "Grade is required" });
    }
    const updated = await registrationsService.updateRegistration(id, {
      grade,
    });
    if (!updated) {
      return res.status(404).json({ message: "Registration not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerStudent,
  listRegistrations,
  getStudentsInCourse,
  updateRegistration,
  completeCourse,
  gradeStudent,
};
