# Premium Chat UI - Integration Guide

## Quick Start

### 1. Import Theme Files

Add to your main CSS file or `index.html`:

```html
<!-- In index.html head -->
<link rel="stylesheet" href="./src/styles/theme.css">
<link rel="stylesheet" href="./src/styles/premium-layout.css">
```

Or in your React component:

```javascript
import '../styles/theme.css';
import '../styles/premium-layout.css';
```

---

## 2. Component Usage Examples

### Sidebar Component

```jsx
import Sidebar from './Components/Sidebar/Sidebar';

function Chat() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Sidebar
      currentUser={currentUser}
      conversations={conversations}
      selectedConversation={selectedConversation}
      onSelectConversation={setSelectedConversation}
      onlineUsers={onlineUsers}
      onSettings={handleSettings}
      onLogout={handleLogout}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    />
  );
}
```

### Chat Header Component

```jsx
import ChatHeader from './Components/Header/ChatHeader';

<ChatHeader
  selectedConversation={selectedConversation}
  currentUser={currentUser}
  onlineUsers={onlineUsers}
  onCall={handleCall}
  onVideoCall={handleVideoCall}
  onSearch={handleSearch}
  onMore={handleMoreOptions}
/>
```

### Messages Component

```jsx
import Messages from './Components/Messages/Messages';

<Messages
  messages={messages}
  currentUserId={currentUser.user_id}
  onReply={handleReply}
  onReact={handleReact}
  onDelete={handleDelete}
  isLoading={isLoading}
/>
```

### Message Composer Component

```jsx
import MessageComposer from './Components/MessageComposer/MessageComposer';

<MessageComposer
  onSendMessage={handleSendMessage}
  onAttach={handleAttach}
  onEmoji={handleEmojiPicker}
  disabled={isDisabled}
  placeholder="Message..."
/>
```

---

## 3. Layout Structure

```jsx
function ChatPage() {
  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Left Sidebar */}
        <aside className="sidebar">
          <Sidebar {...props} />
        </aside>

        {/* Center Chat Area */}
        <main className="chat-main">
          <ChatHeader {...props} />
          
          <div className="messages-area">
            <div className="messages-scroll">
              <Messages {...props} />
            </div>
          </div>

          <div className="message-composer-container">
            <MessageComposer {...props} />
          </div>
        </main>

        {/* Right Sidebar (Optional) */}
        <aside className="chat-right-panel">
          <UserPanel {...props} />
        </aside>
      </div>
    </div>
  );
}
```

---

## 4. CSS Classes You Can Use

### Layout Containers
```jsx
<div className="chat-page">
<div className="chat-container">
<aside className="sidebar">
<main className="chat-main">
<div className="messages-area">
<div className="messages-scroll">
<div className="message-composer-container">
```

### Component Wrappers
```jsx
// Glass panels
<div className="glass-panel">...</div>

// Buttons
<button className="glass-button">...</button>
<button className="gradient-button">...</button>
<button className="icon-button">...</button>

// Text effects
<span className="gradient-text">...</span>

// Animations
<div className="fade-in">...</div>
<div className="slide-up">...</div>
```

### Status Indicators
```jsx
<div className="status-indicator status-online"></div>
<div className="status-indicator status-away"></div>
<div className="status-indicator status-offline"></div>
```

### Badges
```jsx
<span className="badge badge-unread">5</span>
<span className="badge badge-online">Online</span>
```

---

## 5. Customization

### Change Primary Color

Edit `src/styles/theme.css`:

```css
:root {
  --accent-primary: #6366F1;      /* Change to your color */
  --accent-secondary: #4F46E5;
  --accent-tertiary: #60A5FA;
}
```

### Change Background

```css
:root {
  --bg-primary: #070B14;          /* Main background */
  --bg-secondary: #0B1220;        /* Secondary */
  --bg-tertiary: #111827;         /* Tertiary */
}
```

### Adjust Spacing

```css
:root {
  --spacing-md: 12px;             /* Base unit */
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  /* etc */
}
```

### Change Animations

```css
:root {
  --transition-fast: 150ms ease;      /* Faster */
  --transition-base: 200ms ease;      /* Default */
  --transition-slow: 300ms ease;      /* Slower */
}
```

---

## 6. Adding Features

### Message Reactions

```jsx
// In Messages.jsx component
const handleReact = (message) => {
  // Show emoji picker
  showEmojiPicker(message.message_id);
};

// In the component
{message.reactions && message.reactions.length > 0 && (
  <div className="message-reactions">
    {message.reactions.map((reaction, idx) => (
      <span key={idx} className="reaction-emoji">
        {reaction.emoji}
      </span>
    ))}
  </div>
)}
```

### Typing Indicator

```jsx
// Add after messages list
{isTyping && (
  <div className="message-group other">
    <img src={avatarUrl} className="message-avatar" />
    <div className="message-bubble received">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
)}
```

### Voice Messages

```jsx
// In MessageComposer
const handleVoiceRecord = async () => {
  if (!isRecording) {
    // Start recording
    setIsRecording(true);
    startVoiceRecording();
  } else {
    // Stop and send
    setIsRecording(false);
    const audioBlob = stopVoiceRecording();
    onSendVoiceMessage(audioBlob);
  }
};
```

### Message Search

```jsx
// In Sidebar
const handleSearch = (query) => {
  setSearchQuery(query);
  const results = searchMessages(query);
  filterConversations(results);
};
```

---

## 7. State Management

### Example with Context

```jsx
import { createContext, useState, useContext } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  return (
    <ChatContext.Provider
      value={{
        selectedConversation,
        setSelectedConversation,
        messages,
        setMessages,
        conversations,
        setConversations,
        onlineUsers,
        setOnlineUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
```

---

## 8. Responsive Design

### Mobile Menu Toggle

```jsx
function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="chat-page">
      <div className="chat-container">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar {...props} />
        </aside>

        {/* Mobile menu button */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <FaBars />
        </button>

        <main className="chat-main">
          {/* ... */}
        </main>
      </div>
    </div>
  );
}
```

---

## 9. Performance Optimization

### Lazy Load Messages

```jsx
const MESSAGES_PER_PAGE = 20;

function Messages({ messages = [] }) {
  const [visibleMessages, setVisibleMessages] = useState(
    messages.slice(0, MESSAGES_PER_PAGE)
  );

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0) {
      // Load more older messages
      loadMoreMessages();
    }
  };

  return (
    <div className="messages-scroll" onScroll={handleScroll}>
      {/* Render only visible messages */}
    </div>
  );
}
```

### Memoize Components

```jsx
import { memo } from 'react';

const MessageBubble = memo(({ message, isOwn, onReact }) => {
  return (
    <div className={`message-bubble ${isOwn ? 'sent' : 'received'}`}>
      {/* ... */}
    </div>
  );
});

export default MessageBubble;
```

---

## 10. Accessibility

### Keyboard Navigation

```jsx
const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
  if (e.key === 'Escape') {
    closeMenu();
  }
  if (e.key === 'ArrowUp' && canEditLastMessage) {
    editLastMessage();
  }
};
```

### ARIA Labels

```jsx
<button
  className="icon-button"
  onClick={handleSettings}
  aria-label="Open settings menu"
  title="Settings"
>
  <FaCog />
</button>
```

---

## 11. Dark/Light Mode Toggle

```jsx
function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.style.colorScheme = 'dark';
    }
  };

  return (
    <button onClick={toggleTheme}>
      {isDark ? <FaSun /> : <FaMoon />}
    </button>
  );
}
```

---

## 12. Testing Checklist

- [ ] All components render correctly
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Responsive on desktop (> 1024px)
- [ ] Message sending works
- [ ] File upload works
- [ ] Emoji reactions work
- [ ] Search filters conversations
- [ ] Online status updates
- [ ] Keyboard navigation works
- [ ] Touch interactions work on mobile
- [ ] Performance is smooth (60fps)
- [ ] No console errors
- [ ] Accessibility OK (screen readers)

---

## 13. Troubleshooting

### Styles not applying?
- Make sure `theme.css` is imported first
- Clear browser cache (Ctrl+Shift+Delete)
- Check CSS file paths are correct

### Components not showing?
- Verify imports are correct
- Check prop types match component interface
- Look for console errors

### Performance issues?
- Use React DevTools Profiler
- Check for unnecessary re-renders
- Implement virtual scrolling for long lists
- Optimize images

### Mobile layout broken?
- Check media queries in CSS
- Test on actual mobile device or DevTools
- Verify viewport meta tag in HTML

---

## 14. Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Mobile Chrome 90+

---

## 15. Resources

- [Design System Documentation](./DESIGN_SYSTEM.md)
- [Component Props Interface](./COMPONENTS.md) *(to be created)*
- [API Integration Guide](./API_GUIDE.md) *(to be created)*

---

**Last Updated**: 2025
**Version**: 1.0
**Status**: Production Ready
