import React, { useState } from "react";
import "./Sidebar.css";
import {
  FaSearch,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaComments,
  FaCircle,
} from "react-icons/fa";
import { buildAvatarUrl } from "../../Utils/avatarOptions";
import { formatLastSeen, isOnline } from "../../Utils/formatLastSeen";

const Sidebar = ({
  currentUser,
  conversations,
  selectedConversation,
  onSelectConversation,
  onlineUsers,
  onSettings,
  onLogout,
  searchQuery,
  onSearchChange,
}) => {
  const [hoveredChat, setHoveredChat] = useState(null);

  const getOtherUserFromConversation = (conversation) => {
    return conversation.participants.find((p) => p.user_id !== currentUser.user_id);
  };

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <aside className="sidebar">
      {/* Profile Card */}
      <div className="sidebar-header">
        <div className="profile-card glass-panel">
          <img
            src={buildAvatarUrl(currentUser.avatar_seed)}
            alt={currentUser.user_name}
            className="profile-avatar"
          />
          <div className="profile-info">
            <h3 className="profile-name">{currentUser.user_name}</h3>
            <p className="profile-status">
              {isUserOnline(currentUser.user_id) ? "Online" : "Offline"}
            </p>
          </div>
          <div className="profile-actions">
            <button
              className="icon-button"
              onClick={onSettings}
              title="Settings"
              aria-label="Settings"
            >
              <FaCog size={16} />
            </button>
            <button
              className="icon-button logout"
              onClick={onLogout}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <FaSignOutAlt size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="search-container glass-panel">
          <FaSearch className="search-icon" size={14} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="sidebar-section">
        <h4 className="section-header">
          <FaComments size={12} /> Messages
        </h4>
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <div className="empty-state">
              <p>No conversations yet</p>
              <span>Start a new chat to begin messaging</span>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherUserFromConversation(conversation);
              const isSelected =
                selectedConversation?.conversation_id === conversation.conversation_id;
              const userOnline = isUserOnline(otherUser?.user_id);
              const unreadCount = conversation.unread_count || 0;

              return (
                <button
                  key={conversation.conversation_id}
                  className={`conversation-item ${isSelected ? "selected" : ""} ${
                    unreadCount > 0 ? "unread" : ""
                  }`}
                  onClick={() => onSelectConversation(conversation)}
                  onMouseEnter={() =>
                    setHoveredChat(conversation.conversation_id)
                  }
                  onMouseLeave={() => setHoveredChat(null)}
                >
                  <div className="conversation-avatar-wrapper">
                    <img
                      src={buildAvatarUrl(otherUser?.avatar_seed || "default")}
                      alt={otherUser?.user_name}
                      className="conversation-avatar"
                    />
                    {userOnline && <div className="status-dot status-online"></div>}
                  </div>

                  <div className="conversation-content">
                    <h5 className="conversation-name">
                      {otherUser?.user_name}
                    </h5>
                    <p className="conversation-preview">
                      {conversation.last_message?.text || "No messages yet"}
                    </p>
                  </div>

                  <div className="conversation-meta">
                    {unreadCount > 0 && (
                      <span className="unread-badge">{unreadCount}</span>
                    )}
                    <span className="conversation-time">
                      {formatLastSeen(conversation.last_message?.timestamp)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Online Users */}
      <div className="sidebar-section online-users-section">
        <h4 className="section-header">Online Now</h4>
        <div className="online-users-list">
          {onlineUsers.length === 0 ? (
            <p className="empty-state-text">No users online</p>
          ) : (
            onlineUsers.slice(0, 8).map((userId) => (
              <div key={userId} className="online-user-item">
                <FaCircle size={8} className="status-dot status-online" />
                <span>{userId}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
