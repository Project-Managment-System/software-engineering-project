const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");

// Send a new message
router.post("/", async (req, res) => {
  try {
    const { sender, recipient, content, replyTo, attachment } = req.body;
    if (!sender || !recipient) {
      return res.status(400).json({ error: "Sender and recipient are required" });
    }
    if (!content?.trim() && !attachment?.fileData) {
      return res.status(400).json({ error: "Message must have text content or an attachment" });
    }

    const newMessage = new Message({
      sender,
      recipient,
      content: content?.trim() || "",
      attachment: attachment?.fileData ? attachment : undefined,
      replyTo: replyTo || null
    });

    await newMessage.save();
    const populated = await Message.findById(newMessage._id).populate("replyTo");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a message (sender only)
router.delete("/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.query;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (!userId || message.sender.toString() !== userId) {
      return res.status(403).json({ error: "Only the sender can delete this message" });
    }

    await Message.deleteOne({ _id: messageId });
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count grouped by sender for a recipient
// NOTE: must be registered before the generic "/:userId1/:userId2" route below —
// both are 2-segment paths, and Express matches whichever is registered first.
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

// Get the last message exchanged with each conversation partner (for inbox previews)
router.get("/conversations/:userId", async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.params.userId);

    const results = await Message.aggregate([
      { $match: { $or: [{ sender: uid }, { recipient: uid }] } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          partner: { $cond: [{ $eq: ["$sender", uid] }, "$recipient", "$sender"] }
        }
      },
      {
        $group: {
          _id: "$partner",
          content: { $first: "$content" },
          attachmentType: { $first: "$attachment.fileType" },
          createdAt: { $first: "$createdAt" },
          sender: { $first: "$sender" }
        }
      }
    ]);

    const conversations = {};
    results.forEach(r => {
      let preview = r.content;
      if (!preview) {
        preview = r.attachmentType?.startsWith("image/") ? "📷 Photo" : "📎 Attachment";
      }
      conversations[r._id.toString()] = {
        content: preview,
        createdAt: r.createdAt,
        isMine: r.sender.toString() === req.params.userId
      };
    });

    res.json(conversations);
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
