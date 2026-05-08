const mongoose = require("mongoose");

const officeHourSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // Adapting to existing "Staff" model instead of "User" if User doesn't exist
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:mm validation
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:mm validation
    },
  },
  { timestamps: true }
);

// Add a check to ensure startTime < endTime is handled in controller or here
// Business logic: Preventive overlapping will be in controller

module.exports = mongoose.model("OfficeHour", officeHourSchema);
