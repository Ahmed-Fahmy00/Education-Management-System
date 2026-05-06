const Room = require("../models/Room");
const roomsService = require("../services/rooms");

async function createRoom(req, res, next) {
  try {
    const room = await roomsService.createRoom(req.body);
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
}

async function listRooms(req, res, next) {
  try {
    const query = req.query.type ? { type: req.query.type } : {};
    const rows = await roomsService.listRooms(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// Legacy full-day availability (kept for backward compat)
async function listAvailableRooms(req, res, next) {
  try {
    if (!req.query.date) {
      return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });
    }
    const rows = await roomsService.listAvailableRooms({
      date: req.query.date,
      type: req.query.type,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// EMS-101 / EMS-103: GET /api/rooms/available
async function getAvailableRooms(req, res, next) {
  try {
    const { date, startTime, endTime, type, building, minCapacity, hasProjector } =
      req.query;

    if (!date)
      return res.status(400).json({ message: "date is required (YYYY-MM-DD)" });
    if (!startTime)
      return res.status(400).json({ message: "startTime is required (HH:mm)" });
    if (!endTime)
      return res.status(400).json({ message: "endTime is required (HH:mm)" });

    const rooms = await roomsService.findAvailableRooms({
      date,
      startTime,
      endTime,
      type,
      building,
      minCapacity,
      hasProjector,
    });
    res.json(rooms);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  }
}

// EMS-104: GET /api/rooms/status
async function getRoomsStatus(req, res, next) {
  try {
    const { date, time, type, building } = req.query;
    const result = await roomsService.getRoomsWithStatus({
      date,
      time,
      type,
      building,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// EMS-102: GET /api/rooms/:roomId/timetable
async function getRoomTimetable(req, res, next) {
  try {
    const { roomId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate)
      return res
        .status(400)
        .json({ message: "startDate is required (YYYY-MM-DD)" });
    if (!endDate)
      return res
        .status(400)
        .json({ message: "endDate is required (YYYY-MM-DD)" });

    const room = await Room.findOne({ roomId: Number(roomId) });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const bookings = await roomsService.getRoomTimetable(roomId, {
      startDate,
      endDate,
    });
    res.json({ room, bookings });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRoom,
  listRooms,
  listAvailableRooms,
  getAvailableRooms,
  getRoomsStatus,
  getRoomTimetable,
};
