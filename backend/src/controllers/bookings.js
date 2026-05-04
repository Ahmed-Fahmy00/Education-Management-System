const bookingsService = require("../services/bookings");

async function createBooking(req, res, next) {
  try {
    const booking = await bookingsService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (err) {
    if (
      err.message === "Invalid booking time range" ||
      err.message === "Booking conflict detected"
    ) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
}

async function listBookings(req, res, next) {
  try {
    const query = {};
    if (req.query.room) query.room = req.query.room;
    const rows = await bookingsService.listBookings(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { createBooking, listBookings };
