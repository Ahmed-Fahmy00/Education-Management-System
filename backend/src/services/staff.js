const StaffProfile = require("../models/StaffProfile");
const Staff = require("../models/Staff");

async function createProfile(payload) {
  return StaffProfile.create(payload);
}

async function listProfiles(query = {}) {
  const { q, role, department } = query;

  const mongoQuery = {};
  if (role) mongoQuery.role = role;
  if (department) mongoQuery.department = department;

  // Get StaffProfile records (existing profiles)
  const staffProfiles = await StaffProfile.find(mongoQuery).sort({ name: 1 });

  // Get approved Staff records (from registration approvals)
  const approvedStaff = await Staff.find(mongoQuery).sort({ name: 1 });

  // Combine both lists - normalize both to have 'name' field
  const combined = [
    ...staffProfiles.map((p) => ({
      ...p.toObject(),
      name: p.name,
      _type: "profile",
    })),
    ...approvedStaff.map((s) => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      department: s.department,
      role: s.role,
      staffId: s.staffId,
      _type: "staff",
    })),
  ];

  if (!q) {
    return combined;
  }

  const needle = q.toString().trim().toLowerCase();
  if (!needle) {
    return combined;
  }

  return combined.filter((item) => {
    const haystacks = [
      item.name,
      item.email,
      item.department,
      item.role,
      item.staffId,
      item.phone,
      item.officeLocation,
    ];

    return haystacks.some((value) =>
      String(value || "").toLowerCase().includes(needle),
    );
  });
}

function updateProfile(id, payload) {
  return StaffProfile.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
}

module.exports = { createProfile, listProfiles, updateProfile };
