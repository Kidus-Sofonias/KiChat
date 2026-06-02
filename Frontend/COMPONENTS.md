# Premium Chat Components - Props & Interface Reference

## Component Props Documentation

---

## Sidebar Component

```jsx
import Sidebar from './Components/Sidebar/Sidebar';
```

### Props Interface

```typescript
interface SidebarProps {
  // User Information
  currentUser: {
    user_id: string;
    user_name: string;
    avatar_seed: string;
  };

  // Conversations List
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;

  // Online Users
  onlineUsers: string[];

  // Event Handlers
  onSettings: () => void;
  onLogout: () => void;

  // Search
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
```

### Data Types

```typescript
interface Conversation {
  conversation_id: string;
  participants: User[];
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

interface User {
  user_id: string;
  user_name: string;
  avatar_seed: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
}

interface Message {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  timestamp: string;
  read_at: string | null;
  file_url?: string;
  file_name?: string;
  image_url?: string;
  reply_to?: Message;
  reactions?: Reaction[];
}

interface Reaction {
  emoji: string;
  users: string[];
}
```

### Usage Example

```jsx
function ChatApp() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = {
    user_id: 'user-123',
    user_name: 'John Doe',
    avatar_seed: 'aurora-bot',
  };

  return (
    <Sidebar
      currentUser={currentUser}
      conversations={conversations}
      selectedConversation={selectedConversation}
      onSelectConversation={setSelectedConversation}
      onlineUsers={onlineUsers}
      onSettings={() => console.log('Settings')}
      onLogout={() => console.log('Logout')}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    />
  );
}
```

---

## ChatHeader Component

```jsx
import ChatHeader from './Components/Header/ChatHeader';
```

### Props Interface

```typescript
interface ChatHeaderProps {
  // Conversation Data
  selectedConversation: Conversation | null;
  currentUser: User;

  // Online Status
  onlineUsers: string[];

  // Event Handlers
  onCall: () => void;
  onVideoCall: () => void;
  onSearch: () => void;
  onMore: () => void;
}
```

### Usage Example

```jsx
<ChatHeader
  selectedConversation={selectedConversation}
  currentUser={currentUser}
  onlineUsers={onlineUsers}
  onCall={() => initiateCall(selectedConversation)}
  onVideoCall={() => initiateVideoCall(selectedConversation)}
  onSearch={() => openSearchModal()}
  onMore={() => openMoreMenu()}
/>
```

---

## Messages Component

```jsx
import Messages from './Components/Messages/Messages';
```

### Props Interface

```typescript
interface MessagesProps {
  // Message Data
  messages?: Message[];
  currentUserId: string;

  // Event Handlers
  onReply?: (message: Message) => void;
  onReact?: (message: Message) => void;
  onDelete?: (message: Message) => void;

  // Loading State
  isLoading?: boolean;
}
```

### Usage Example

```jsx
<Messages
  messages={messages}
  currentUserId={currentUser.user_id}
  onReply={(message) => {
    setReplyTo(message);
    composerRef.current?.focus();
  }}
  onReact={(message) => {
    showEmojiPicker(message.message_id);
  }}
  onDelete={(message) => {
    deleteMessage(message.message_id);
  }}
  isLoading={isLoadingMessages}
/>
```

### CSS Classes for Custom Styling

```css
/* Container */
.messages-container { }

/* Message Groups */
.message-group { }
.message-group.own { }

/* Bubbles */
.message-bubble { }
.message-bubble.sent { }
.message-bubble.received { }

/* Content */
.message-text { }
.message-file { }
.message-image { }

/* Metadata */
.message-meta { }
.message-time { }
.read-receipt { }

/* Reactions */
.message-reactions { }
.reaction-emoji { }

/* Quote */
.reply-quote { }

/* Actions */
.message-actions { }
.action-btn { }
.action-btn.delete { }

/* States */
.messages-empty { }
.messages-loading { }
```

---

## MessageComposer Component

```jsx
import MessageComposer from './Components/MessageComposer/MessageComposer';
```

### Props Interface

```typescript
interface MessageComposerProps {
  // Event Handlers
  onSendMessage: (text: string) => void;
  onAttach?: (files: FileList) => void;
  onEmoji?: () => void;

  // State
  disabled?: boolean;
  placeholder?: string;
}
```

### Usage Example

```jsx
<MessageComposer
  onSendMessage={(text) => {
    sendMessage({
      conversation_id: selectedConversation.conversation_id,
      text: text,
      reply_to: replyTo?.message_id,
    });
    setReplyTo(null);
  }}
  onAttach={(files) => {
    uploadFiles(files);
  }}
  onEmoji={() => {
    showEmojiPicker();
  }}
  disabled={isDisabled}
  placeholder="Type a message... (Shift+Enter for new line)"
/>
```

### CSS Classes for Custom Styling

```css
/* Container */
.message-composer-container { }

/* Panel */
.message-composer { }

/* Input */
.composer-input-wrapper { }
.composer-input { }

/* Buttons */
.composer-icon-button { }
.emoji-btn { }
.attach-btn { }
.send-btn { }
.voice-btn { }
.voice-btn.recording { }

/* Recording */
.recording-indicator { }
.recording-pulse { }
.stop-recording-btn { }
```

---

## Sidebar Component Classes

```jsx
// Profile Card
<div className="profile-card glass-panel">
  <img className="profile-avatar" />
  <div className="profile-info">
    <h3 className="profile-name" />
    <p className="profile-status" />
  </div>
  <div className="profile-actions">
    <button className="icon-button" />
  </div>
</div>

// Search
<div className="search-container glass-panel">
  <FaSearch className="search-icon" />
  <input className="search-input" />
</div>

// Conversations
<div className="conversations-list">
  <button className="conversation-item selected unread">
    <div className="conversation-avatar-wrapper">
      <img className="conversation-avatar" />
      <div className="status-dot status-online" />
    </div>
    <div className="conversation-content">
      <h5 className="conversation-name" />
      <p className="conversation-preview" />
    </div>
    <div className="conversation-meta">
      <span className="unread-badge" />
      <span className="conversation-time" />
    </div>
  </button>
</div>

// Online Users
<div className="online-users-list">
  <div className="online-user-item">
    <FaCircle className="status-dot status-online" />
    <span>username</span>
  </div>
</div>
```

---

## ChatHeader Component Classes

```jsx
<header className="chat-header empty">
  <div className="header-content">
    <div className="header-user-info">
      <div className="header-avatar-wrapper">
        <img className="header-avatar" />
        <div className="header-status-indicator status-online" />
      </div>
      <div className="header-user-details">
        <h3 className="header-user-name" />
        <p className="header-user-status" />
      </div>
    </div>

    <div className="header-actions">
      <button className="header-icon-button">
        <FaPhone />
      </button>
      <button className="header-icon-button">
        <FaVideo />
      </button>
      <button className="header-icon-button">
        <FaSearch />
      </button>
      <button className="header-icon-button">
        <FaEllipsisV />
      </button>
    </div>
  </div>

  <div className="header-divider" />
</header>
```

---

## Messages Component Classes

```jsx
<div className="messages-container">
  <div className="message-group own">
    <div className="message-bubble sent">
      <div className="reply-quote">
        <FaReply />
        <span>Quoted message</span>
      </div>

      <p className="message-text">Message text</p>

      <div className="message-meta">
        <span className="message-time">10:30 AM</span>
        <span className="read-receipt">
          <FaCheckDouble />
        </span>
      </div>

      <div className="message-reactions">
        <span className="reaction-emoji">👍</span>
        <span className="reaction-emoji">❤️</span>
      </div>

      <div className="message-actions">
        <button className="action-btn"><FaSmile /></button>
        <button className="action-btn"><FaReply /></button>
        <button className="action-btn delete"><FaEllipsisV /></button>
      </div>
    </div>
  </div>

  <div className="message-group other">
    <img className="message-avatar" />
    <div className="message-bubble received">
      {/* Similar structure */}
    </div>
  </div>

  <div className="messages-empty">
    <div className="empty-icon">💬</div>
    <p>No messages yet</p>
  </div>
</div>
```

---

## MessageComposer Component Classes

```jsx
<div className="message-composer-container">
  <div className="message-composer glass-panel">
    <div className="composer-actions-left">
      <button className="composer-icon-button emoji-btn">
        <FaSmile />
      </button>
      <button className="composer-icon-button attach-btn">
        <FaPaperclip />
      </button>
      <input type="file" style={{display: 'none'}} />
    </div>

    <div className="composer-input-wrapper">
      <textarea
        className="composer-input"
        placeholder="Message..."
      />
    </div>

    <div className="composer-actions-right">
      <button className="composer-icon-button send-btn">
        <FaPaperPlane />
      </button>
    </div>
  </div>

  <div className="recording-indicator">
    <div className="recording-pulse" />
    <span>Recording...</span>
    <button className="stop-recording-btn">
      <FaTimes />
    </button>
  </div>
</div>
```

---

## Global Utility Classes

```jsx
// Glass Effect
<div className="glass-panel">Glass effect container</div>
<button className="glass-button">Glass button</button>

// Gradients
<button className="gradient-button">Gradient button</button>
<span className="gradient-text">Gradient text</span>

// Status Indicators
<div className="status-indicator status-online" />
<div className="status-indicator status-away" />
<div className="status-indicator status-offline" />

// Badges
<span className="badge badge-unread">5</span>
<span className="badge badge-online">Online</span>

// Animations
<div className="fade-in">Fading in</div>
<div className="slide-up">Sliding up</div>
<div className="pulse">Pulsing element</div>

// Icon Button
<button className="icon-button">
  <FaCog />
</button>
```

---

## Full Page Layout Example

```jsx
export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Left Sidebar */}
        <Sidebar
          currentUser={currentUser}
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          onlineUsers={onlineUsers}
          onSettings={() => { /* ... */ }}
          onLogout={() => { /* ... */ }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Center Chat Area */}
        <main className="chat-main">
          {/* Header */}
          <ChatHeader
            selectedConversation={selectedConversation}
            currentUser={currentUser}
            onlineUsers={onlineUsers}
            onCall={() => { /* ... */ }}
            onVideoCall={() => { /* ... */ }}
            onSearch={() => { /* ... */ }}
            onMore={() => { /* ... */ }}
          />

          {/* Messages */}
          <div className="messages-area">
            <div className="messages-scroll">
              <Messages
                messages={messages}
                currentUserId={currentUser?.user_id}
                onReply={setReplyTo}
                onReact={() => { /* ... */ }}
                onDelete={() => { /* ... */ }}
              />
            </div>
          </div>

          {/* Composer */}
          <div className="message-composer-container">
            <MessageComposer
              onSendMessage={(text) => { /* ... */ }}
              onAttach={() => { /* ... */ }}
              onEmoji={() => { /* ... */ }}
            />
          </div>
        </main>

        {/* Right Panel (Optional) */}
        {/* <aside className="chat-right-panel">
          <UserPanel {...props} />
        </aside> */}
      </div>
    </div>
  );
}
```

---

**Last Updated**: 2025
**Version**: 1.0
**Component Count**: 4 Main Components
