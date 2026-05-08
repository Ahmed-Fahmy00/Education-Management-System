const staffService = require("../services/staff");
const Staff = require("../models/Staff");
const { generateStaffId } = require("../utils/idGenerator");

async function createProfile(req, res, next) {
  try {
    const staffId = await generateStaffId();
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "name, email, password, and role are required" });
    }

    const staff = await Staff.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      staffId,
      isActive: true,
    });

    res.status(201).json(staff);
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
    // Try Staff model first (created via approval or admin add), then StaffProfile
    let row = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!row) {
      row = await staffService.updateProfile(req.params.id, req.body);
    }
    if (!row) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
}

async function deleteProfile(req, res, next) {
  try {
    // Try Staff model first, then StaffProfile
    let deleted = await Staff.findByIdAndDelete(req.params.id);
    if (!deleted) {
      const StaffProfile = require("../models/StaffProfile");
      deleted = await StaffProfile.findByIdAndDelete(req.params.id);
    }
    if (!deleted) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { createProfile, listProfiles, updateProfile, deleteProfile };
