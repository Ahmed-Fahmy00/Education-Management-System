const Room = require("../models/Room");
const RoomBooking = require("../models/RoomBooking");

const AUTO_APPROVE_ROLES = ["admin", "staff", "professor", "ta"];

async function createBooking(payload) {
  const startsAt = new Date(payload.startsAt);
  const endsAt = new Date(payload.endsAt);

  if (
    Number.isNaN(startsAt.valueOf()) ||
    Number.isNaN(endsAt.valueOf()) ||
    endsAt <= startsAt
  ) {
    throw new Error("Invalid booking time range");
  }

  const room = await Room.findOne({ roomId: Number(payload.room) });
  if (!room) {
    const err = new Error("Room not found");
    err.status = 404;
    throw err;
  }

  const conflict = await RoomBooking.findOne({
    room: payload.room,
    status: "approved",
    startsAt: { $lt: endsAt },
    endsAt: { $gt: startsAt },
  });

  if (conflict) {
    const err = new Error("Booking conflict detected");
    err.status = 409;
    throw err;
  }

  const status = AUTO_APPROVE_ROLES.includes(payload.bookedByRole)
    ? "approved"
    : "pending";

  return RoomBooking.create({ ...payload, startsAt, endsAt, status });
}

function listBookings(query = {}) {
  return RoomBooking.find(query).populate({
    path: "room",
    foreignField: "roomId",
    select: "roomId name type building",
  });
}

// EMS-102: Calendar-formatted bookings for a date range
async function getCalendarBookings({
  startDate,
  endDate,
  roomId,
  type,
  building,
}) {
  const rangeStart = new Date(`${startDate}T00:00:00.000Z`);
  const rangeEnd = new Date(`${endDate}T23:59:59.999Z`);

  const bookingFilter = {
    startsAt: { $lt: rangeEnd },
    endsAt: { $gt: rangeStart },
    status: "approved",
  };

  if (roomId) bookingFilter.room = Number(roomId);

  let bookings = await RoomBooking.find(bookingFilter)
    .populate({
      path: "room",
      foreignField: "roomId",
      select: "roomId name type building",
    })
    .sort({ startsAt: 1 });

  if (type || building) {
    bookings = bookings.filter((b) => {
      if (type && b.room.type !== type) return false;
      if (building && b.room.building !== building) return false;
      return true;
    });
  }

  return bookings.map((b) => ({
    id: b._id,
    title: b.title,
    roomId: b.room.roomId,
    roomName: b.room.name,
    roomType: b.room.type,
    building: b.room.building,
    bookedByName: b.bookedByName,
    bookedByRole: b.bookedByRole,
    start: b.startsAt,
    end: b.endsAt,
  }));
}

async function deleteBooking(id) {
  const booking = await RoomBooking.findByIdAndDelete(id);
  if (!booking) {
    const err = new Error("Booking not found");
    err.status = 404;
    throw err;
  }
  return booking;
}

async function updateBookingStatus(id, status) {
  const booking = await RoomBooking.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );
  if (!booking) {
    const err = new Error("Booking not found");
    err.status = 404;
    throw err;
  }
  return booking;
}

module.exports = {
  createBooking,
  listBookings,
  getCalendarBookings,
  deleteBooking,
  updateBookingStatus,
};
