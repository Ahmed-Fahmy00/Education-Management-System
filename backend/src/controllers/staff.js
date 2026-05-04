const staffService = require("../services/staff");

async function createProfile(req, res, next) {
  try {
    const profile = await staffService.createProfile(req.body);
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
}

async function listProfiles(req, res, next) {
  try {
    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.department) query.department = req.query.department;
    const rows = await staffService.listProfiles(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const row = await staffService.updateProfile(req.params.id, req.body);
    if (!row) {
      return res.status(404).json({ message: "Staff profile not found" });
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
}

module.exports = { createProfile, listProfiles, updateProfile };
