import { useEffect, useRef, useState } from "react";
import { FaReply, FaEdit, FaTrash } from "react-icons/fa";
import "./MessageActions.css";

const EMOJI_REACTIONS = ["❤️", "😂", "😮", "😢", "😡", "👍", "🔥", "🎉"];

const MessageActions = ({ message, onReply, onReact, onDelete, onEdit, isOwnMessage = false, isVisible = false }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const emojiPickerRef = useRef(null);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emoji) => {
    onReact(emoji);
    setShowEmojiPicker(false);
  };

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu);
    setShowEmojiPicker(false);
  };

  const handleEditClick = () => {
    setShowMoreMenu(false);
    if (onEdit) onEdit(message);
  };

  const handleDeleteClick = () => {
    setShowMoreMenu(false);
    if (onDelete) onDelete(message);
  };

  return (
    <div className={`message-actions ${isVisible ? 'visible' : ''}`}>
      <div className="message-actions-bar">
        {isOwnMessage && (
          <div className="message-actions-more-wrapper" ref={moreMenuRef}>
            <button
              type="button"
              className="message-action-icon more-btn"
              onClick={handleMoreClick}
              title="More"
            >
              <span className="more-dots"></span>
            </button>

            {showMoreMenu && (
              <div className="more-menu-popup">
                <button
                  type="button"
                  className="more-menu-item"
                  onClick={handleEditClick}
                >
                  <FaEdit />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="more-menu-item delete-item"
                  onClick={handleDeleteClick}
                >
                  <FaTrash />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className="message-action-icon reply-btn"
          onClick={() => onReply(message)}
          title="Reply"
        >
          <FaReply />
        </button>

        <div className="message-actions-emoji-wrapper" ref={emojiPickerRef}>
          <button
            type="button"
            className="message-action-icon emoji-btn"
            onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowMoreMenu(false); }}
            title="React"
          >
            <span className="emoji-icon">😊</span>
          </button>

          {showEmojiPicker && (
            <div className="emoji-picker-popup">
              <div className="emoji-picker-strip">
                {EMOJI_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="emoji-picker-item"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageActions;