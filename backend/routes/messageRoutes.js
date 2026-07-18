const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");

// Send a new message
router.post("/", async (req, res) => {
  try {
    const { sender, recipient, content, replyTo } = req.body;
    if (!sender || !recipient || !content) {
      return res.status(400).json({ error: "Sender, recipient, and content are required" });
    }

    const newMessage = new Message({
      sender,
      recipient,
      content,
      replyTo: replyTo || null
    });

    await newMessage.save();
    const populated = await Message.findById(newMessage._id).populate("replyTo");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chat history between two users
router.get("/:userId1/:userId2", async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId1, recipient: userId2 },
        { sender: userId2, recipient: userId1 }
      ]
    }).populate("replyTo").sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count grouped by sender for a recipient
router.get("/unread/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Group unread messages by sender
    const unreadGrouped = await Message.aggregate([
      { $match: { recipient: new mongoose.Types.ObjectId(userId), read: false } },
      { $group: { _id: "$sender", count: { $sum: 1 } } }
    ]);

    const counts = {};
    unreadGrouped.forEach(item => {
      counts[item._id.toString()] = item.count;
    });

    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark messages as read from a sender to a recipient
router.put("/read/:senderId/:recipientId", async (req, res) => {
  try {
    const { senderId, recipientId } = req.params;
    await Message.updateMany(
      { sender: senderId, recipient: recipientId, read: false },
      { $set: { read: true } }
    );
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
