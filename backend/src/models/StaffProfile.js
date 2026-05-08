const mongoose = require("mongoose");

const staffProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // Referencing the existing Staff/User auth model
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      index: true, // Normal index for exact/filter matches
    },
    officeLocation: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

// Search Optimization: Text index for name search
staffProfileSchema.index({ name: "text" });

module.exports = mongoose.model("StaffProfile", staffProfileSchema);
