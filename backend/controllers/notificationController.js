const Notification = require("../models/Notification");
const logger = require("../utils/logger");

// Get all notifications for a student
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
        institutionId: req.institutionId,
        studentId: req.user._id
      })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    logger.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        institutionId: req.institutionId,
        studentId: req.user._id
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    logger.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { institutionId: req.institutionId, studentId: req.user._id, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    logger.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      studentId: req.user._id,
      institutionId: req.institutionId,
      isRead: false
    });
    
    res.json({ count });
  } catch (error) {
    logger.error("Error getting unread count:", error);
    res.status(500).json({ message: "Server error" });
  }
};
