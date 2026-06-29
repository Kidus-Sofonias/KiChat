import React from "react";
import {
  FaReply,
  FaSmile,
  FaEllipsisV,
  FaCheck,
  FaCheckDouble,
  FaFileAlt,
  FaMicrophone,
  FaDownload,
} from "react-icons/fa";
import { buildAvatarUrl } from "../../Utils/avatarOptions";
import { formatBubbleTime } from "../../Utils/formatLastSeen";
import "./Messages.css";

/**
 * Standalone Messages component.
 *
 * Accepts the same message schema used throughout the app:
 *   { id, sender, receiver, content, isFile, fileType, fileUrl, caption, reactions, createdAt }
 *
 * `currentUserId` should be the logged-in user's `user_name` string.
 */
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
    return formatBubbleTime(timestamp);
  };

  const getDisplayFileName = (fileUrl = "") => {
    const raw = fileUrl.split("/").pop()?.split("?")[0] || "attachment";
    return decodeURIComponent(raw.replace(/^\d+-/, ""));
  };

  const getAttachmentKind = (fileType = "", fileUrl = "") => {
    if (fileType.startsWith("image/")) return "image";
    if (fileType.startsWith("video/")) return "video";
    if (fileType.startsWith("audio/")) return "audio";
    const ext = fileUrl.split("?")[0].split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
    if (["mp4", "webm", "mov", "m4v", "mkv"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg", "m4a", "aac"].includes(ext)) return "audio";
    return "file";
  };

  const renderMessageContent = (message) => {
    if (!message.isFile) {
      return <p className="message-text">{message.content}</p>;
    }

    if (!message.fileUrl) {
      return <p className="message-text">File unavailable</p>;
    }

    const fileName = getDisplayFileName(message.fileUrl);
    const kind = getAttachmentKind(message.fileType || "", message.fileUrl);

    if (kind === "image") {
      return (
        <div className="message-file">
          {message.caption && <p className="message-text">{message.caption}</p>}
          <img src={message.fileUrl} alt={fileName} className="file-preview-image" />
          <a
            href={message.fileUrl}
            download={fileName}
            className="file-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaDownload size={12} /> {fileName}
          </a>
        </div>
      );
    }

    if (kind === "video") {
      return (
        <div className="message-file">
          {message.caption && <p className="message-text">{message.caption}</p>}
          <video src={message.fileUrl} controls playsInline className="message-video" />
          <a
            href={message.fileUrl}
            download={fileName}
            className="file-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaDownload size={12} /> Download video
          </a>
        </div>
      );
    }

    if (kind === "audio") {
      return (
        <div className="message-file">
          {message.caption && <p className="message-text">{message.caption}</p>}
          <div className="audio-message-card">
            <div className="audio-message-icon">
              <FaMicrophone />
            </div>
            <div className="audio-message-copy">
              {/* FIX #15: show duration once metadata loads */}
              <strong>{fileName}</strong>
              <audio
                src={message.fileUrl}
                controls
                onLoadedMetadata={(e) => {
                  const dur = e.currentTarget.duration;
                  if (dur && isFinite(dur)) {
                    const mins = String(Math.floor(dur / 60)).padStart(2, "0");
                    const secs = String(Math.floor(dur % 60)).padStart(2, "0");
                    e.currentTarget.previousSibling.textContent = `${fileName} · ${mins}:${secs}`;
                  }
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    // Generic file
    return (
      <div className="message-file">
        {message.caption && <p className="message-text">{message.caption}</p>}
        <a
          href={message.fileUrl}
          download={fileName}
          className="file-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaFileAlt size={14} /> {fileName}
        </a>
      </div>
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
        const messageId = message._id ?? message.id ?? message.message_id;
        // Support both username string (new schema) and numeric id (legacy schema)
        const isOwn = message.sender === currentUserId || message.sender_id === currentUserId;

        return (
          <div
            key={messageId}
            className={`message-group ${isOwn ? "own" : "other"}`}
          >
            {!isOwn && (message.sender || message.sender?.user_name) && (
              <img
                src={buildAvatarUrl(message.sender?.avatar_seed || message.sender)}
                alt={message.sender?.user_name || message.sender}
                className="message-avatar"
              />
            )}

            <div className={`message-bubble ${isOwn ? "sent" : "received"}`}>
              {(message.replyTo || message.reply_to) && (
                <div className="reply-quote">
                  <FaReply size={12} />
                  {/* FIX #14: show sender name above the quoted content */}
                  <div className="reply-quote-inner">
                    {(message.replyToSender || message.reply_to?.sender) && (
                      <span className="reply-quote-sender">
                        {message.replyToSender || message.reply_to?.sender}
                      </span>
                    )}
                    <span>
                      {message.replyToContent || message.reply_to?.text || ""}
                    </span>
                  </div>
                </div>
              )}

              {renderMessageContent(message)}

              <div className="message-meta">
                <span className="message-time">
                  {formatTime(message.createdAt || message.timestamp)}
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

              {message.reactions &&
                Object.keys(message.reactions).length > 0 && (
                  <div className="message-reactions">
                    {Object.entries(message.reactions).map(([emoji, users]) =>
                      users.length > 0 ? (
                        <span key={emoji} className="reaction-emoji">
                          {emoji} {users.length > 1 ? users.length : ""}
                        </span>
                      ) : null
                    )}
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

