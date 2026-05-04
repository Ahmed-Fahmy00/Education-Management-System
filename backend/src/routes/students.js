const express = require("express");
const controller = require("../controllers/students");
const { attachUser, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(attachUser);
router.get("/", controller.listStudents);
router.post("/", requireRole(["admin"]), controller.createStudent);
router.get("/:id", controller.getStudent);
router.patch("/:id", requireRole(["admin"]), controller.updateStudent);
router.delete("/:id", requireRole(["admin"]), controller.deleteStudent);

module.exports = router;
