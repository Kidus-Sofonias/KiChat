import "./EmojiReactions.css";

const EmojiReactions = ({ reactions = {}, onReactionClick }) => {
  if (!reactions || Object.keys(reactions).length === 0) {
    return null;
  }

  return (
    <div className="emoji-reactions-container">
      {Object.entries(reactions).map(([emoji, users]) => {
        if (!users || users.length === 0) return null;

        const userList = users.join(", ");
        const displayCount = users.length > 1 ? `+${users.length}` : "";

        return (
          <button
            key={emoji}
            type="button"
            className="emoji-reaction-badge"
            title={userList}
            onClick={() => onReactionClick?.(emoji)}
          >
            <span className="emoji-reaction-emoji">{emoji}</span>
            {users.length > 1 && (
              <span className="emoji-reaction-count">{users.length}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default EmojiReactions;
