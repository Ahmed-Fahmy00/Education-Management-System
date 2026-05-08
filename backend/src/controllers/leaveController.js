const LeaveRequest = require("../models/LeaveRequest");
const notificationService = require("../services/notificationService");

/**
 * Senior-level validation pattern
 */
const validateLeaveInput = (data) => {
  const { startDate, endDate, leaveType } = data;
  if (!startDate || !endDate || !leaveType) return "All fields are required";
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (start < now) return "Start date cannot be in the past";
  if (start >= end) return "End date must be after start date";
  
  return null; // No errors
};

const checkOverlap = async (staffId, startDate, endDate) => {
  // Logic: (StartA < EndB) AND (EndA > StartB)
  // This correctly excludes cases where EndA == StartB (no overlap)
  return await LeaveRequest.findOne({
    staffId,
    status: { $ne: "rejected" },
    startDate: { $lt: endDate },
    endDate: { $gt: startDate }
  });
};

// @desc    Submit a new leave request
exports.createLeaveRequest = async (req, res) => {
  try {
    const error = validateLeaveInput(req.body);
    if (error) return res.status(400).json({ success: false, message: error });

    const { startDate, endDate, leaveType } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const overlap = await checkOverlap(req.user.id, start, end);
    if (overlap) {
      return res.status(400).json({ 
        success: false, 
        message: `Overlap with existing request: ${overlap.startDate.toDateString()} - ${overlap.endDate.toDateString()}` 
      });
    }

    const leaveRequest = await LeaveRequest.create({
      staffId: req.user.id,
      startDate: start,
      endDate: end,
      leaveType
    });

    // Async Audit Logging
    notificationService.logAudit({
      targetId: leaveRequest._id,
      targetModel: "LeaveRequest",
      action: "LEAVE_CREATED",
      performedBy: req.user.id,
      changes: { to: leaveRequest.toObject() }
    });

    res.status(201).json({ success: true, data: leaveRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get logged-in staff member's requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ staffId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Admin: View all requests (with Pagination & Filtering)
exports.getAllRequests = async (req, res) => {
  try {
    const { status, staffId, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (staffId) query.staffId = staffId;

    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      LeaveRequest.find(query)
        .populate("staffId", "name email")
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      LeaveRequest.countDocuments(query)
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

// @desc    Admin: Update status (State Machine logic)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status update" });
    }

    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) return res.status(404).json({ success: false, message: "Not found" });

    // State Machine Check
    if (leaveRequest.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: `Finalized requests (${leaveRequest.status}) cannot be changed.` 
      });
    }

    const previousData = leaveRequest.toObject();
    leaveRequest.status = status;
    if (reason) leaveRequest.rejectionReason = reason;
    await leaveRequest.save();

    // Async tasks: Notification & Audit
    notificationService.notifyLeaveStatus(leaveRequest.staffId, status, leaveRequest._id);
    notificationService.logAudit({
      targetId: leaveRequest._id,
      targetModel: "LeaveRequest",
      action: "STATUS_UPDATED",
      performedBy: req.user.id,
      changes: { from: previousData.status, to: status },
      metadata: { reason }
    });

    res.status(200).json({ success: true, data: leaveRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
