import React from "react";
import {
  FaReply,
  FaSmile,
  FaEllipsisV,
  FaCheck,
  FaCheckDouble,
} from "react-icons/fa";
import { buildAvatarUrl } from "../../Utils/avatarOptions";
import { formatBubbleTime } from "../../Utils/formatLastSeen";
import "./Messages.css";

const Messages = ({
  messages = [],
  currentUserId,
  onReply,
  onReact,
  onDelete,
  isLoading = false,
}) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessageContent = (message) => {
    if (message.file_url) {
      const fileName = message.file_name || "File";
      return (
        <div className="message-file">
          <a
            href={message.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="file-link"
          >
            📎 {fileName}
          </a>
        </div>
      );
    }

    if (message.image_url) {
      return (
        <div className="message-image">
          <img src={message.image_url} alt="Message attachment" />
        </div>
      );
    }

    return (
      <p className="message-text">
        {message.text}
      </p>
    );
  };

  return (
    <div className="messages-container">
      {isLoading && (
        <div className="messages-loading">
          <div className="loading-skeleton"></div>
          <div className="loading-skeleton"></div>
          <div className="loading-skeleton"></div>
        </div>
      )}

      {messages.length === 0 && !isLoading && (
        <div className="messages-empty">
          <div className="empty-icon">💬</div>
          <p>No messages yet</p>
          <span>Start a conversation by sending a message</span>
        </div>
      )}

      {messages.map((message) => {
        const isOwn = message.sender_id === currentUserId;
        return (
          <div
            key={message.message_id}
            className={`message-group ${isOwn ? "own" : "other"}`}
          >
            {!isOwn && message.sender && (
              <img
                src={buildAvatarUrl(message.sender.avatar_seed)}
                alt={message.sender.user_name}
                className="message-avatar"
              />
            )}

            <div className={`message-bubble ${isOwn ? "sent" : "received"}`}>
              {message.reply_to && (
                <div className="reply-quote">
                  <FaReply size={12} />
                  <span>{message.reply_to.text}</span>
                </div>
              )}

              {renderMessageContent(message)}

              <div className="message-meta">
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
                {isOwn && (
                  <span className="read-receipt">
                    {message.read_at ? (
                      <FaCheckDouble size={12} />
                    ) : (
                      <FaCheck size={12} />
                    )}
                  </span>
                )}
              </div>

              {message.reactions && message.reactions.length > 0 && (
                <div className="message-reactions">
                  {message.reactions.map((reaction, idx) => (
                    <span key={idx} className="reaction-emoji">
                      {reaction.emoji}
                    </span>
                  ))}
                </div>
              )}

              <div className="message-actions">
                <button
                  className="action-btn"
                  onClick={() => onReact?.(message)}
                  title="React"
                  aria-label="Add reaction"
                >
                  <FaSmile size={14} />
                </button>
                <button
                  className="action-btn"
                  onClick={() => onReply?.(message)}
                  title="Reply"
                  aria-label="Reply to message"
                >
                  <FaReply size={14} />
                </button>
                {isOwn && (
                  <button
                    className="action-btn delete"
                    onClick={() => onDelete?.(message)}
                    title="Delete"
                    aria-label="Delete message"
                  >
                    <FaEllipsisV size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
