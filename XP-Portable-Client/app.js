(function () {
  var config = window.KiChatConfig || {};
  var state = {
    apiBaseUrl: normalizeBaseUrl(config.apiBaseUrl || ""),
    pollIntervalMs: config.pollIntervalMs || 5000,
    token: safeStorageGet("token") || "",
    user: safeStorageGetJson("user"),
    selectedUser: null,
    users: [],
    recentUsers: [],
    messages: [],
    pollHandle: null
  };

  var elements = {
    appTitle: document.getElementById("app-title"),
    statusText: document.getElementById("status-text"),
    noticeBox: document.getElementById("notice-box"),
    authView: document.getElementById("auth-view"),
    chatView: document.getElementById("chat-view"),
    loginForm: document.getElementById("login-form"),
    signupForm: document.getElementById("signup-form"),
    logoutButton: document.getElementById("logout-button"),
    currentUser: document.getElementById("current-user"),
    recentUsers: document.getElementById("recent-users"),
    allUsers: document.getElementById("all-users"),
    chatTitle: document.getElementById("chat-title"),
    chatSubtitle: document.getElementById("chat-subtitle"),
    messages: document.getElementById("messages"),
    messageForm: document.getElementById("message-form"),
    messageInput: document.getElementById("message-input"),
    refreshButton: document.getElementById("refresh-button")
  };

  if (elements.appTitle && config.appName) {
    elements.appTitle.innerHTML = escapeHtml(config.appName);
  }

  bindEvents();
  render();

  if (!state.apiBaseUrl || state.apiBaseUrl.indexOf("your-hosted-backend.example.com") !== -1) {
    showNotice("Update XP-Portable-Client/config.js with your hosted backend URL before signing in.");
  }

  if (state.token && state.user && state.user.user_name) {
    verifySession();
  }

  function bindEvents() {
    elements.loginForm.onsubmit = function (event) {
      event = event || window.event;
      if (event.preventDefault) {
        event.preventDefault();
      }
      logIn();
      return false;
    };

    elements.signupForm.onsubmit = function (event) {
      event = event || window.event;
      if (event.preventDefault) {
        event.preventDefault();
      }
      signUp();
      return false;
    };

    elements.logoutButton.onclick = function () {
      clearSession();
    };

    elements.messageForm.onsubmit = function (event) {
      event = event || window.event;
      if (event.preventDefault) {
        event.preventDefault();
      }
      sendMessage();
      return false;
    };

    elements.refreshButton.onclick = function () {
      refreshData(true);
    };
  }

  function render() {
    var signedIn = !!(state.token && state.user && state.user.user_name);
    toggleClass(elements.authView, "hidden", signedIn);
    toggleClass(elements.chatView, "hidden", !signedIn);
    toggleClass(elements.logoutButton, "hidden", !signedIn);
    toggleClass(elements.refreshButton, "hidden", !signedIn);

    if (!signedIn) {
      updateStatus("Not connected", "idle");
      return;
    }

    elements.currentUser.innerHTML = "Signed in as " + escapeHtml(state.user.user_name);
    renderUsers();
    renderMessages();
  }

  function verifySession() {
    updateStatus("Checking session", "busy");
    request("GET", "/api/users/check", null, function (error, data) {
      if (error) {
        clearSession();
        showNotice("Session check failed. Please sign in again.");
        return;
      }

      state.user = {
        user_id: data.user_id,
        user_name: data.user_name,
        avatar_seed: data.avatar_seed || "byte-bot"
      };
      persistSession();
      render();
      refreshData(true);
      startPolling();
      updateStatus("Connected", "ok");
    });
  }

  function logIn() {
    var username = trimValue(document.getElementById("login-username").value);
    var password = document.getElementById("login-password").value;

    if (!state.apiBaseUrl) {
      showNotice("Set apiBaseUrl in config.js first.");
      return;
    }

    if (!username || !password) {
      showNotice("Enter both username and password.");
      return;
    }

    updateStatus("Signing in", "busy");
    request("POST", "/api/users/login", {
      user_name: username,
      password: password
    }, function (error, data) {
      if (error) {
        updateStatus("Sign in failed", "error");
        showNotice(error.message || "Unable to sign in.");
        return;
      }

      state.token = data.token;
      state.user = {
        user_id: data.user_id,
        user_name: data.user_name,
        avatar_seed: data.avatar_seed || "byte-bot"
      };
      persistSession();
      elements.loginForm.reset();
      render();
      refreshData(true);
      startPolling();
      updateStatus("Connected", "ok");
      clearNotice();
    });
  }

  function signUp() {
    var username = trimValue(document.getElementById("signup-username").value);
    var password = document.getElementById("signup-password").value;
    var confirmPassword = document.getElementById("signup-confirm-password").value;

    if (!state.apiBaseUrl) {
      showNotice("Set apiBaseUrl in config.js first.");
      return;
    }

    if (!username || !password || !confirmPassword) {
      showNotice("Fill in all sign-up fields.");
      return;
    }

    if (password.length < 8) {
      showNotice("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showNotice("Passwords do not match.");
      return;
    }

    updateStatus("Creating account", "busy");
    request("POST", "/api/users/register", {
      user_name: username,
      password: password,
      avatar_seed: "byte-bot"
    }, function (error) {
      if (error) {
        updateStatus("Sign up failed", "error");
        showNotice(error.message || "Unable to create the account.");
        return;
      }

      request("POST", "/api/users/login", {
        user_name: username,
        password: password
      }, function (loginError, data) {
        if (loginError) {
          updateStatus("Account created but sign in failed", "error");
          showNotice(loginError.message || "Account created, but automatic sign in failed.");
          return;
        }

        state.token = data.token;
        state.user = {
          user_id: data.user_id,
          user_name: data.user_name,
          avatar_seed: data.avatar_seed || "byte-bot"
        };
        persistSession();
        elements.signupForm.reset();
        render();
        refreshData(true);
        startPolling();
        updateStatus("Connected", "ok");
        clearNotice();
      });
    });
  }

  function clearSession() {
    state.token = "";
    state.user = null;
    state.selectedUser = null;
    state.users = [];
    state.recentUsers = [];
    state.messages = [];
    stopPolling();
    safeStorageRemove("token");
    safeStorageRemove("user");
    render();
    clearNotice();
  }

  function persistSession() {
    safeStorageSet("token", state.token || "");
    safeStorageSetJson("user", state.user || null);
  }

  function refreshData(forceMessages) {
    if (!state.user || !state.user.user_name) {
      return;
    }

    loadUsers();
    loadRecentUsers();

    if (forceMessages && state.selectedUser && state.selectedUser.user_name) {
      loadConversation();
    }
  }

  function loadUsers() {
    request("GET", "/api/users/all", null, function (error, data) {
      if (error) {
        updateStatus("User list unavailable", "error");
        return;
      }

      state.users = data || [];

      if (state.selectedUser && state.selectedUser.user_name) {
        state.selectedUser = findUserByName(state.selectedUser.user_name) || state.selectedUser;
      }

      renderUsers();
      updateStatus("Connected", "ok");
    });
  }

  function loadRecentUsers() {
    request("GET", "/api/messages/recent/" + encodeURIComponent(state.user.user_name), null, function (error, data) {
      if (error) {
        return;
      }

      state.recentUsers = data || [];
      renderUsers();
    });
  }

  function loadConversation() {
    if (!state.selectedUser || !state.selectedUser.user_name) {
      return;
    }

    request(
      "GET",
      "/api/messages/between?senderId=" +
        encodeURIComponent(state.user.user_name) +
        "&receiverId=" +
        encodeURIComponent(state.selectedUser.user_name),
      null,
      function (error, data) {
        if (error) {
          updateStatus("Conversation unavailable", "error");
          return;
        }

        state.messages = data || [];
        renderMessages();
        updateStatus("Connected", "ok");
      }
    );
  }

  function sendMessage() {
    var content = trimValue(elements.messageInput.value);

    if (!content) {
      showNotice("Type a message before sending.");
      return;
    }

    if (!state.selectedUser || !state.selectedUser.user_name) {
      showNotice("Select a person first.");
      return;
    }

    updateStatus("Sending message", "busy");
    request("POST", "/api/messages", {
      sender: state.user.user_name,
      receiver: state.selectedUser.user_name,
      content: content
    }, function (error) {
      if (error) {
        updateStatus("Send failed", "error");
        showNotice(error.message || "Unable to send the message.");
        return;
      }

      elements.messageInput.value = "";
      loadConversation();
      loadRecentUsers();
      clearNotice();
      updateStatus("Connected", "ok");
    });
  }

  function startPolling() {
    stopPolling();
    state.pollHandle = window.setInterval(function () {
      refreshData(false);
      if (state.selectedUser && state.selectedUser.user_name) {
        loadConversation();
      }
    }, state.pollIntervalMs);
  }

  function stopPolling() {
    if (state.pollHandle) {
      window.clearInterval(state.pollHandle);
      state.pollHandle = null;
    }
  }

  function renderUsers() {
    renderUserGroup(elements.recentUsers, state.recentUsers, "No recent chats yet.");

    var filteredUsers = [];
    var i;
    for (i = 0; i < state.users.length; i += 1) {
      if (!state.user || state.users[i].user_name !== state.user.user_name) {
        filteredUsers.push(state.users[i]);
      }
    }

    renderUserGroup(elements.allUsers, filteredUsers, "No other users found.");
  }

  function renderUserGroup(container, users, emptyText) {
    var html = "";
    var i;

    if (!users || !users.length) {
      container.innerHTML = '<div class="empty">' + escapeHtml(emptyText) + "</div>";
      return;
    }

    for (i = 0; i < users.length; i += 1) {
      html += buildUserButtonHtml(users[i]);
    }

    container.innerHTML = html;
    attachUserButtons(container);
  }

  function buildUserButtonHtml(user) {
    var isActive =
      state.selectedUser &&
      state.selectedUser.user_name &&
      state.selectedUser.user_name === user.user_name;
    var avatar = escapeHtml(user.user_name ? user.user_name.charAt(0).toUpperCase() : "?");

    return (
      '<button class="user-button' +
      (isActive ? " active" : "") +
      '" type="button" data-username="' +
      escapeAttribute(user.user_name) +
      '">' +
      '<span class="user-avatar">' +
      avatar +
      '</span>' +
      '<span class="user-info">' +
      '<span class="user-name">' +
      escapeHtml(user.user_name) +
      "</span>" +
      '<span class="user-meta">Direct message</span>' +
      '</span>' +
      "</button>"
    );
  }

  function attachUserButtons(container) {
    var buttons = container.getElementsByTagName("button");
    var i;

    for (i = 0; i < buttons.length; i += 1) {
      buttons[i].onclick = function () {
        var username = this.getAttribute("data-username");
        state.selectedUser = findUserByName(username) || { user_name: username };
        state.messages = [];
        render();
        loadConversation();
      };
    }
  }

  function renderMessages() {
    if (!state.selectedUser || !state.selectedUser.user_name) {
      elements.chatTitle.innerHTML = "Select a person to start chatting";
      elements.chatSubtitle.innerHTML = "This portable client is optimized for text chat on old browsers.";
      elements.messages.innerHTML = '<div class="empty">Choose someone from the left column.</div>';
      toggleClass(elements.messageForm, "hidden", true);
      return;
    }

    elements.chatTitle.innerHTML = "Chat with " + escapeHtml(state.selectedUser.user_name);
    elements.chatSubtitle.innerHTML = "Hosted backend: " + escapeHtml(state.apiBaseUrl);
    toggleClass(elements.messageForm, "hidden", false);

    if (!state.messages.length) {
      elements.messages.innerHTML = '<div class="empty">No messages yet.</div>';
      return;
    }

    var html = "";
    var i;
    for (i = 0; i < state.messages.length; i += 1) {
      html += buildMessageHtml(state.messages[i]);
    }

    elements.messages.innerHTML = html;
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  function buildMessageHtml(message) {
    var isSelf = message.sender === state.user.user_name;
    return (
      '<div class="message' +
      (isSelf ? " self" : "") +
      '">' +
      '<div class="message-meta">' +
      escapeHtml(message.sender || "") +
      " | " +
      escapeHtml(formatDate(message.createdAt)) +
      "</div>" +
      '<div class="message-body">' +
      escapeHtml(extractTextMessage(message)) +
      "</div>" +
      "</div>"
    );
  }

  function extractTextMessage(message) {
    if (!message) {
      return "";
    }

    if (message.isFile) {
      if (message.caption) {
        return "[Attachment] " + message.caption;
      }
      return "[Attachment]";
    }

    return message.content || "";
  }

  function request(method, path, body, callback) {
    var xhr = new XMLHttpRequest();
    var url = state.apiBaseUrl + path;
    xhr.open(method, url, true);
    xhr.setRequestHeader("Accept", "application/json");

    if (state.token) {
      xhr.setRequestHeader("Authorization", "Bearer " + state.token);
    }

    if (body) {
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    }

    xhr.onreadystatechange = function () {
      var response;
      var message;

      if (xhr.readyState !== 4) {
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        response = tryParseJson(xhr.responseText);
        callback(null, response);
        return;
      }

      response = tryParseJson(xhr.responseText);
      message =
        (response && (response.msg || response.message || response.error)) ||
        ("Request failed with status " + xhr.status);
      callback({ status: xhr.status, message: message }, null);
    };

    xhr.onerror = function () {
      callback({
        status: 0,
        message: "Network error. Check the backend URL and browser TLS support."
      }, null);
    };

    xhr.send(body ? JSON.stringify(body) : null);
  }

  function findUserByName(username) {
    var i;
    for (i = 0; i < state.users.length; i += 1) {
      if (state.users[i].user_name === username) {
        return state.users[i];
      }
    }

    for (i = 0; i < state.recentUsers.length; i += 1) {
      if (state.recentUsers[i].user_name === username) {
        return state.recentUsers[i];
      }
    }

    return null;
  }

  function normalizeBaseUrl(value) {
    return String(value || "").replace(/\/+$/, "");
  }

  function trimValue(value) {
    return String(value || "").replace(/^\s+|\s+$/g, "");
  }

  function formatDate(value) {
    var date = new Date(value);
    if (isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString ? date.toLocaleString() : String(value);
  }

  function updateStatus(text, type) {
    elements.statusText.innerHTML = escapeHtml(text);
    elements.statusText.className = "status " + type;
  }

  function showNotice(message) {
    elements.noticeBox.innerHTML = escapeHtml(message);
    toggleClass(elements.noticeBox, "hidden", false);
  }

  function clearNotice() {
    elements.noticeBox.innerHTML = "";
    toggleClass(elements.noticeBox, "hidden", true);
  }

  function toggleClass(element, className, shouldHaveClass) {
    if (!element) {
      return;
    }

    var classes = element.className ? element.className.split(/\s+/) : [];
    var hasClass = containsClass(classes, className);
    var nextClasses = [];
    var i;

    if (shouldHaveClass && !hasClass) {
      classes.push(className);
    }

    for (i = 0; i < classes.length; i += 1) {
      if (classes[i] && !containsClass(nextClasses, classes[i])) {
        if (!(classes[i] === className && !shouldHaveClass)) {
          nextClasses.push(classes[i]);
        }
      }
    }

    element.className = nextClasses.join(" ");
  }

  function containsClass(list, className) {
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i] === className) {
        return true;
      }
    }
    return false;
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return "";
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {}
  }

  function safeStorageRemove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {}
  }

  function safeStorageGetJson(key) {
    var raw = safeStorageGet(key);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function safeStorageSetJson(key, value) {
    if (!value) {
      safeStorageRemove(key);
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {}
  }

  function tryParseJson(value) {
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }
})();
