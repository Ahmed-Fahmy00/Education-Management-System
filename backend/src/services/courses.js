const Course = require("../models/Course");

function createCourse(payload) {
  return Course.create(payload).then((course) =>
    course.populate([
      { path: "prerequisites", select: "code title" },
      { path: "instructorId", select: "name email" },
    ])
  );
}

function listCourses(query = {}) {
  return Course.find(query)
    .populate("prerequisites", "code title")
    .populate("instructorId", "name email");
}

function getCourseById(id) {
  return Course.findById(id).populate("prerequisites", "code title").populate("instructorId", "name email");
}

function getCoursesByInstructorId(instructorId) {
  return Course.find({ instructorId }).populate("prerequisites", "code title").populate("instructorId", "name email");
}

function updateCourse(id, payload) {
  return Course.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate("prerequisites", "code title")
    .populate("instructorId", "name email");
}

function deleteCourse(id) {
  return Course.findByIdAndDelete(id);
}

module.exports = {
  createCourse,
  listCourses,
  getCourseById,
  getCoursesByInstructorId,
  updateCourse,
  deleteCourse,
};
