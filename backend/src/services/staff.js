const StaffProfile = require("../models/StaffProfile");
const Staff = require("../models/Staff");

async function createProfile(payload) {
  return StaffProfile.create(payload);
}

async function listProfiles(query = {}) {
  // Get StaffProfile records (existing profiles)
  const staffProfiles = await StaffProfile.find(query).sort({ fullName: 1 });

  // Get approved Staff records (from registration approvals)
  const approvedStaff = await Staff.find(query).sort({ name: 1 });

  // Combine both lists
  const combined = [
    ...staffProfiles.map((p) => ({
      ...p.toObject(),
      _type: "profile",
    })),
    ...approvedStaff.map((s) => ({
      ...s.toObject(),
      _type: "staff",
      fullName: s.name, // For UI consistency
    })),
  ];

  return combined;
}

function updateProfile(id, payload) {
  return StaffProfile.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
}

module.exports = { createProfile, listProfiles, updateProfile };
