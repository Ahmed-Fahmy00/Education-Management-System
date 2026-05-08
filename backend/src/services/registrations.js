const Course = require("../models/Course");
const CourseRegistration = require("../models/CourseRegistration");

async function registerStudent({ student, course, semester }) {
  const targetCourse = await Course.findById(course);
  if (!targetCourse || !targetCourse.isActive) {
    throw new Error("Course not available");
  }

  const enrolledCount = await CourseRegistration.countDocuments({
    course,
    semester,
    status: "enrolled",
  });

  if (enrolledCount >= targetCourse.capacity) {
    throw new Error("Course capacity reached");
  }

  if (targetCourse.prerequisites.length > 0) {
    const completed = await CourseRegistration.find({
      student,
      status: "completed",
      course: { $in: targetCourse.prerequisites },
    }).distinct("course");

    const missing = targetCourse.prerequisites.some(
      (pre) => !completed.some((done) => done.toString() === pre.toString()),
    );

    if (missing) {
      throw new Error("Prerequisites not satisfied");
    }
  }

  return CourseRegistration.create({ student, course, semester });
}

function listRegistrations(query = {}) {
  return CourseRegistration.find(query)
    .populate("student", "studentId name email department")
    .populate("course", "code title type department");
}

function getStudentsInCourse(courseId) {
  return CourseRegistration.find({ course: courseId, status: "enrolled" })
    .populate("student", "studentId name email department")
    .populate("course", "code title");
}

function updateRegistration(id, payload) {
  return CourseRegistration.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
}

module.exports = { registerStudent, listRegistrations, getStudentsInCourse, updateRegistration };
