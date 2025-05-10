import { useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "../../Components/axios";
import { userProvider } from "../../Context/UserProvider";
import UserSidebar from "../../Components/UserSideBar/UserSideBar";
import { FaSearch, FaSignOutAlt, FaPaperclip, FaTimes } from "react-icons/fa";
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
  const [preview, setPreview] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const scrollRef = useRef(null);
  const messagesRef = useRef(null);

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
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (messagesRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesRef.current;
        const isScrolledUp = scrollTop < scrollHeight - clientHeight - 100;
        setIsHeaderVisible(isScrolledUp);
      }
    };

    const messagesEl = messagesRef.current;
    if (messagesEl) messagesEl.addEventListener("scroll", handleScroll);

    return () => messagesEl?.removeEventListener("scroll", handleScroll);
  }, []);

  const getAvatar = (username) =>
    `https://ui-avatars.com/api/?name=${username}&background=random`;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      const fileReader = new FileReader();
      fileReader.onload = () => setPreview(fileReader.result);
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const handleCancelPreview = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSend = async () => {
    if ((!input.trim() && !file) || !selectedUser?.user_name) return;

    try {
      let msg;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sender", user.user_name);
        formData.append("receiver", selectedUser.user_name);
        if (input) formData.append("caption", input);

        const res = await axios.post("/api/messages/file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        msg = res.data;
        if (input) msg.content = `${input}\n${msg.content}`;
        handleCancelPreview();
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
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column flex-md-row">
      {/* Sidebar for Desktop and Offcanvas for Mobile */}
      <div className="sidebar d-none d-md-block">
        <UserSidebar
          currentUser={user}
          onSelectUser={setSelectedUser}
          recentUsers={recentUsers}
        />
      </div>

      <div className="flex-grow-1 d-flex flex-column">
        <div
          className={`chat-header d-flex justify-content-between align-items-center p-3 border-bottom bg-white ${
            isHeaderVisible ? "visible" : "hidden"
          }`}
        >
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

        <div className="chat-messages" ref={messagesRef}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`message-row ${
                m.sender === user.user_name ? "own" : ""
              }`}
            >
              <img src={getAvatar(m.sender)} alt="avatar" className="avatar" />
              <div
                className={`bubble ${
                  m.sender === user.user_name ? "own-bubble" : "other-bubble"
                }`}
              >
                <div className="sender">{m.sender}</div>
                <div>{m.content}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="file"
            id="fileInput"
            hidden
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" className="btn btn-outline-secondary me-2">
            <FaPaperclip />
          </label>
          <input
            className="form-control me-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!input.trim() && !file}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
