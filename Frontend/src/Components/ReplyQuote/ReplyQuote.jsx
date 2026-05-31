import { FaTimes } from "react-icons/fa";
import "./ReplyQuote.css";

const ReplyQuote = ({ message, onDismiss }) => {
  if (!message) {
    return null;
  }

  const isFile = message.isFile || message.fileUrl;
  const displayText = message.replyToContent || message.caption || message.content || "";
  const truncatedText = displayText.length > 100 
    ? displayText.substring(0, 100) + "..." 
    : displayText;

  return (
    <div className="reply-quote">
      <div className="reply-quote-left-accent" />
      <div className="reply-quote-content">
        <div className="reply-quote-header">
          <strong>{message.replyToSender || message.sender}</strong>
          {isFile && <span className="reply-quote-badge">📎 Attachment</span>}
        </div>
        <div className="reply-quote-text">{truncatedText}</div>
      </div>
      <button
        type="button"
        className="reply-quote-close"
        onClick={onDismiss}
        aria-label="Clear reply"
        title="Clear reply"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default ReplyQuote;
