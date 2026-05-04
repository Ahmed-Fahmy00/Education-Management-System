const admissionsService = require("../services/admissions");

async function createApplication(req, res, next) {
  try {
    const created = await admissionsService.createApplication(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function listApplications(req, res, next) {
  try {
    const query = req.query.status ? { status: req.query.status } : {};
    const items = await admissionsService.listApplications(query);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    const updated = await admissionsService.updateApplicationStatus(
      req.params.id,
      req.body.status,
    );
    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createApplication,
  listApplications,
  updateApplicationStatus,
};
