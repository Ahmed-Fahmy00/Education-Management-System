const StaffProfile = require("../models/StaffProfile");

/**
 * Senior Utility: Escape Regex Special Characters
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Senior Utility: Basic Sanitization
 */
const sanitizeString = (str) => {
  if (!str) return "";
  return str.toString().trim().replace(/<[^>]*>?/gm, "");
};

// @desc    Create a staff profile
exports.createProfile = async (req, res) => {
  try {
    const { name, email, phone, department, officeLocation } = req.body;

    // SANITIZATION SCOPE: All fields sanitized to prevent XSS
    const payload = {
      userId: req.user.id,
      name: sanitizeString(name),
      email: email.toLowerCase().trim(),
      phone: sanitizeString(phone),
      department: sanitizeString(department),
      officeLocation: sanitizeString(officeLocation),
    };

    const existingProfile = await StaffProfile.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ success: false, message: "Profile already exists" });
    }

    const profile = await StaffProfile.create(payload);

    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get all profiles (Optimized Search & Pagination & Projection)
exports.getProfiles = async (req, res) => {
  try {
    const { name, department, page = 1, limit = 12 } = req.query;
    const query = {};

    // REGEX ESCAPING: Prevent regex injection attacks
    const escapedName = name ? escapeRegex(name) : "";

    if (name) {
      if (name.length > 2) {
        query.$text = { $search: name };
      } else {
        query.name = { $regex: `^${escapedName}`, $options: "i" };
      }
    }

    if (department) {
      query.department = department;
    }

    const skip = (page - 1) * limit;

    // PROJECTION: Exclude internal __v and createdAt from public directory
    const projection = {
      __v: 0,
      createdAt: 0,
      updatedAt: 0,
    };

    // $TEXT SORTING: Apply relevance score if text search is used
    const sort = name && name.length > 2 
      ? { score: { $meta: "textScore" } } 
      : { name: 1 };

    const findQuery = name && name.length > 2
      ? StaffProfile.find(query, { ...projection, score: { $meta: "textScore" } })
      : StaffProfile.find(query, projection);

    const [data, total] = await Promise.all([
      findQuery.sort(sort).limit(Number(limit)).skip(skip),
      StaffProfile.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Get single profile (With Projection & User Context)
exports.getProfileById = async (req, res) => {
  try {
    const profile = await StaffProfile.findById(req.params.id).select("-__v -updatedAt");

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    const isOwner = req.user && req.user.id === profile.userId.toString();
    const isAdmin = req.user && req.user.role === "admin";

    res.status(200).json({ 
      success: true, 
      data: profile,
      canEdit: isOwner || isAdmin 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Update profile
exports.updateProfile = async (req, res) => {
  try {
    let profile = await StaffProfile.findById(req.params.id);

    if (!profile) return res.status(404).json({ success: false, message: "Not found" });

    if (profile.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // SANITIZATION on update
    const updates = { ...req.body };
    if (updates.name) updates.name = sanitizeString(updates.name);
    if (updates.officeLocation) updates.officeLocation = sanitizeString(updates.officeLocation);
    if (updates.department) updates.department = sanitizeString(updates.department);

    profile = await StaffProfile.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
