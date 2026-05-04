const AdmissionApplication = require("../models/AdmissionApplication");

function createApplication(payload) {
  return AdmissionApplication.create(payload);
}

function listApplications(query = {}) {
  return AdmissionApplication.find(query).sort({ createdAt: -1 });
}

function updateApplicationStatus(id, status) {
  return AdmissionApplication.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true },
  );
}

module.exports = {
  createApplication,
  listApplications,
  updateApplicationStatus,
};
