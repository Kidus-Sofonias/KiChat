import "./EmojiReactions.css";

const EmojiReactions = ({ reactions = {}, onReactionClick }) => {
  if (!reactions || Object.keys(reactions).length === 0) {
    return null;
  }

  const reactionEntries = Object.entries(reactions).filter(
    ([, users]) => users && users.length > 0
  );

  if (reactionEntries.length === 0) {
    return null;
  }

  return (
    <div className="emoji-reactions-container">
      {reactionEntries.map(([emoji, users]) => {
        const userList = users.join(", ");
        const isOwnReaction = users.length > 0;

        return (
          <button
            key={emoji}
            type="button"
            className={`emoji-reaction-badge ${isOwnReaction ? 'own-reaction' : ''}`}
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