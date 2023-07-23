const Conversation = require("../models/Conversation");
const Category = require("../models/category");
const slugify = require("slugify");


exports.create = async(req, res) => {
    const senderId = req.body.senderId;
    const receiverId = req.body.receiverId;

    try {
        const existingConversation = await Conversation.findOne({
            members: {
                $all: [senderId, receiverId],
            },
        });

        if (existingConversation) {
            // Conversation already exists with the same members
            return res.status(200).json(existingConversation);
        }

        const newConversation = new Conversation({
            members: [senderId, receiverId],
        });

        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.getUser = async(req, res) => {
    try {
        const conversation = await Conversation.find({
            members: { $in: [req.params.userId] },
        });
        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json(err);
    }
}

exports.getUsers = async(req, res) => {
    try {
        const conversation = await Conversation.findOne({
            members: { $all: [req.params.firstUserId, req.params.secondUserId] },
        });
        res.status(200).json(conversation)
    } catch (err) {
        res.status(500).json(err);
    }
}