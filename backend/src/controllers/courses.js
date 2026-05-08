const mongoose = require("mongoose");
const coursesService = require("../services/courses");
const registrationsService = require("../services/registrations");
const studentsService = require("../services/students");

async function createCourse(req, res, next) {
  try {
    const body = req.body || {};
    const {
      code,
      title,
      department,
      description,
      credits,
      type,
      instructorId,
      capacity,
      prerequisites,
      isActive,
    } = body;

    // Validate required fields
    if (!code || !code.trim()) {
      return res.status(400).json({ message: "Course code is required." });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Course title is required." });
    }
    if (!department || !department.trim()) {
      return res
        .status(400)
        .json({ message: "Course department is required." });
    }

    const created = await coursesService.createCourse({
      code: code.toUpperCase().trim(),
      title: title.trim(),
      department: department.trim(),
      description: description?.trim() || "",
      credits: Number(credits) || 3,
      type: type || "core",
      instructorId: instructorId || null,
      capacity: Number(capacity) || 80,
      prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
      isActive: isActive !== false,
    });
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

    if (
      !department &&
      req.user?.id &&
      mongoose.Types.ObjectId.isValid(req.user.id)
    ) {
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

    if (
      department &&
      req.user?.id &&
      mongoose.Types.ObjectId.isValid(req.user.id)
    ) {
      const completedRegistrations =
        await registrationsService.listRegistrations({
          student: req.user.id,
          status: "completed",
        });

      const completedCourseIds = new Set(
        completedRegistrations
          .map(
            (registration) => registration.course?._id || registration.course,
          )
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

async function getCoursesByInstructorId(req, res, next) {
  try {
    const instructorId = req.params.instructorId;
    if (!instructorId || !mongoose.Types.ObjectId.isValid(instructorId)) {
      return res.status(400).json({ message: "Valid instructor ID is required." });
    }
    const courses = await coursesService.getCoursesByInstructorId(instructorId);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

async function updateCourse(req, res, next) {
  try {
    const body = req.body || {};
    const {
      code,
      title,
      department,
      description,
      credits,
      type,
      instructorId,
      capacity,
      prerequisites,
      isActive,
    } = body;

    // Validate required fields
    if (code && !code.trim()) {
      return res.status(400).json({ message: "Course code cannot be empty." });
    }
    if (title && !title.trim()) {
      return res.status(400).json({ message: "Course title cannot be empty." });
    }
    if (department && !department.trim()) {
      return res
        .status(400)
        .json({ message: "Course department cannot be empty." });
    }

    const payload = {};
    if (code !== undefined) payload.code = code.toUpperCase().trim();
    if (title !== undefined) payload.title = title.trim();
    if (department !== undefined) payload.department = department.trim();
    if (description !== undefined) payload.description = description.trim();
    if (credits !== undefined) payload.credits = Number(credits);
    if (type !== undefined) payload.type = type;
    if (instructorId !== undefined)
      payload.instructorId = instructorId || null;
    if (capacity !== undefined) payload.capacity = Number(capacity);
    if (prerequisites !== undefined)
      payload.prerequisites = Array.isArray(prerequisites) ? prerequisites : [];
    if (isActive !== undefined) payload.isActive = isActive;

    const updated = await coursesService.updateCourse(req.params.id, payload);
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
  getCoursesByInstructorId,
  updateCourse,
  deleteCourse,
};
