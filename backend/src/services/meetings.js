const MeetingRequest = require("../models/MeetingRequest");

function createMeetingRequest(payload) {
  return MeetingRequest.create(payload);
}

function listMeetingRequests(query = {}) {
  return MeetingRequest.find(query).sort({ createdAt: -1 });
}

function respondMeetingRequest(id, payload) {
  return MeetingRequest.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
}

module.exports = {
  createMeetingRequest,
  listMeetingRequests,
  respondMeetingRequest,
};
