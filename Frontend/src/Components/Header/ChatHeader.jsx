import React from "react";
import {
  FaPhone,
  FaVideo,
  FaSearch,
  FaEllipsisV,
  FaCircle,
} from "react-icons/fa";
import { buildAvatarUrl } from "../../Utils/avatarOptions";
import { isOnline, formatLastSeen } from "../../Utils/formatLastSeen";
import "./ChatHeader.css";

const ChatHeader = ({
  selectedConversation,
  currentUser,
  onlineUsers,
  onCall,
  onVideoCall,
  onSearch,
  onMore,
}) => {
  if (!selectedConversation) {
    return (
      <header className="chat-header empty">
        <div className="header-content">
          <h2>Select a conversation to start messaging</h2>
        </div>
      </header>
    );
  }

  const otherUser = selectedConversation.participants.find(
    (p) => p.user_id !== currentUser.user_id
  );
  const userOnline = onlineUsers.includes(otherUser?.user_id);

  return (
    <header className="chat-header">
      <div className="header-content">
        <div className="header-user-info">
          <div className="header-avatar-wrapper">
            <img
              src={buildAvatarUrl(otherUser?.avatar_seed || "default")}
              alt={otherUser?.user_name}
              className="header-avatar"
            />
            {userOnline && (
              <div className="header-status-indicator status-online"></div>
            )}
          </div>

          <div className="header-user-details">
            <h3 className="header-user-name">{otherUser?.user_name}</h3>
            <p className="header-user-status">
              {userOnline
                ? "Online"
                : `Last seen ${formatLastSeen(
                    new Date().toISOString()
                  ).toLowerCase()}`}
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="header-icon-button"
            onClick={onCall}
            title="Voice Call"
            aria-label="Voice Call"
          >
            <FaPhone size={16} />
          </button>
          <button
            className="header-icon-button"
            onClick={onVideoCall}
            title="Video Call"
            aria-label="Video Call"
          >
            <FaVideo size={16} />
          </button>
          <button
            className="header-icon-button"
            onClick={onSearch}
            title="Search"
            aria-label="Search"
          >
            <FaSearch size={16} />
          </button>
          <button
            className="header-icon-button"
            onClick={onMore}
            title="More Options"
            aria-label="More Options"
          >
            <FaEllipsisV size={16} />
          </button>
        </div>
      </div>

      <div className="header-divider"></div>
    </header>
  );
};

export default ChatHeader;
