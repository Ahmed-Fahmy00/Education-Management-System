const Transcript = require("../models/Transcript");

function upsertTranscript(studentId, payload) {
  return Transcript.findOneAndUpdate(
    { student: studentId },
    { ...payload, student: studentId },
    { new: true, upsert: true, runValidators: true },
  ).populate("student", "studentId firstName lastName department");
}

function getTranscript(studentId) {
  return Transcript.findOne({ student: studentId }).populate(
    "student",
    "studentId firstName lastName department",
  );
}

module.exports = { upsertTranscript, getTranscript };
