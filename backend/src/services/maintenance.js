const MaintenanceReport = require("../models/MaintenanceReport");
const Room = require("../models/Room");
const { getIO } = require("../utils/socket");

async function createReport(payload) {
  // Validate room exists
  const room = await Room.findById(payload.room);
  if (!room) {
    const err = new Error("Room not found");
    err.status = 404;
    throw err;
  }

  const report = await MaintenanceReport.create(payload);
  const populated = await MaintenanceReport.findById(report._id)
    .populate("room", "name type building");

  // Notify admin via socket
  try {
    const io = getIO();
    if (io) {
      io.emit("maintenance:new", {
        id: report._id,
        issueDescription: report.issueDescription,
        priority: report.priority,
        reportedBy: report.reportedBy,
        roomName: room.name,
        createdAt: report.createdAt,
      });
    }
  } catch {
    // non-critical — socket may not be initialised
  }

  return populated;
}

function listReports(query = {}) {
  return MaintenanceReport.find(query)
    .populate("room", "name type building")
    .sort({ createdAt: -1 });
}

function updateReportStatus(id, status) {
  return MaintenanceReport.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );
}

function countOpen() {
  return MaintenanceReport.countDocuments({ status: "open" });
}

module.exports = { createReport, listReports, updateReportStatus, countOpen };
