const maintenanceService = require("../services/maintenance");

async function createReport(req, res, next) {
  try {
    const payload = {
      ...req.body,
      reportedById: req.user?.id || req.body.reportedById,
      reportedByRole: req.user?.role || req.body.reportedByRole,
    };
    // reportedBy (name) must come from request body; fall back to user id
    if (!payload.reportedBy && req.user?.id) payload.reportedBy = req.user.id;
    const report = await maintenanceService.createReport(payload);
    res.status(201).json(report);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ message: err.message });
    next(err);
  }
}

async function listReports(req, res, next) {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    const role = req.user?.role;
    const PRIVILEGED = ["admin", "staff"];
    // Non-privileged users can only see their own reports
    if (!PRIVILEGED.includes(role)) {
      if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });
      query.reportedById = req.user.id;
    }
    const rows = await maintenanceService.listReports(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function updateReportStatus(req, res, next) {
  try {
    const row = await maintenanceService.updateReportStatus(
      req.params.id,
      req.body.status,
    );
    if (!row) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
}

async function openCount(req, res, next) {
  try {
    const count = await maintenanceService.countOpen();
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReport, listReports, updateReportStatus, openCount };
