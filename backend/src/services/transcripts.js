const Transcript = require("../models/Transcript");
const CourseRegistration = require("../models/CourseRegistration");

const GRADE_POINTS = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "F": 0.0
};

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

async function generateTranscript(studentId) {
  const registrations = await CourseRegistration.find({
    student: studentId,
    status: "completed",
  }).populate("course");

  let totalCredits = 0;
  let totalPoints = 0;
  const records = [];

  for (const reg of registrations) {
    if (!reg.course || !reg.grade) continue;

    const credits = reg.course.credits || 3;
    const grade = reg.grade.toUpperCase();
    const point = GRADE_POINTS[grade];

    records.push({
      courseCode: reg.course.code,
      courseTitle: reg.course.title,
      semester: reg.semester,
      grade: grade,
      credits: credits,
    });

    if (point !== undefined) {
      totalCredits += credits;
      totalPoints += point * credits;
    }
  }

  const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  return upsertTranscript(studentId, {
    records,
    cgpa: Number(cgpa.toFixed(2)),
  });
}

module.exports = { upsertTranscript, getTranscript, generateTranscript };
