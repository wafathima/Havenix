const Notification = require('../../models/Notification');
const User = require('../../models/User');
const { getIO } = require('../../socket');

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'name profilePic role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const createNotification = async (recipientId, senderId, type, title, message, data = {}) => {
  try {
    // Validate required fields
    if (!recipientId || !senderId || !type) {
      console.error('Missing required fields for notification:', { recipientId, senderId, type });
      return null;
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type: type,
      title: title,
      message: message,
      data: data
    });
    
    await notification.save();
    
    // Populate sender info
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'name profilePic role');
    
    // Emit socket event for real-time notification
    try {
      const io = getIO();
      if (io) {
        const roomName = `user-${recipientId.toString()}`;
        console.log(`📡 Emitting to room: ${roomName}`);
        io.to(roomName).emit('new_notification', populatedNotification);
        console.log(`✅ Notification emitted successfully to ${roomName}`);
      } else {
        console.log('⚠️ Socket.IO not initialized, notification saved but not emitted');
      }
    } catch (socketError) {
      console.error('❌ Socket emission failed:', socketError);
      // Don't fail the notification creation if socket fails
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
};