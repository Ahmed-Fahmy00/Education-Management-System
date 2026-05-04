const StaffProfile = require("../models/StaffProfile");

function createProfile(payload) {
  return StaffProfile.create(payload);
}

function listProfiles(query = {}) {
  return StaffProfile.find(query).sort({ fullName: 1 });
}

function updateProfile(id, payload) {
  return StaffProfile.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
}

module.exports = { createProfile, listProfiles, updateProfile };
