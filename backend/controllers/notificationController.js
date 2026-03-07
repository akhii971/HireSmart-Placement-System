import Notification from "../models/Notification.js";

// @desc    Get all notifications for logged-in user or recruiter
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = async (req, res) => {
    try {
        const isRecruiter = !!req.recruiter;
        const ownerId = isRecruiter ? req.recruiter._id : req.user._id;
        const filter = isRecruiter ? { recruiterId: ownerId } : { userId: ownerId };

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            ...filter,
            read: false,
        });

        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsRead = async (req, res) => {
    try {
        const isRecruiter = !!req.recruiter;
        const ownerId = isRecruiter ? req.recruiter._id : req.user._id;
        const filter = isRecruiter ? { recruiterId: ownerId, read: false } : { userId: ownerId, read: false };

        await Notification.updateMany(filter, { read: true });
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req, res) => {
    try {
        const isRecruiter = !!req.recruiter;
        const ownerId = isRecruiter ? req.recruiter._id.toString() : req.user._id.toString();

        const notif = await Notification.findById(req.params.id);
        if (!notif) return res.status(404).json({ message: "Not found" });

        const notifOwnerId = isRecruiter ? notif.recruiterId?.toString() : notif.userId?.toString();

        if (notifOwnerId !== ownerId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        notif.read = true;
        await notif.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
