const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["instructor", "admin"],
      required: true,
    },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegistrationApplication",
    },
    staffId: { type: String, trim: true, sparse: true },
    department: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Staff", staffSchema);
