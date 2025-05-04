import { useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "../../Components/axios";
import { userProvider } from "../../Context/UserProvider";
import UserSidebar from "../../Components/UserSideBar/UserSideBar";
import { FaSearch, FaSignOutAlt, FaPaperclip } from "react-icons/fa";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import "./Chat.css";

const socket = io("https://kichat.onrender.com", {
  auth: { token: localStorage.getItem("token") },
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const scrollRef = useRef(null);

  const getAvatar = (u) =>
    u?.avatar
      ? `https://kichat.onrender.com${u.avatar}`
      : `https://ui-avatars.com/api/?name=${u.user_name}`;

  const imageMessages = messages.filter(
    (m) => m.isFile && m.content.match(/\.(jpeg|jpg|png|gif|webp|png)$/i)
  );

  useEffect(() => {
    axios
      .get(`/api/messages/recent/${user.user_name}`)
      .then((res) => setRecentUsers(res.data))
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;
    axios
      .get(
        `/api/messages/between?senderId=${user.user_name}&receiverId=${selectedUser.user_name}`
      )
      .then((res) => setMessages(res.data))
      .catch(console.error);
  }, [selectedUser]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    socket.on("typing", (username) => setTypingUser(username));
    socket.on("stop_typing", () => setTypingUser(null));
    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then(async (registration) => {
        const existing = await registration.pushManager.getSubscription();
        if (!existing) {
          const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });
          await fetch(`https://kichat.onrender.com/api/subscribe`, {
            method: "POST",
            body: JSON.stringify(sub),
            headers: { "Content-Type": "application/json" },
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !file) || !selectedUser?.user_name) return;
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
      const res = await axios.post("/api/messages", {
        sender: user.user_name,
        receiver: selectedUser.user_name,
        content: input,
      });
      msg = res.data;
    }

    socket.emit("send_message", msg);
    setInput("");
    setFile(null);
  };

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

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setRecentUsers((prev) =>
      prev.some((r) => r.user_name === u.user_name) ? prev : [u, ...prev]
    );
    const offcanvas = document.getElementById("sidebarOffcanvas");
    if (offcanvas && window.bootstrap) {
      const instance = window.bootstrap.Offcanvas.getInstance(offcanvas);
      instance?.hide();
    }
  };

  const handleImageClick = (src) => {
    const index = imageMessages.findIndex(
      (img) => `https://kichat.onrender.com${img.content}` === src
    );
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
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

      {/* Mobile Offcanvas */}
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

      {/* Chat Panel */}
      <div className="flex-grow-1 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <h5>
            {selectedUser
              ? `Chatting with: ${selectedUser.user_name}`
              : "Select a user"}
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

        {/* Messages */}
        <div className="flex-grow-1 overflow-auto p-3 bg-white">
          {messages.map((m, i) => {
            const isMe = m.sender === user.user_name;
            const sender = isMe ? user : selectedUser;
            return (
              <div key={i} className={`message-row ${isMe ? "own" : ""}`}>
                {!isMe && (
                  <img
                    src={getAvatar(sender)}
                    alt="avatar"
                    className="avatar"
                  />
                )}
                <div
                  className={`bubble ${
                    isMe ? "bg-success text-white" : "bg-primary text-white"
                  }`}
                >
                  <div className="sender">{m.sender}</div>
                  {m.isFile ? (
                    m.content.match(/\.(jpeg|jpg|png|gif|webp|png)$/i) ? (
                      <img
                        src={`https://kichat.onrender.com${m.content}`}
                        alt="img"
                        onClick={() =>
                          handleImageClick(
                            `https://kichat.onrender.com${m.content}`
                          )
                        }
                        style={{
                          maxWidth: "100%",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      />
                    ) : (
                      <a
                        href={`https://kichat.onrender.com${m.content}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download
                      </a>
                    )
                  ) : (
                    <div>{m.content}</div>
                  )}
                  <div className="timestamp">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
          {typingUser && (
            <div className="text-muted fst-italic">
              {typingUser} is typing...
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="chat-input">
          <input
            type="file"
            id="fileInput"
            hidden
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

      {/* Lightbox with multiple slides */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={imageMessages.map((m) => ({
            src: `https://kichat.onrender.com${m.content}`,
          }))}
        />
      )}
    </div>
  );
};

export default Chat;
