import { useEffect, useRef, useState } from "react";
import { FaReply, FaSmile } from "react-icons/fa";
import "./MessageActions.css";

const EMOJI_REACTIONS = ["😍", "😂", "😲", "😢", "😡", "👏", "🔥", "🎉"];

const MessageActions = ({ message, onReply, onReact, userReacted = {} }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEmojiClick = (emoji) => {
    onReact(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="message-actions">
      <div className="message-actions-primary">
        <button
          type="button"
          className="message-action-button message-reply-btn"
          onClick={() => onReply(message)}
          title="Reply"
        >
          <FaReply />
          <span>Reply</span>
        </button>

        <div
          className="message-actions-emoji"
          ref={emojiPickerRef}
        >
          <button
            type="button"
            className="message-action-button message-emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="React"
          >
            <FaSmile />
            <span>React</span>
          </button>

          {showEmojiPicker && (
            <div className="emoji-picker-popup">
              {EMOJI_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="emoji-button"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageActions;
