const registrationsService = require("../services/registrations");

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

module.exports = { registerStudent, listRegistrations, updateRegistration };
