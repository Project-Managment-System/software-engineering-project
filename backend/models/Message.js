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

module.exports = mongoose.model("Message", MessageSchema);
