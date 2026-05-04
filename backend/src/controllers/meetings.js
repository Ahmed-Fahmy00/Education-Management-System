const meetingsService = require("../services/meetings");

async function createMeetingRequest(req, res, next) {
  try {
    const row = await meetingsService.createMeetingRequest(req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

async function listMeetingRequests(req, res, next) {
  try {
    const query = {};
    if (req.query.professorName) query.professorName = req.query.professorName;
    if (req.query.studentName) query.studentName = req.query.studentName;
    if (req.query.status) query.status = req.query.status;
    const rows = await meetingsService.listMeetingRequests(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function respondMeetingRequest(req, res, next) {
  try {
    const row = await meetingsService.respondMeetingRequest(
      req.params.id,
      req.body,
    );
    if (!row) {
      return res.status(404).json({ message: "Meeting request not found" });
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createMeetingRequest,
  listMeetingRequests,
  respondMeetingRequest,
};
