const Notification = require("../models/notificationsModel");
const User = require("../models/user");


exports.create = async(req, res) => {
    try {
        const newNotification = new Notification(req.body);
        await newNotification.save();
        res.send({
            success: true,
            message: "Notification added successfully",
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
};

exports.createAdmin = async(req, res) => {
    try {
        const user = await User.find({ role: "admin" })
            // const newNotification = new Notification({...req.body , _id});
            // await newNotification.save();
            // res.send({
            //     success: true, 
            //     message: "Notification added successfully",
            // });

        res.send(user)
    } catch (error) {
        console.log(error)
        res.send({
            success: false,
            message: error.message,
        });
    }
};

exports.listAll = async(req, res) => {
    try {
        const { userId } = req.body; // Assuming the user ID is available in req.body.userId


        const notifications = await Notification.find({
            user: { $in: [userId] }, // Use $in operator to match notifications with the specified user ID
        }).sort({ createdAt: -1 });

        res.send({
            success: true,
            data: notifications,
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
};

exports.remove = async(req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.send({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
}
exports.read = async(req, res) => {
    try {
        const { email } = req.user;

        // Find the user based on the email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await Notification.updateMany({ user: user._id, read: false }, { $set: { read: true } });
        res.send({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.log(error)
    }
}