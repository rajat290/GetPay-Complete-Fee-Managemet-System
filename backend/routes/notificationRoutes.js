const express = require("express");
const { protect, requireStudent } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require("../controllers/notificationController");

const router = express.Router();

// Get all notifications for student
router.get("/", protect, requireStudent, getNotifications);

// Mark specific notification as read
router.put("/:notificationId/read", protect, requireStudent, markAsRead);

// Mark all notifications as read
router.put("/read-all", protect, requireStudent, markAllAsRead);

// Get unread notification count
router.get("/unread-count", protect, requireStudent, getUnreadCount);

module.exports = router;
