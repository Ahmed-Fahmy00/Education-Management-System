const Course = require("../models/Course");
const CourseRegistration = require("../models/CourseRegistration");

// Max credits a student may enroll per semester (business rule).
const MAX_CREDITS_PER_SEMESTER = 18;

async function registerStudent({ student, course, semester }) {
  const targetCourse = await Course.findById(course);
  if (!targetCourse || !targetCourse.isActive) {
    throw new Error("Course not available");
  }

  // Prevent duplicate or re-enrollment when already enrolled/completed
  const existing = await CourseRegistration.findOne({ student, course, semester });
  if (existing) {
    if (existing.status === "enrolled") {
      throw new Error("Already enrolled in this course for the semester");
    }
    if (existing.status === "completed") {
      throw new Error("Course already completed");
    }
  }

  // Capacity check
  const enrolledCount = await CourseRegistration.countDocuments({
    course,
    semester,
    status: "enrolled",
  });

  if (enrolledCount >= targetCourse.capacity) {
    throw new Error("Course capacity reached");
  }

  // Prerequisites: student must have completed ALL prerequisite courses
  if (Array.isArray(targetCourse.prerequisites) && targetCourse.prerequisites.length > 0) {
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

  // Credit limit: sum credits for all currently enrolled courses this semester
  const enrolledRegs = await CourseRegistration.find({
    student,
    semester,
    status: "enrolled",
  }).populate("course", "credits");

  const currentCredits = enrolledRegs.reduce((sum, r) => {
    const c = r.course && r.course.credits ? Number(r.course.credits) : 0;
    return sum + c;
  }, 0);

  const prospectiveTotal = currentCredits + (Number(targetCourse.credits) || 0);
  if (prospectiveTotal > MAX_CREDITS_PER_SEMESTER) {
    throw new Error("Exceeds maximum allowed credits for the semester");
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
