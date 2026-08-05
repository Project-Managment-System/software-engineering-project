const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    trim: true,
    default: ""
  },
  attachment: {
    type: {
      fileName: { type: String },
      fileType: { type: String },
      fileData: { type: String }
    },
    default: undefined
  },
  read: {
    type: Boolean,
    default: false
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null
  }
}, {
  timestamps: true
});

// GET /api/messages/unread/:userId is polled every few seconds by every active dashboard
// session — this compound index lets that aggregate's $match stage use an index scan
// instead of a full collection scan, which matters most as message history grows.
MessageSchema.index({ recipient: 1, read: 1 });
// Serves the two-user chat history query (both directions of its sender/recipient $or,
// since each branch specifies equality on both fields) with the sort already satisfied.
MessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

module.exports = mongoose.model("Message", MessageSchema);
