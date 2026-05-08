const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const Staff = require("../models/Staff");
const notificationService = require("../services/notificationService");

// @desc    Assign Staff to Course (Admin Only)
exports.createAssignment = async (req, res) => {
  try {
    const { staffId, courseId } = req.body;

    // 1. VALIDATION: Explicitly ensure references exist
    const [staff, course] = await Promise.all([
      Staff.findById(staffId),
      Course.findById(courseId)
    ]);

    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    // 2. DATA INTEGRITY: Check for duplicate
    const existing = await Assignment.findOne({ staffId, courseId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Assignment already exists" });
    }

    const assignment = await Assignment.create({
      staffId,
      courseId,
      assignedBy: req.user.id
    });

    // 3. AUDIT LOGGING: Record the action
    notificationService.logAudit({
      targetId: assignment._id,
      targetModel: "Assignment",
      action: "COURSE_ASSIGNED",
      performedBy: req.user.id,
      metadata: { staffId, courseId, courseCode: course.code }
    });

    // POPULATE OPTIMIZATION: Only fetch needed fields
    const populated = await assignment.populate([
      { path: "staffId", select: "name email department" },
      { path: "courseId", select: "title code" }
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Remove Assignment (Admin Only)
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: "Not found" });

    // AUDIT LOGGING before deletion
    notificationService.logAudit({
      targetId: assignment._id,
      targetModel: "Assignment",
      action: "COURSE_UNASSIGNED",
      performedBy: req.user.id,
      metadata: { staffId: assignment.staffId, courseId: assignment.courseId }
    });

    await assignment.deleteOne();
    res.status(200).json({ success: true, message: "Assignment removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get All Assignments (Admin View + Pagination)
exports.getAllAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Assignment.find()
        .populate("staffId", "name department")
        .populate("courseId", "title code")
        .sort("-createdAt")
        .limit(Number(limit))
        .skip(skip),
      Assignment.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get Staff Courses (Optimized Populate)
exports.getStaffCourses = async (req, res) => {
  try {
    const assignments = await Assignment.find({ staffId: req.params.id })
      .populate("courseId", "title code department credits")
      .select("-assignedBy -__v")
      .sort("-assignedAt");

    res.status(200).json({
      success: true,
      data: assignments.map(a => a.courseId)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get All Courses (List all available courses)
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true })
      .select("_id title code department credits type")
      .sort("code");

    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
