const Student = require("../models/Student");

const studentProjection = "-password";

function listStudents(query = {}) {
  return Student.find(query).select(studentProjection).sort({ createdAt: -1 });
}

function getStudentById(id) {
  return Student.findById(id).select(studentProjection);
}

function createStudent(payload) {
  return Student.create(payload);
}

function updateStudent(id, payload) {
  return Student.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).select(studentProjection);
}

function deleteStudent(id) {
  return Student.findByIdAndDelete(id);
}

module.exports = {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
