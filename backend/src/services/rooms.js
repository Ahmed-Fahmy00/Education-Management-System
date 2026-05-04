const Room = require("../models/Room");
const RoomBooking = require("../models/RoomBooking");

function createRoom(payload) {
  return Room.create(payload);
}

function listRooms(query = {}) {
  return Room.find(query).sort({ building: 1, name: 1 });
}

async function listAvailableRooms({ date, type }) {
  const start = new Date(date);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  start.setHours(0, 0, 0, 0);

  const bookedRoomIds = await RoomBooking.find({
    startsAt: { $lt: end },
    endsAt: { $gt: start },
  }).distinct("room");

  const filter = {
    _id: { $nin: bookedRoomIds },
  };

  if (type) {
    filter.type = type;
  }

  return Room.find(filter).sort({ building: 1, name: 1 });
}

module.exports = { createRoom, listRooms, listAvailableRooms };
