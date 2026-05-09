const Student = require("../models/Student");
const Institution = require("../models/Institution");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../utils/emailService");
const { assertCanAddStudent } = require("../services/subscriptionPlanService");
const logger = require("../utils/logger");

const RESET_TOKEN_EXPIRES_MINUTES = 30;
const AUTH_COOKIE_NAME = "getpay_token";

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
  });
};

// Register
exports.registerStudent = async (req, res) => {
  try {
    if (process.env.PUBLIC_STUDENT_REGISTRATION_ENABLED !== "true") {
      return res.status(403).json({
        error: "Public student registration is disabled. Please contact your institution administrator for an invite."
      });
    }

    const { name, email, registrationNo, password, className, institutionCode } = req.body;

    if (!name || !email || !registrationNo || !password || !className || !institutionCode) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const institution = await Institution.findOne({
      code: institutionCode.toUpperCase(),
      isActive: true
    });

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    const userExists = await Student.findOne({
      institutionId: institution._id,
      $or: [{ email: email.toLowerCase() }, { registrationNo }]
    });
    if (userExists) return res.status(400).json({ error: "User already exists" });

    await assertCanAddStudent(institution);

    const student = await Student.create({
      institutionId: institution._id,
      name,
      email,
      registrationNo,
      password,
      className,
      role: "student"
    });

    const token = generateToken(student._id, student.role);
    setAuthCookie(res, token);

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      institution: {
        _id: institution._id,
        name: institution.name,
        code: institution.code
      },
      token,
    });
  } catch (err) {
    if (err.code === "PLAN_STUDENT_LIMIT_REACHED") {
      return res.status(err.statusCode).json({ error: err.message, details: err.details });
    }
    logger.error("student_registration_failed", { error: err });
    res.status(500).json({ error: "Server error" });
  }
};

// Login
exports.loginStudent = async (req, res) => {
  try {
    const { email, password, institutionCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const superAdmin = await Student.findOne({
      email: email.toLowerCase(),
      role: "super_admin"
    });

    if (superAdmin && (await superAdmin.matchPassword(password))) {
      const token = generateToken(superAdmin._id, superAdmin.role);
      setAuthCookie(res, token);
      return res.json({
        _id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
        token,
      });
    }

    const query = { email: email?.toLowerCase() };

    if (institutionCode) {
      const institution = await Institution.findOne({
        code: institutionCode.toUpperCase(),
        isActive: true
      });

      if (!institution) {
        return res.status(404).json({ error: "Institution not found" });
      }

      query.institutionId = institution._id;
    }

    const students = await Student.find(query).populate("institutionId", "name code isActive");
    if (students.length > 1) {
      return res.status(400).json({ error: "Institution code is required for this email" });
    }

    const student = students[0];
    if (student && (await student.matchPassword(password))) {
      if (!student.institutionId || student.institutionId.isActive === false) {
        return res.status(403).json({ error: "Institution is inactive" });
      }

      if (student.status === "inactive") {
        return res.status(403).json({ error: "Account is not activated" });
      }

      const token = generateToken(student._id, student.role);
      setAuthCookie(res, token);

      res.json({
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        mustChangePassword: Boolean(student.mustChangePassword),
        institution: {
          _id: student.institutionId._id,
          name: student.institutionId.name,
          code: student.institutionId.code
        },
        token,
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    logger.error("login_failed", { error: err });
    res.status(500).json({ error: "Server error" });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email, institutionCode } = req.body;

    const institution = await Institution.findOne({
      code: institutionCode.toUpperCase(),
      isActive: true
    });

    if (!institution) {
      return res.status(200).json({ message: "If the account exists, a reset link has been sent." });
    }

    const user = await Student.findOne({
      institutionId: institution._id,
      email: email.toLowerCase(),
      status: { $ne: "inactive" }
    });

    if (!user) {
      return res.status(200).json({ message: "If the account exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000);
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "http://localhost:5173";
    const resetUrl = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${resetToken}&institutionCode=${institution.code}`;

    const emailResult = await emailService.sendPasswordReset({
      user,
      resetUrl,
      expiresInMinutes: RESET_TOKEN_EXPIRES_MINUTES
    });

    const response = { message: "If the account exists, a reset link has been sent." };
    if (emailResult?.skipped && process.env.NODE_ENV !== "production") {
      response.resetToken = resetToken;
      response.resetUrl = resetUrl;
    }

    res.json(response);
  } catch (err) {
    logger.error("password_reset_request_failed", { error: err });
    res.status(500).json({ error: "Server error" });
  }
};

// Confirm password reset
exports.resetPassword = async (req, res) => {
  try {
    const { token, institutionCode, password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const institution = await Institution.findOne({
      code: institutionCode.toUpperCase(),
      isActive: true
    });

    if (!institution) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const user = await Student.findOne({
      institutionId: institution._id,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    user.password = password;
    user.mustChangePassword = false;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    logger.error("password_reset_failed", { error: err });
    res.status(500).json({ error: "Server error" });
  }
};

// Activate invited account
exports.activateAccount = async (req, res) => {
  try {
    const { token: inviteToken, institutionCode, password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(inviteToken).digest("hex");

    const institution = await Institution.findOne({
      code: institutionCode.toUpperCase(),
      isActive: true
    });

    if (!institution) {
      return res.status(400).json({ error: "Invalid or expired invitation" });
    }

    const user = await Student.findOne({
      institutionId: institution._id,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      status: "inactive"
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired invitation" });
    }

    user.password = password;
    user.status = "active";
    user.mustChangePassword = false;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);
    setAuthCookie(res, token);

    res.json({
      message: "Account activated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: {
          _id: institution._id,
          name: institution.name,
          code: institution.code
        },
        token
      }
    });
  } catch (err) {
    logger.error("account_activation_failed", { error: err });
    res.status(500).json({ error: "Server error" });
  }
};

// Change password for authenticated users, including first-login staff password change
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const user = await Student.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const matches = await user.matchPassword(currentPassword);
    if (!matches) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      message: "Password changed successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: false
      }
    });
  } catch (err) {
    logger.error("change_password_failed", { error: err });
    res.status(500).json({ error: "Server error" });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.user._id,
      institutionId: req.institutionId
    }).select("-password");
    if (!student) return res.status(404).json({ error: "User not found" });
    res.json(student);
  } catch (err) {
    logger.error("profile_fetch_failed", { error: err, actorId: req.user?._id, institutionId: req.institutionId });
    res.status(500).json({ error: "Server error" });
  }
};

exports.logout = async (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
};
