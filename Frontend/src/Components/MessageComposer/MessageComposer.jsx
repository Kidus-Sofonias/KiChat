import React, { useRef, useState } from "react";
import {
  FaPaperPlane,
  FaSmile,
  FaPaperclip,
  FaMicrophone,
  FaStop,
  FaTimes,
} from "react-icons/fa";
import "./MessageComposer.css";

/**
 * MessageComposer – dumb UI component for the message input bar.
 *
 * Voice recording is intentionally NOT handled here.
 * The parent (Chat.jsx) owns the MediaRecorder lifecycle and passes:
 *   - onVoiceStart  – called when the mic button is pressed to begin recording
 *   - onVoiceStop   – called when the stop button is pressed to finish recording
 *   - isRecording   – whether recording is currently active (controls button state)
 *
 * This keeps the component easy to test and reuse without pulling in browser APIs.
 */
const MessageComposer = ({
  onSendMessage,
  onAttach,
  onEmoji,
  onVoiceStart,
  onVoiceStop,
  isRecording = false,
  disabled = false,
  placeholder = "Message...",
}) => {
  const [message, setMessage] = useState("");
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
    // Reset input so the same file can be re-selected
    e.currentTarget.value = "";
  };

  const handleVoiceClick = () => {
    if (isRecording) {
      onVoiceStop?.();
    } else {
      onVoiceStart?.();
    }
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
            disabled={disabled || isRecording}
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
              title={isRecording ? "Stop recording" : "Voice message"}
              aria-label={isRecording ? "Stop recording" : "Send voice message"}
              disabled={disabled}
            >
              {isRecording ? <FaStop size={16} /> : <FaMicrophone size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;

