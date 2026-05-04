const RoomBooking = require("../models/RoomBooking");

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

  const conflict = await RoomBooking.findOne({
    room: payload.room,
    startsAt: { $lt: endsAt },
    endsAt: { $gt: startsAt },
  });

  if (conflict) {
    throw new Error("Booking conflict detected");
  }

  return RoomBooking.create({ ...payload, startsAt, endsAt });
}

function listBookings(query = {}) {
  return RoomBooking.find(query).populate("room", "name type building");
}

module.exports = { createBooking, listBookings };
