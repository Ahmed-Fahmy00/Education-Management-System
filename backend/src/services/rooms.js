const Room = require("../models/Room");
const RoomBooking = require("../models/RoomBooking");

function createRoom(payload) {
  return Room.create(payload);
}

function listRooms(query = {}) {
  return Room.find(query).sort({ building: 1, name: 1 });
}

// Legacy: full-day availability check
async function listAvailableRooms({ date, type }) {
  const start = new Date(date);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  start.setHours(0, 0, 0, 0);

  const bookedRoomIds = await RoomBooking.find({
    status: "approved",
    startsAt: { $lt: end },
    endsAt: { $gt: start },
  }).distinct("room");

  const filter = { roomId: { $nin: bookedRoomIds } };
  if (type) filter.type = type;

  return Room.find(filter).sort({ building: 1, name: 1 });
}

// EMS-101 / EMS-103: Available rooms with precise time range + filters
async function findAvailableRooms({
  date,
  startTime,
  endTime,
  type,
  building,
  minCapacity,
  hasProjector,
}) {
  const requestedStart = new Date(`${date}T${startTime}:00.000Z`);
  const requestedEnd = new Date(`${date}T${endTime}:00.000Z`);

  if (
    Number.isNaN(requestedStart.valueOf()) ||
    Number.isNaN(requestedEnd.valueOf())
  ) {
    const err = new Error("Invalid date or time format");
    err.status = 400;
    throw err;
  }

  if (requestedEnd <= requestedStart) {
    const err = new Error("endTime must be after startTime");
    err.status = 400;
    throw err;
  }

  const bookedRoomIds = await RoomBooking.find({
    status: "approved",
    startsAt: { $lt: requestedEnd },
    endsAt: { $gt: requestedStart },
  }).distinct("room");

  const filter = { roomId: { $nin: bookedRoomIds } };
  if (type) filter.type = type;
  if (building) filter.building = building;
  if (minCapacity !== undefined) filter.capacity = { $gte: Number(minCapacity) };
  if (hasProjector !== undefined)
    filter.hasProjector = hasProjector === "true" || hasProjector === true;

  return Room.find(filter).sort({ building: 1, name: 1 });
}

// EMS-104: All rooms with current or selected-time status
async function getRoomsWithStatus({ date, time, type, building }) {
  let checkAt;
  if (date && time) {
    checkAt = new Date(`${date}T${time}:00.000Z`);
  } else {
    checkAt = new Date();
  }

  const roomFilter = {};
  if (type) roomFilter.type = type;
  if (building) roomFilter.building = building;

  const rooms = await Room.find(roomFilter).sort({ building: 1, name: 1 });

  const activeBookings = await RoomBooking.find({
    status: "approved",
    startsAt: { $lte: checkAt },
    endsAt: { $gt: checkAt },
  });

  const bookedMap = new Map();
  activeBookings.forEach((b) => {
    bookedMap.set(String(b.room), b);
  });

  return rooms.map((room) => {
    const booking = bookedMap.get(String(room.roomId));
    return {
      ...room.toObject(),
      status: booking ? "booked" : "available",
      currentBooking: booking
        ? {
          id: booking._id,
          title: booking.title,
          bookedByName: booking.bookedByName,
          bookedByRole: booking.bookedByRole,
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
        }
        : null,
    };
  });
}

// EMS-102: Bookings for one room in a date range
async function getRoomTimetable(roomId, { startDate, endDate }) {
  const rangeStart = new Date(`${startDate}T00:00:00.000Z`);
  const rangeEnd = new Date(`${endDate}T23:59:59.999Z`);

  return RoomBooking.find({
    room: Number(roomId),
    startsAt: { $lt: rangeEnd },
    endsAt: { $gt: rangeStart },
  }).sort({ startsAt: 1 });
}

module.exports = {
  createRoom,
  listRooms,
  listAvailableRooms,
  findAvailableRooms,
  getRoomsWithStatus,
  getRoomTimetable,
};
