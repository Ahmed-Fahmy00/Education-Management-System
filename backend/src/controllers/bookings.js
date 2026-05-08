const bookingsService = require("../services/bookings");

async function createBooking(req, res, next) {
  try {
    const booking = await bookingsService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ message: err.message });
    if (err.status === 409 || err.message === "Booking conflict detected") {
      return res.status(409).json({ message: err.message });
    }
    if (err.message === "Invalid booking time range") {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
}

async function listBookings(req, res, next) {
  try {
    const query = {};
    if (req.query.room) query.room = req.query.room;
    if (req.query.bookedByName) query.bookedByName = req.query.bookedByName;
    if (req.query.status) query.status = req.query.status;
    const rows = await bookingsService.listBookings(query);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// EMS-102: GET /api/bookings/calendar
async function getCalendarBookings(req, res, next) {
  try {
    const { startDate, endDate, roomId, type, building } = req.query;

    if (!startDate)
      return res
        .status(400)
        .json({ message: "startDate is required (YYYY-MM-DD)" });
    if (!endDate)
      return res
        .status(400)
        .json({ message: "endDate is required (YYYY-MM-DD)" });

    const events = await bookingsService.getCalendarBookings({
      startDate,
      endDate,
      roomId,
      type,
      building,
    });
    res.json(events);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/bookings/:id
async function deleteBooking(req, res, next) {
  try {
    await bookingsService.deleteBooking(req.params.id);
    res.status(204).end();
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ message: err.message });
    next(err);
  }
}

// PATCH /api/bookings/:id/status
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be approved or rejected" });
    }
    const booking = await bookingsService.updateBookingStatus(req.params.id, status);
    res.json(booking);
  } catch (err) {
    if (err.status === 404) return res.status(404).json({ message: err.message });
    next(err);
  }
}

module.exports = { createBooking, listBookings, getCalendarBookings, deleteBooking, updateStatus };
