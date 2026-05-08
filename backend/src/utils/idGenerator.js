const Counter = require("../models/Counter");

/**
 * Generates a sequential student ID: YYs#### (e.g. 26s0001)
 * YY = last 2 digits of current year, #### = zero-padded counter per year.
 */
async function generateStudentId() {
  const year = new Date().getFullYear();
  const yy = String(year).slice(-2);
  const key = `student_${year}`;
  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return `${yy}s${String(counter.seq).padStart(4, "0")}`;
}

/**
 * Generates a sequential staff ID: YYe#### (e.g. 26e0001)
 */
async function generateStaffId() {
  const year = new Date().getFullYear();
  const yy = String(year).slice(-2);
  const key = `staff_${year}`;
  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return `${yy}e${String(counter.seq).padStart(4, "0")}`;
}

module.exports = { generateStudentId, generateStaffId };
