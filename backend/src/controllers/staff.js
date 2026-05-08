const staffService = require("../services/staff");
const Staff = require("../models/Staff");
const StaffProfile = require("../models/StaffProfile");
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
    const rows = await staffService.listProfiles(req.query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getProfileById(req, res, next) {
  try {
    const profile = await StaffProfile.findById(req.params.id);
    if (profile) {
      return res.json({ ...profile.toObject(), _type: "profile" });
    }

    const staff = await Staff.findById(req.params.id).select("-password");
    if (staff) {
      return res.json({ ...staff.toObject(), _type: "staff" });
    }

    return res.status(404).json({ message: "Staff member not found" });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const staffRecord = await Staff.findById(req.params.id);
    if (staffRecord) {
      if (req.user.role !== "admin" && staffRecord._id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updates = {};
      ["name", "email", "department", "role", "password"].forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      if (updates.email) updates.email = updates.email.trim().toLowerCase();
      if (updates.name) updates.name = updates.name.trim();
      if (updates.department) updates.department = updates.department.trim();

      const row = await Staff.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      return res.json(row);
    }

    const profile = await StaffProfile.findById(req.params.id);
    if (profile) {
      if (req.user.role !== "admin" && profile.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updates = {};
      ["name", "email", "phone", "department", "officeLocation"].forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      if (updates.email) updates.email = updates.email.trim().toLowerCase();
      if (updates.name) updates.name = updates.name.trim();
      if (updates.phone) updates.phone = updates.phone.trim();
      if (updates.department) updates.department = updates.department.trim();
      if (updates.officeLocation) updates.officeLocation = updates.officeLocation.trim();

      const row = await StaffProfile.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });

      return res.json({ ...row.toObject(), _type: "profile" });
    }

    return res.status(404).json({ message: "Staff member not found" });
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

module.exports = { createProfile, listProfiles, getProfileById, updateProfile, deleteProfile };
