const Student = require("../models/Student");
const Staff = require("../models/Staff");
const RegistrationApplication = require("../models/RegistrationApplication");

// Register a new user (pending application)
exports.register = async (req, res) => {
  try {
    console.log("Register endpoint called");
    console.log("Request body:", req.body);

    const { name, email, password, role } = req.body;
    const allowedRoles = ["student", "instructor"];

    // Validation
    if (!name || !email || !password || !role) {
      console.log("Missing fields:", { name, email, password, role });
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role for public registration",
      });
    }

    // Check if email already exists in any account/application collection
    const existingStudent = await Student.findOne({ email });
    const existingStaff = await Staff.findOne({ email });
    const existingApplication = await RegistrationApplication.findOne({
      email,
    });

    if (existingStudent || existingStaff || existingApplication) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create pending application instead of a Student record
    const newApplication = new RegistrationApplication({
      name,
      email,
      password, // In production, hash this password
      role: role || "student",
      status: "pending",
    });

    const savedApplication = await newApplication.save();
    console.log("Application saved:", savedApplication);

    // Return success with pending status
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      applicationId: savedApplication._id,
      status: savedApplication.status,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login user - only approved users stored in Student or Staff collections
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName =
      process.env.SUPER_ADMIN_NAME || "Super Administrator";

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (
      superAdminEmail &&
      superAdminPassword &&
      email.toLowerCase() === superAdminEmail.toLowerCase() &&
      password === superAdminPassword
    ) {
      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token: `admin_${Date.now()}`,
        user: {
          id: "super-admin",
          name: superAdminName,
          email: superAdminEmail,
          role: "admin",
        },
      });
    }

    const student = await Student.findOne({ email, isActive: true });
    if (student && student.password === password) {
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token: `token_${student._id}`,
        user: {
          id: student._id,
          name: student.name,
          email: student.email,
          role: student.role,
        },
      });
    }

    const staff = await Staff.findOne({ email, isActive: true });
    if (staff && staff.password === password) {
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token: `token_${staff._id}`,
        user: {
          id: staff._id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials or application not approved",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

exports.getPendingApplications = async (req, res) => {
  try {
    const applications = await RegistrationApplication.find({
      status: "pending",
    }).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: applications.length, applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

exports.approveApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { adminId } = req.body;

    const application = await RegistrationApplication.findById(applicationId);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    if (application.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Application already reviewed" });
    }

    // Check if Student/Staff record already exists
    if (application.role === "student") {
      const existingStudent = await Student.findOne({
        registrationId: application._id,
      });
      if (!existingStudent) {
        await Student.create({
          name: application.name,
          email: application.email,
          password: application.password,
          role: "student",
          registrationId: application._id,
          isActive: true,
        });
      }
    } else {
      const existingStaff = await Staff.findOne({
        registrationId: application._id,
      });
      if (!existingStaff) {
        await Staff.create({
          name: application.name,
          email: application.email,
          password: application.password,
          role: application.role,
          registrationId: application._id,
          isActive: true,
        });
      }
    }

    application.status = "approved";
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    return res
      .status(200)
      .json({ success: true, message: "Application approved", application });
  } catch (error) {
    console.error("Approval error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to approve application",
      error: error.message,
    });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { adminId, reason } = req.body;

    const application = await RegistrationApplication.findById(applicationId);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    if (application.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Application already reviewed" });
    }

    application.status = "rejected";
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    application.rejectionReason = reason || null;
    await application.save();

    return res
      .status(200)
      .json({ success: true, message: "Application rejected", application });
  } catch (error) {
    console.error("Rejection error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject application",
      error: error.message,
    });
  }
};

exports.getApplicationStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const application = await RegistrationApplication.findOne({ email });

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    return res.status(200).json({
      success: true,
      application: {
        id: application._id,
        email: application.email,
        role: application.role,
        status: application.status,
        createdAt: application.createdAt,
        reviewedAt: application.reviewedAt,
        rejectionReason: application.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch application status",
      error: error.message,
    });
  }
};
