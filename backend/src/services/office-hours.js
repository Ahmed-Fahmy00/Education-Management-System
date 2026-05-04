const OfficeHour = require("../models/OfficeHour");

function publishOfficeHour(payload) {
  return OfficeHour.create(payload);
}

function listOfficeHours(query = {}) {
  return OfficeHour.find(query)
    .populate("staff", "fullName role department email")
    .sort({ dayOfWeek: 1, startTime: 1 });
}

module.exports = { publishOfficeHour, listOfficeHours };
