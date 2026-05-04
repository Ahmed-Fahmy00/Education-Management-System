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

module.exports = { createRoom, listRooms, listAvailableRooms };
