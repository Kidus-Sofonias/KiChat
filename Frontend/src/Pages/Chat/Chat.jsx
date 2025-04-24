import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { userProvider } from "../../Context/UserProvider";
import UserSidebar from "../../Components/UserSideBar/UserSideBar";
import { FaSearch } from "react-icons/fa";
import "./Chat.css";

const socket = io("http://localhost:5000");
const publicVapidKey =
  "BN9z5P4ghBqZsE7OzpeFHOAS5gMTAiE3a1PGipArRb9bGRaXnTZ2AgUKxf2yOGrwVMVX94LzMO5WxvzmpKB4PAA"; // Replace this with your real key

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
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/messages/recent/${user.user_name}`)
      .then((res) => setRecentUsers(res.data))
      .catch(console.error);
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;
    axios
      .get(
        `http://localhost:5000/api/messages/between?senderId=${user.user_name}&receiverId=${selectedUser.user_name}`,
        { withCredentials: true }
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
    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });
        })
        .then((subscription) => {
          fetch("http://localhost:5000/api/subscribe", {
            method: "POST",
            body: JSON.stringify(subscription),
            headers: { "Content-Type": "application/json" },
          });
        })
        .catch(console.error);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !selectedUser?.user_name) return;
    const msg = {
      sender: user.user_name,
      receiver: selectedUser.user_name,
      content: input,
    };
    socket.emit("send_message", msg);
    await axios.post("http://localhost:5000/api/messages", msg, {
      withCredentials: true,
    });
    setInput("");
  };

  const handleTyping = () => {
    socket.emit("typing", user.username);
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
      const offcanvasInstance =
        window.bootstrap.Offcanvas.getInstance(offcanvasElement);
      offcanvasInstance?.hide();
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column flex-md-row">
      {/* Sidebar for Desktop */}
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

      {/* Offcanvas for Mobile */}
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

      {/* Main Chat */}
      <div className="flex-grow-1 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white">
          <h5>
            {selectedUser
              ? `Chatting with: ${selectedUser.user_name}`
              : "Select a user to start chatting"}
          </h5>
          <button className="btn btn-danger" onClick={logOut}>
            Logout
          </button>
        </div>
        <div
          className="d-md-none position-fixed top-0 start-0 m-3 zindex-tooltip"
          style={{ marginTop: "60px" }}
        >
          <button
            className="btn btn-outline-secondary"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebarOffcanvas"
          >
            <FaSearch />
          </button>
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
                <div className="fw-bold">{m.sender}</div>
                <div>{m.content}</div>
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
        <div className="d-flex p-3 border-top bg-white">
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
