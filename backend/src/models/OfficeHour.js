const mongoose = require("mongoose");

const officeHourSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffProfile",
      required: true,
    },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true, trim: true },
    endTime: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("OfficeHour", officeHourSchema);
