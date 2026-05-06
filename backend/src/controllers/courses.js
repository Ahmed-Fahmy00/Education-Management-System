const mongoose = require("mongoose");
const coursesService = require("../services/courses");
const registrationsService = require("../services/registrations");
const studentsService = require("../services/students");

async function createCourse(req, res, next) {
  try {
    const created = await coursesService.createCourse(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function listCourses(req, res, next) {
  try {
    const query = {};
    if (req.query.department) query.department = req.query.department;
    if (req.query.type) query.type = req.query.type;
    if (req.query.isActive) query.isActive = req.query.isActive === "true";
    const courses = await coursesService.listCourses(query);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

async function listStudentRequirements(req, res, next) {
  try {
    const requestedDepartment = req.query.department?.trim();
    let department = requestedDepartment || req.user?.department?.trim() || "";

    if (!department && req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const student = await studentsService.getStudentById(req.user.id);
      department = student?.department?.trim() || "";
    }

    const query = { isActive: true };
    if (department) {
      query.department = department;
    }

    const courses = await coursesService.listCourses(query);
    const core = courses.filter((course) => course.type === "core");
    const electives = courses.filter((course) => course.type === "elective");

    let requiredCore = core;

    if (department && req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
      const completedRegistrations = await registrationsService.listRegistrations({
        student: req.user.id,
        status: "completed",
      });

      const completedCourseIds = new Set(
        completedRegistrations
          .map((registration) => registration.course?._id || registration.course)
          .filter(Boolean)
          .map((courseId) => courseId.toString()),
      );

      requiredCore = core.filter(
        (course) => !completedCourseIds.has(course._id.toString()),
      );
    }

    res.json({
      core: requiredCore,
      electives,
      department: department || null,
    });
  } catch (err) {
    next(err);
  }
}

async function getCourse(req, res, next) {
  try {
    const course = await coursesService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
}

async function updateCourse(req, res, next) {
  try {
    const updated = await coursesService.updateCourse(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteCourse(req, res, next) {
  try {
    const deleted = await coursesService.deleteCourse(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createCourse,
  listCourses,
  listStudentRequirements,
  getCourse,
  updateCourse,
  deleteCourse,
};
