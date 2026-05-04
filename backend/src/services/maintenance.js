const MaintenanceReport = require("../models/MaintenanceReport");

function createReport(payload) {
  return MaintenanceReport.create(payload);
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

module.exports = { createReport, listReports, updateReportStatus };
