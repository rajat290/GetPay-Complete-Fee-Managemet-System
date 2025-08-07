const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require("../controllers/notificationController");

const router = express.Router();

// Get all notifications for student
router.get("/", protect, getNotifications);

// Mark specific notification as read
router.put("/:notificationId/read", protect, markAsRead);

// Mark all notifications as read
router.put("/read-all", protect, markAllAsRead);

// Get unread notification count
router.get("/unread-count", protect, getUnreadCount);

module.exports = router;
