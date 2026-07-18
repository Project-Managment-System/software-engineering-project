import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { User, MessageSquare, Send, Search, CornerUpLeft, X, Trash2, Paperclip, FileText, Download } from "lucide-react";
import "./DivisionChat.css";

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB — keeps base64-in-Mongo doc size sane

export default function DivisionChat({ myId, currentDivision, myRole }) {
  const [chatUsers, setChatUsers] = useState([]);
  const [chatSearch, setChatSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [conversations, setConversations] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch users in the same division
  const fetchChatUsers = async () => {
    if (!currentDivision) return;
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/users/division/${currentDivision}`);
      // Filter out ourselves
      const filtered = res.data.filter(u => u._id !== myId);
      setChatUsers(filtered);
    } catch (err) {
      console.error("Error fetching chat users:", err);
    }
  };

  // Fetch unread message counts
  const fetchUnreadCounts = async () => {
    if (!myId) return;
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/messages/unread/${myId}`);
      setUnreadCounts(res.data || {});
    } catch (err) {
      console.error("Error fetching unread counts:", err);
    }
  };

  // Fetch last message + timestamp per conversation partner (for inbox previews)
  const fetchConversations = async () => {
    if (!myId) return;
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/messages/conversations/${myId}`);
      setConversations(res.data || {});
    } catch (err) {
      console.error("Error fetching conversation previews:", err);
    }
  };

  // Fetch messages with the selected user
  const fetchChatMessages = async (targetUserId) => {
    if (!myId || !targetUserId) return;
    try {
      const res = await axios.get(`http://127.0.0.1:5000/api/messages/${myId}/${targetUserId}`);
      setChatMessages(res.data || []);
    } catch (err) {
      console.error("Error fetching chat messages:", err);
    }
  };

  // Mark selected user's messages as read
  const markMessagesAsRead = async (senderId) => {
    if (!myId || !senderId) return;
    try {
      await axios.put(`http://127.0.0.1:5000/api/messages/read/${senderId}/${myId}`);
      fetchUnreadCounts();
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Send message (text and/or attachment)
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!chatInput.trim() && !pendingAttachment) || !selectedUser || !myId) return;

    const payload = {
      sender: myId,
      recipient: selectedUser._id,
      content: chatInput.trim(),
      attachment: pendingAttachment || undefined,
      replyTo: replyingTo ? replyingTo._id : null
    };

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/messages", payload);
      setChatMessages(prev => [...prev, res.data]);
      setChatInput("");
      setReplyingTo(null);
      setPendingAttachment(null);
      fetchConversations();

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Read a picked file (image or document) into a base64 attachment payload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // allow re-picking the same file later
    if (!file) return;

    setAttachmentError("");
    if (file.size > MAX_ATTACHMENT_SIZE) {
      setAttachmentError("File is too large (max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPendingAttachment({
        fileName: file.name,
        fileType: file.type,
        fileData: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  // Delete a message you sent
  const handleDeleteMessage = async (messageId) => {
    if (!myId) return;
    if (!window.confirm("Delete this message?")) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/messages/${messageId}?userId=${myId}`);
      setChatMessages(prev => prev.filter(m => m._id !== messageId));
      if (replyingTo?._id === messageId) setReplyingTo(null);
      fetchConversations();
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  // Fetch initial user list, unread counts and conversation previews on mount
  useEffect(() => {
    fetchChatUsers();
    fetchUnreadCounts();
    fetchConversations();
  }, [currentDivision, myId]);

  // Set up 4-second short-polling interval for unread counts, previews and selected user chat history
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUnreadCounts();
      fetchConversations();
      if (selectedUser) {
        fetchChatMessages(selectedUser._id);
        markMessagesAsRead(selectedUser._id); // Mark messages read automatically while active
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [selectedUser, myId]);

  // Fetch messages and mark as read when selecting a new user
  useEffect(() => {
    if (selectedUser) {
      setReplyingTo(null);
      fetchChatMessages(selectedUser._id);
      markMessagesAsRead(selectedUser._id);
      // Scroll to bottom immediately on chat switch
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
    }
  }, [selectedUser]);

  // Helper to format role names beautifully
  const formatRole = (role) => {
    if (!role) return "";
    return role
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Telegram-style relative timestamp: time for today, weekday for this week, date otherwise
  const formatConversationTime = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { day: "2-digit", month: "short" });
  };

  // Sort chats Telegram-style: unread first, then by most recent message activity
  const sortedChatUsers = [...chatUsers].sort((a, b) => {
    const unreadA = unreadCounts[a._id] || 0;
    const unreadB = unreadCounts[b._id] || 0;
    if (unreadA > 0 && unreadB === 0) return -1;
    if (unreadB > 0 && unreadA === 0) return 1;

    const lastA = conversations[a._id]?.createdAt ? new Date(conversations[a._id].createdAt).getTime() : 0;
    const lastB = conversations[b._id]?.createdAt ? new Date(conversations[b._id].createdAt).getTime() : 0;
    if (lastA !== lastB) return lastB - lastA;

    return a.fullName.localeCompare(b.fullName);
  });

  return (
    <div className="division-chat-container">
      {/* Sidebar List of Users */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="chat-search-input"
              placeholder="Search members..."
              value={chatSearch}
              onChange={e => setChatSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="chat-user-list">
          {sortedChatUsers
            .filter(u => u.fullName.toLowerCase().includes(chatSearch.toLowerCase()))
            .map(user => {
              const count = unreadCounts[user._id] || 0;
              const hasUnread = count > 0;
              const isSelected = selectedUser && selectedUser._id === user._id;
              return (
                <div
                  key={user._id}
                  className={`chat-user-item ${isSelected ? "active" : ""} ${hasUnread ? "has-unread" : ""}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="chat-user-avatar">
                    {user.profilePic ? (
                      <img src={user.profilePic} alt={user.fullName} />
                    ) : (
                      <User size={20} className="default-avatar-icon" />
                    )}
                  </div>
                  <div className="chat-user-info">
                    <div className="chat-user-row-top">
                      <div className="chat-user-name">{user.fullName}</div>
                      {conversations[user._id]?.createdAt && (
                        <span className="chat-user-time">{formatConversationTime(conversations[user._id].createdAt)}</span>
                      )}
                    </div>
                    <div className="chat-user-preview">
                      {conversations[user._id]
                        ? `${conversations[user._id].isMine ? "You: " : ""}${conversations[user._id].content}`
                        : formatRole(user.role)}
                    </div>
                  </div>
                  {hasUnread && (
                    <div className="chat-unread-badge">
                      {count}
                    </div>
                  )}
                </div>
              );
            })}
          {chatUsers.length === 0 && (
            <div className="chat-no-users">
              No members found in your division.
            </div>
          )}
        </div>
      </div>

      {/* Main Messaging Window */}
      <div className="chat-content-pane">
        {selectedUser ? (
          <>
            <div className="chat-pane-header">
              <div className="chat-user-avatar header-avatar">
                {selectedUser.profilePic ? (
                  <img src={selectedUser.profilePic} alt={selectedUser.fullName} />
                ) : (
                  <User size={18} className="default-avatar-icon" />
                )}
              </div>
              <div className="chat-pane-header-info">
                <h4>{selectedUser.fullName}</h4>
                <span>{formatRole(selectedUser.role)}</span>
              </div>
            </div>

            <div className="chat-messages-area">
              {chatMessages.map(msg => {
                const isSent = msg.sender === myId;
                const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                });
                return (
                  <div
                    key={msg._id}
                    id={`msg-${msg._id}`}
                    className={`chat-message-bubble-wrapper ${isSent ? "sent-wrapper" : "received-wrapper"}`}
                  >
                    <div className={`chat-message-bubble ${isSent ? "sent" : "received"}`}>
                      {msg.replyTo && (
                        <div 
                          className="replied-message-quote"
                          onClick={() => {
                            const el = document.getElementById(`msg-${msg.replyTo._id || msg.replyTo}`);
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "center" });
                              el.classList.add("highlight-flash");
                              setTimeout(() => el.classList.remove("highlight-flash"), 1500);
                            }
                          }}
                        >
                          <div className="quote-sender">
                            {msg.replyTo.sender === myId ? "You" : (selectedUser?.fullName || "Member")}
                          </div>
                          <div className="quote-content">
                            {msg.replyTo.content || "Message deleted or unavailable"}
                          </div>
                        </div>
                      )}
                      {msg.attachment?.fileData && (
                        msg.attachment.fileType?.startsWith("image/") ? (
                          <a href={msg.attachment.fileData} target="_blank" rel="noopener noreferrer" className="attachment-image-link">
                            <img src={msg.attachment.fileData} alt={msg.attachment.fileName} className="attachment-image" />
                          </a>
                        ) : (
                          <a
                            href={msg.attachment.fileData}
                            download={msg.attachment.fileName}
                            className="attachment-file-chip"
                          >
                            <FileText size={18} />
                            <span className="attachment-file-name">{msg.attachment.fileName}</span>
                            <Download size={14} />
                          </a>
                        )
                      )}
                      {msg.content && <div className="bubble-content">{msg.content}</div>}
                      <div className="bubble-time">{timeStr}</div>
                    </div>
                    <div className="chat-message-actions">
                      <button
                        type="button"
                        className="chat-message-reply-btn"
                        onClick={() => setReplyingTo({
                          _id: msg._id,
                          senderName: msg.sender === myId ? "You" : (selectedUser?.fullName || "Member"),
                          content: msg.content || msg.attachment?.fileName || "Attachment"
                        })}
                        title="Reply"
                      >
                        <CornerUpLeft size={14} />
                      </button>
                      {isSent && (
                        <button
                          type="button"
                          className="chat-message-delete-btn"
                          onClick={() => handleDeleteMessage(msg._id)}
                          title="Delete message"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {replyingTo && (
              <div className="reply-preview-bar">
                <div className="reply-preview-content">
                  <div className="reply-preview-title">Replying to {replyingTo.senderName}</div>
                  <div className="reply-preview-text">{replyingTo.content}</div>
                </div>
                <button 
                  type="button" 
                  className="reply-preview-close" 
                  onClick={() => setReplyingTo(null)}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {attachmentError && (
              <div className="attachment-error-bar">{attachmentError}</div>
            )}

            {pendingAttachment && (
              <div className="attachment-preview-bar">
                {pendingAttachment.fileType?.startsWith("image/") ? (
                  <img src={pendingAttachment.fileData} alt={pendingAttachment.fileName} className="attachment-preview-thumb" />
                ) : (
                  <FileText size={20} />
                )}
                <span className="attachment-preview-name">{pendingAttachment.fileName}</span>
                <button
                  type="button"
                  className="attachment-preview-remove"
                  onClick={() => setPendingAttachment(null)}
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="chat-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Attach image or document"
              >
                <Paperclip size={18} />
              </button>
              <input
                type="text"
                className="chat-textarea"
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!chatInput.trim() && !pendingAttachment}
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="chat-empty-state">
            <MessageSquare size={48} className="chat-empty-icon" />
            <h3>Division Chat Room</h3>
            <p>Select a member from {currentDivision || "your division"} to start a private conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
