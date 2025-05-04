import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "../../Components/axios";
import { userProvider } from "../../Context/UserProvider";
import UserSidebar from "../../Components/UserSideBar/UserSideBar";
import { FaSearch, FaSignOutAlt, FaPaperclip } from "react-icons/fa";
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
  const [modalImage, setModalImage] = useState("");

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
    socket.on("receive_message", (data) =>
      setMessages((prev) => [...prev, data])
    );
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
      prev.some((user) => user.user_name === u.user_name) ? prev : [u, ...prev]
    );
    const offcanvasElement = document.getElementById("sidebarOffcanvas");
    if (offcanvasElement && window.bootstrap) {
      const instance = window.bootstrap.Offcanvas.getInstance(offcanvasElement);
      instance?.hide();
    }
  };

  const handleImageClick = (src) => {
    setModalImage(src);
    const modal = new window.bootstrap.Modal(
      document.getElementById("imageModal")
    );
    modal.show();
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
                style={{ maxWidth: "70%" }}
              >
                <div className="fw-bold">{m.sender}</div>
                {m.isFile ? (
                  m.content.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                    <img
                      src={`https://kichat.onrender.com${m.content}`}
                      alt="uploaded"
                      style={{
                        maxWidth: "100%",
                        cursor: "pointer",
                        borderRadius: "5px",
                      }}
                      onClick={() =>
                        handleImageClick(
                          `https://kichat.onrender.com${m.content}`
                        )
                      }
                    />
                  ) : (
                    <a
                      href={`https://kichat.onrender.com${m.content}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download File
                    </a>
                  )
                ) : (
                  <div>{m.content}</div>
                )}
                <div className="text-end small">
                  {new Date(m.createdAt).toLocaleTimeString()}
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

      {/* Image Preview Modal */}
      <div className="modal fade" id="imageModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-body p-0">
              <img src={modalImage} className="img-fluid w-100" alt="preview" />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
