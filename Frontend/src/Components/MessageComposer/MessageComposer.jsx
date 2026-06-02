import React, { useRef, useState } from "react";
import {
  FaPaperPlane,
  FaSmile,
  FaPaperclip,
  FaMicrophone,
  FaTimes,
} from "react-icons/fa";
import "./MessageComposer.css";

const MessageComposer = ({
  onSendMessage,
  onAttach,
  onEmoji,
  disabled = false,
  placeholder = "Message...",
}) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = e.currentTarget.files;
    if (files && onAttach) {
      onAttach(files);
    }
  };

  const handleVoiceClick = () => {
    setIsRecording(!isRecording);
  };

  const handleEmojiClick = () => {
    if (onEmoji) {
      onEmoji();
    }
  };

  return (
    <div className="message-composer-container">
      <div className="message-composer glass-panel">
        <div className="composer-actions-left">
          <button
            className="composer-icon-button emoji-btn"
            onClick={handleEmojiClick}
            title="Emoji"
            aria-label="Add emoji"
            disabled={disabled}
          >
            <FaSmile size={18} />
          </button>
          <button
            className="composer-icon-button attach-btn"
            onClick={handleAttachClick}
            title="Attach file"
            aria-label="Attach file"
            disabled={disabled}
          >
            <FaPaperclip size={18} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            multiple
            style={{ display: "none" }}
          />
        </div>

        <div className="composer-input-wrapper">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="composer-input"
            disabled={disabled}
            rows="1"
          />
        </div>

        <div className="composer-actions-right">
          {message.trim() ? (
            <button
              className="composer-icon-button send-btn"
              onClick={handleSend}
              title="Send message"
              aria-label="Send message"
              disabled={disabled}
            >
              <FaPaperPlane size={16} />
            </button>
          ) : (
            <button
              className={`composer-icon-button voice-btn ${
                isRecording ? "recording" : ""
              }`}
              onClick={handleVoiceClick}
              title="Voice message"
              aria-label="Send voice message"
              disabled={disabled}
            >
              <FaMicrophone size={16} />
            </button>
          )}
        </div>
      </div>

      {isRecording && (
        <div className="recording-indicator">
          <div className="recording-pulse"></div>
          <span>Recording...</span>
          <button
            className="stop-recording-btn"
            onClick={() => setIsRecording(false)}
          >
            <FaTimes size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageComposer;
