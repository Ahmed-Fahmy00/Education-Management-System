const OfficeHour = require("../models/OfficeHour");

/**
 * Utility function to convert "HH:mm" to total minutes since start of day
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Real-time status calculation logic
 */
const getOfficeHourStatus = (dayOfWeek, startTime, endTime) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const now = new Date();
  
  // Get current day string
  const currentDay = days[now.getDay()];

  if (currentDay !== dayOfWeek) {
    return "Not Available";
  }

  // Current time in minutes
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
    return "Available";
  }

  return "Not Available";
};

// @desc    Add new office hour slot
// @route   POST /api/office-hours
// @access  Private (Professor/TA only)
exports.createOfficeHour = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    const staffId = req.user.id;

    // A. Prevent Invalid Time
    const startMins = timeToMinutes(startTime);
    const endMins = timeToMinutes(endTime);

    if (startMins >= endMins) {
      return res.status(400).json({
        success: false,
        message: "Start time must be less than end time",
      });
    }

    // B. Prevent Overlapping Slots
    // For same staff + same day: newStart < existingEnd AND newEnd > existingStart
    const existingSlots = await OfficeHour.find({ staffId, dayOfWeek });

    for (const slot of existingSlots) {
      const existingStart = timeToMinutes(slot.startTime);
      const existingEnd = timeToMinutes(slot.endTime);

      if (startMins < existingEnd && endMins > existingStart) {
        return res.status(400).json({
          success: false,
          message: "This slot overlaps with an existing office hour on the same day",
        });
      }
    }

    const officeHour = new OfficeHour({
      staffId,
      dayOfWeek,
      startTime,
      endTime,
    });

    await officeHour.save();

    res.status(201).json({
      success: true,
      data: officeHour,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Get all slots for a staff member + computed status
// @route   GET /api/office-hours/:staffId
// @access  Public
exports.getOfficeHoursByStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const slots = await OfficeHour.find({ staffId }).sort({
      dayOfWeek: 1,
      startTime: 1,
    });

    // Compute status for each slot
    const slotsWithStatus = slots.map((slot) => {
      const status = getOfficeHourStatus(
        slot.dayOfWeek,
        slot.startTime,
        slot.endTime
      );
      return {
        ...slot.toObject(),
        status,
      };
    });

    res.status(200).json({
      success: true,
      data: slotsWithStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete office hour slot
// @route   DELETE /api/office-hours/:id
// @access  Private (Owner only)
exports.deleteOfficeHour = async (req, res) => {
  try {
    const officeHour = await OfficeHour.findById(req.params.id);

    if (!officeHour) {
      return res.status(404).json({
        success: false,
        message: "Office hour not found",
      });
    }

    // Authorization: Check if user is the owner
    if (officeHour.staffId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this slot",
      });
    }

    await officeHour.deleteOne();

    res.status(200).json({
      success: true,
      message: "Office hour removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Export utility for documentation/hint
exports.getOfficeHourStatus = getOfficeHourStatus;
