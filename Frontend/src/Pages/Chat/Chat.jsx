import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "../../Components/axios"; // Make sure axios has baseURL
import { userProvider } from "../../Context/UserProvider";
import UserSidebar from "../../Components/UserSideBar/UserSideBar";
import { FaSearch, FaSignOutAlt, FaPaperclip } from "react-icons/fa";
import "./Chat.css";

const token = localStorage.getItem("token");

// ✅ Pass JWT token when initializing Socket.io
const socket = io("https://kichat.onrender.com", {
  auth: { token },
});

const publicVapidKey =
  "BN9z5P4ghBqZsE7OzpeFHOAS5gMTAiE3a1PGipArRb9bGRaXnTZ2AgUKxf2yOGrwVMVX94LzMO5WxvzmpKB4PAA";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

const Chat = ({ logOut }) => {
  const [user] = useContext(userProvider);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  // ✅ Fetch recent users
  useEffect(() => {
    axios
      .get(`/api/messages/recent/${user.user_name}`)
      .then((res) => setRecentUsers(res.data))
      .catch(console.error);
  }, [user]);

  // ✅ Fetch chat history with selected user
  useEffect(() => {
    if (!selectedUser) return;
    axios
      .get(
        `/api/messages/between?senderId=${user.user_name}&receiverId=${selectedUser.user_name}`
      )
      .then((res) => setMessages(res.data))
      .catch(console.error);
  }, [selectedUser]);

  // ✅ Setup socket listeners
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing", (username) => setTypingUser(username));
    socket.on("stop_typing", () => setTypingUser(null));

    return () => socket.off("receive_message");
  }, []);


  // ✅ Setup push notifications
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (registration) => {
          const existingSubscription =
            await registration.pushManager.getSubscription();
          if (!existingSubscription) {
            // Only subscribe if not already subscribed
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
            });

            // Send subscription to server
            await fetch(`${API_URL}/api/subscribe`, {
              method: "POST",
              body: JSON.stringify(subscription),
              headers: { "Content-Type": "application/json" },
            });
          }
        })
        .catch(console.error);
    }
  }, []);


  // ✅ Send a message
  const handleSend = async () => {
    if (!input.trim() && !file) return;
    if (!selectedUser?.user_name) return;

    let msg;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sender", user.user_name);
      formData.append("receiver", selectedUser.user_name);

      const res = await axios.post("/api/messages/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      msg = res.data;
    } else {
      const messagePayload = {
        sender: user.user_name,
        receiver: selectedUser.user_name,
        content: input,
      };

      const res = await axios.post("/api/messages", messagePayload);
      msg = res.data;
    }

    // 🔥 Only emit after backend confirmation
    socket.emit("send_message", msg);

    // 🔥 Do NOT setMessages here. Wait for real-time 'receive_message' event.

    setInput("");
    setFile(null);
  };


  // ✅ Handle typing indicator
  const handleTyping = () => {
    socket.emit("typing", user.user_name);
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => {
        socket.emit("stop_typing");
        setIsTyping(false);
      }, 1000);
    }
  };

  // ✅ Select a user to chat with
  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setRecentUsers((prev) =>
      prev.some((user) => user.user_name === u.user_name) ? prev : [u, ...prev]
    );
    const offcanvasElement = document.getElementById("sidebarOffcanvas");
    if (offcanvasElement && window.bootstrap) {
      const offcanvasInstance =
        window.bootstrap.Offcanvas.getInstance(offcanvasElement);
      offcanvasInstance?.hide();
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column flex-md-row">
      {/* Sidebar */}
      <div
        className="d-none d-md-block bg-light border-end"
        style={{ width: "250px" }}
      >
        <UserSidebar
          currentUser={user}
          onSelectUser={handleSelectUser}
          recentUsers={recentUsers}
        />
      </div>

      {/* Offcanvas for mobile */}
      <div className="d-md-none">
        <div
          className="offcanvas offcanvas-start"
          tabIndex="-1"
          id="sidebarOffcanvas"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">Chats</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
            ></button>
          </div>
          <div className="offcanvas-body">
            <UserSidebar
              currentUser={user}
              onSelectUser={handleSelectUser}
              recentUsers={recentUsers}
            />
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-grow-1 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <h5>
            {selectedUser
              ? `Chatting with: ${selectedUser.user_name}`
              : "Select a user to start chatting"}
          </h5>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary d-md-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#sidebarOffcanvas"
            >
              <FaSearch />
            </button>
            <button className="btn btn-outline-danger" onClick={logOut}>
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        <div className="flex-grow-1 overflow-auto p-3 bg-white">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`d-flex ${
                m.sender === user.user_name
                  ? "justify-content-end"
                  : "justify-content-start"
              } mb-2`}
            >
              <div
                className={`p-2 rounded ${
                  m.sender === user.user_name
                    ? "bg-success text-white"
                    : "bg-primary text-white"
                }`}
                style={{ maxWidth: "60%" }}
              >
                <div
                  className="fw-bold"
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => handleSelectUser({ user_name: m.sender })}
                >
                  {m.sender}
                </div>
                {m.isFile ? (
                  m.content.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                    <img
                      src={`https://kichat.onrender.com${m.content}`}
                      alt="uploaded"
                      style={{ maxWidth: "100%", borderRadius: "5px" }}
                    />
                  ) : (
                    <a
                      href={`https://kichat.onrender.com${m.content}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View File
                    </a>
                  )
                ) : (
                  <div>{m.content}</div>
                )}
                <div className="text-end small">
                  {m.createdAt
                    ? new Date(m.createdAt).toLocaleTimeString()
                    : "Invalid Date"}
                </div>
              </div>
            </div>
          ))}
          {typingUser && (
            <div className="text-muted fst-italic">
              {typingUser} is typing...
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="d-flex p-3 border-top bg-white align-items-center">
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label htmlFor="fileInput" className="btn btn-outline-secondary me-2">
            <FaPaperclip />
          </label>
          <input
            className="form-control me-2"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
          />
          <button className="btn btn-primary" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
