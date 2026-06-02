# Premium Chat UI - CSS Snippets & Quick Reference

## 🎨 Glass Panel Effect

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 200ms ease;
}

.glass-panel:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}
```

## 🎯 Gradient Button

```css
.gradient-button {
  background: linear-gradient(135deg, #6366F1, #4F46E5);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
}

.gradient-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.35);
}
```

## 💬 Message Bubbles

### Sent Message (Your messages)
```css
.message-bubble.sent {
  background: linear-gradient(135deg, #60A5FA, #6366F1);
  border-radius: 20px 20px 4px 20px;
  color: white;
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);
  padding: 12px 16px;
}

.message-bubble.sent:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.35);
}
```

### Received Message (Other's messages)
```css
.message-bubble.received {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px 20px 20px 4px;
  color: #FFFFFF;
  padding: 12px 16px;
}

.message-bubble.received:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.12);
}
```

## 🟢 Status Indicators

### Online Status
```css
.status-online {
  background: #22C55E;
  box-shadow: 0 0 12px #22C55E;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #070B14;
}
```

### Away Status
```css
.status-away {
  background: #F59E0B;
  box-shadow: 0 0 12px #F59E0B;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #070B14;
}
```

## 🔔 Unread Badge

```css
.badge-unread {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366F1, #4F46E5);
  color: white;
  border-radius: 999px;
  width: 24px;
  height: 24px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
```

## ⌨️ Composing Input

```css
.message-composer {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  transition: all 200ms ease;
}

.message-composer:focus-within {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(99, 102, 241, 0.2);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
}

.composer-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #FFFFFF;
  font-size: 15px;
  outline: none;
  resize: none;
}

.composer-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
```

## 🎬 Animations

### Slide Up Animation
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message {
  animation: slideUp 200ms ease-out;
}
```

### Fade In Animation
```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 200ms ease;
}
```

### Pulse Animation
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.typing-indicator {
  animation: pulse 1.5s ease-in-out infinite;
}
```

## 🖱️ Hover Effects

### Lift Effect (Cards)
```css
.conversation-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}
```

### Icon Button Hover
```css
.icon-button:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  transform: translateY(-2px);
}
```

## 📱 Responsive Grid

```css
/* Sidebar on Mobile */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -320px;
    width: 320px;
    height: 100vh;
    transition: left 200ms ease;
    z-index: 1000;
  }

  .sidebar.open {
    left: 0;
    box-shadow: 2px 0 24px rgba(0, 0, 0, 0.4);
  }
}
```

## 🎨 Color Scheme

```css
:root {
  /* Backgrounds */
  --bg-primary: #070B14;
  --bg-secondary: #0B1220;
  --bg-tertiary: #111827;

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-tertiary: rgba(255, 255, 255, 0.5);
  --text-quaternary: rgba(255, 255, 255, 0.3);

  /* Brands */
  --accent-primary: #6366F1;
  --accent-secondary: #4F46E5;
  --accent-tertiary: #60A5FA;

  /* Status */
  --success: #22C55E;
  --warning: #F59E0B;
  --error: #EF4444;
  --offline: #64748B;
}
```

## 🎨 Glassmorphism Background

```css
body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 50%),
    radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1), transparent 50%),
    var(--bg-primary);
  pointer-events: none;
  z-index: 0;
}
```

## 📊 Shadow System

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.2);
--shadow-lg: 0 8px 20px rgba(99, 102, 241, 0.25);
--shadow-xl: 0 12px 32px rgba(99, 102, 241, 0.3);

/* Usage */
.card {
  box-shadow: var(--shadow-md);
}

.button:hover {
  box-shadow: var(--shadow-lg);
}
```

## ⏱️ Transitions

```css
:root {
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}

/* Usage */
.element {
  transition: all var(--transition-base);
}

.quick-element {
  transition: opacity var(--transition-fast);
}
```

## 🌈 Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #60A5FA, #6366F1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## 🔗 Focus States

```css
button:focus {
  outline: 2px solid rgba(99, 102, 241, 0.5);
  outline-offset: 2px;
}

input:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

## 📝 Typography

```css
/* Headings */
h3 {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.5px;
}

/* Body Text */
p {
  font-size: 15px;
  line-height: 1.6;
  font-weight: 400;
}

/* Metadata */
small {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.6;
}
```

## 🖼️ Image Styling

```css
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.avatar:hover {
  border-color: rgba(99, 102, 241, 0.3);
}
```

## 🎯 Icon Buttons

```css
.icon-button {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease;
}

.icon-button:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}
```

## 🎪 Empty State

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.4;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}
```

## 🔄 Loading State

```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.04)
  );
  background-size: 200% 100%;
  animation: loading 2s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

## ⚡ Performance Tips

1. **Use CSS variables** instead of hard-coded colors
2. **Use `transform` and `opacity`** for animations (GPU accelerated)
3. **Avoid animating `width` and `height`**
4. **Use `will-change`** sparingly
5. **Batch DOM updates** together
6. **Debounce resize handlers**
7. **Use hardware acceleration** with `transform: translateZ(0)`

## 🎓 CSS Best Practices

```css
/* ✅ DO - Use CSS variables */
color: var(--text-primary);

/* ❌ DON'T - Hard-code colors */
color: #FFFFFF;

/* ✅ DO - Use transitions for interactions */
transition: all 200ms ease;

/* ❌ DON'T - Animate with JavaScript when CSS can do it */
/* Use CSS animations instead */

/* ✅ DO - Use flexbox for layout */
display: flex;
justify-content: center;

/* ✅ DO - Use CSS Grid for complex layouts */
display: grid;
grid-template-columns: 1fr 1fr;
```

---

**Last Updated**: 2025  
**Version**: 1.0  
**Use with**: Premium Chat Application UI
