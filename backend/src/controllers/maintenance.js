const maintenanceService = require("../services/maintenance");

async function createReport(req, res, next) {
  try {
    const report = await maintenanceService.createReport(req.body);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
}

async function listReports(req, res, next) {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
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

module.exports = { createReport, listReports, updateReportStatus };
