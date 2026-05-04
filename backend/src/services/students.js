const Student = require("../models/Student");

function listStudents(query = {}) {
  return Student.find(query).sort({ createdAt: -1 });
}

function getStudentById(id) {
  return Student.findById(id);
}

function createStudent(payload) {
  return Student.create(payload);
}

function updateStudent(id, payload) {
  return Student.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
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
