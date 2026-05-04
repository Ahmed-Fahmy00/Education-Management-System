const studentsService = require("../services/students");

async function listStudents(req, res, next) {
  try {
    const { q } = req.query;
    const query = q
      ? {
          $or: [
            { firstName: { $regex: q, $options: "i" } },
            { lastName: { $regex: q, $options: "i" } },
            { studentId: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};
    const students = await studentsService.listStudents(query);
    res.json(students);
  } catch (err) {
    next(err);
  }
}

async function createStudent(req, res, next) {
  try {
    const created = await studentsService.createStudent(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function getStudent(req, res, next) {
  try {
    const student = await studentsService.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (err) {
    next(err);
  }
}

async function updateStudent(req, res, next) {
  try {
    const updated = await studentsService.updateStudent(
      req.params.id,
      req.body,
    );
    if (!updated) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteStudent(req, res, next) {
  try {
    const deleted = await studentsService.deleteStudent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listStudents,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
};
