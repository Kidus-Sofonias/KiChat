import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FaArrowLeft,
  FaBars,
  FaCog,
  FaComments,
  FaDownload,
  FaExternalLinkAlt,
  FaFileAlt,
  FaLink,
  FaMicrophone,
  FaMoon,
  FaPaperPlane,
  FaPaperclip,
  FaRobot,
  FaSearch,
  FaSignOutAlt,
  FaStop,
  FaSun,
  FaTimes,
  FaVideo,
} from "react-icons/fa";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "../../Components/axios";
import { userProvider } from "../../Context/UserContext";
import { usePreferences } from "../../Context/usePreferences";
import UserSidebar from "../../Components/UserSideBar/UserSideBar";
import { buildAvatarUrl } from "../../Utils/avatarOptions";
import "./Chat.css";

const defaultApiUrl =
  typeof window !== "undefined" &&
  ["127.0.0.1", "localhost"].includes(window.location.hostname)
    ? `http://${window.location.hostname}:3001`
    : "http://localhost:3000";

const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;
const URL_PATTERN = /((https?:\/\/|www\.)[^\s<]+)/gi;
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "m4v", "mkv"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "m4a", "aac", "webm"]);

const formatBubbleTime = (value) => {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
};

const formatMessageDay = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const normalizedDate = date.toDateString();

  if (normalizedDate === today.toDateString()) {
    return "Today";
  }

  if (normalizedDate === yesterday.toDateString()) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatElapsedTime = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

const formatFileSize = (size = 0) => {
  if (!size) {
    return "";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1
  );
  const displaySize = size / 1024 ** unitIndex;

  return `${displaySize.toFixed(displaySize >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

const getAvatarUrl = (avatarSeed, fallbackSeed = "byte-bot", size = 96) =>
  buildAvatarUrl(avatarSeed, fallbackSeed, size);

const getFileUrl = (content = "") => {
  const fileLine = content
    .split("\n")
    .find((line) => line.trim().startsWith("file:"));

  return fileLine ? fileLine.replace("file:", "").trim() : "";
};

const getCaption = (content = "") => {
  const lines = content.split("\n");
  const fileIndex = lines.findIndex((line) => line.trim().startsWith("file:"));

  if (fileIndex <= 0) {
    return "";
  }

  return lines.slice(0, fileIndex).join("\n").trim();
};

const normalizeLinkUrl = (rawUrl = "") =>
  rawUrl.startsWith("www.") ? `https://${rawUrl}` : rawUrl;

const extractLinks = (text = "") => [
  ...new Set(
    Array.from(text.matchAll(URL_PATTERN), (match) => normalizeLinkUrl(match[0]))
  ),
];

const getExtensionFromUrl = (fileUrl = "") =>
  fileUrl.split("?")[0].split(".").pop()?.toLowerCase();

const getAttachmentKind = ({ fileType = "", fileUrl = "" }) => {
  const normalizedFileType = typeof fileType === "string" ? fileType : "";

  if (normalizedFileType.startsWith("image/")) {
    return "image";
  }

  if (normalizedFileType.startsWith("video/")) {
    return "video";
  }

  if (normalizedFileType.startsWith("audio/")) {
    return "audio";
  }

  const extension = getExtensionFromUrl(fileUrl);

  if (!extension) {
    return "file";
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  if (AUDIO_EXTENSIONS.has(extension)) {
    return "audio";
  }

  return "file";
};

const inferFileType = (message) => {
  if (message.fileType) {
    return message.fileType;
  }

  const attachmentKind = getAttachmentKind(message);

  if (attachmentKind === "image") {
    const extension = getExtensionFromUrl(message.fileUrl);
    return extension === "svg"
      ? "image/svg+xml"
      : `image/${extension === "jpg" ? "jpeg" : extension}`;
  }

  if (attachmentKind === "video") {
    return `video/${getExtensionFromUrl(message.fileUrl) || "mp4"}`;
  }

  if (attachmentKind === "audio") {
    return `audio/${getExtensionFromUrl(message.fileUrl) || "webm"}`;
  }

  return "";
};

const getDisplayFileName = (message) => {
  const fallbackName = message.fileUrl?.split("/").pop()?.split("?")[0] || "attachment";
  return decodeURIComponent(fallbackName.replace(/^\d+-/, ""));
};

const getHostname = (url = "") => {
  try {
    return new URL(normalizeLinkUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const getYouTubeEmbedUrl = (url = "") => {
  try {
    const parsedUrl = new URL(normalizeLinkUrl(url));
    let videoId = "";

    if (parsedUrl.hostname.includes("youtu.be")) {
      videoId = parsedUrl.pathname.replace("/", "");
    } else if (parsedUrl.hostname.includes("youtube.com")) {
      videoId =
        parsedUrl.searchParams.get("v") ||
        parsedUrl.pathname.split("/shorts/")[1] ||
        parsedUrl.pathname.split("/embed/")[1] ||
        "";
    }

    if (!videoId) {
      return "";
    }

    return `https://www.youtube-nocookie.com/embed/${videoId.split("/")[0]}`;
  } catch {
    return "";
  }
};

const normalizeMessage = (message) => {
  const fileUrl = message.fileUrl || getFileUrl(message.content);
  const caption =
    typeof message.caption === "string" ? message.caption : getCaption(message.content);
  const fileType = inferFileType({ ...message, fileUrl });
  const kind = getAttachmentKind({ fileType, fileUrl });
  const textContent = message.isFile ? caption : message.content;

  return {
    ...message,
    fileUrl,
    caption,
    fileType,
    kind,
    links: extractLinks(textContent),
  };
};

const appendMessage = (currentMessages, nextMessage) => {
  if (!nextMessage) {
    return currentMessages;
  }

  const alreadyExists = currentMessages.some(
    (message) => message._id && nextMessage._id && message._id === nextMessage._id
  );

  return alreadyExists ? currentMessages : [...currentMessages, nextMessage];
};

const getMessageSequence = (messages, index) => {
  const message = messages[index];
  const previousMessage = messages[index - 1];
  const nextMessage = messages[index + 1];
  const currentDay = formatMessageDay(message.createdAt);

  return {
    dayLabel: currentDay,
    showDateDivider: currentDay !== formatMessageDay(previousMessage?.createdAt),
    startsGroup:
      previousMessage?.sender !== message.sender ||
      currentDay !== formatMessageDay(previousMessage?.createdAt),
    endsGroup:
      nextMessage?.sender !== message.sender ||
      currentDay !== formatMessageDay(nextMessage?.createdAt),
  };
};

const mergeRecentUsers = (currentUsers, message, currentUsername) => {
  const otherUser =
    message.sender === currentUsername ? message.receiver : message.sender;

  if (!otherUser || otherUser === currentUsername) {
    return currentUsers;
  }

  return [
    { user_name: otherUser },
    ...currentUsers.filter((entry) => entry.user_name !== otherUser),
  ];
};

const Chat = ({ logOut }) => {
  const [user] = useContext(userProvider);
  const navigate = useNavigate();
  const { copy, theme, toggleTheme } = usePreferences();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [composerNotice, setComposerNotice] = useState("");
  const [mobileSidebarSection, setMobileSidebarSection] = useState("recent");
  const [browserState, setBrowserState] = useState({
    open: false,
    url: "",
    title: "",
  });
  const messagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const socketRef = useRef(null);
  const selectedUserRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recordingChunksRef = useRef([]);
  const previewUrlRef = useRef(null);

  const selectedUserAvatar = useMemo(
    () =>
      getAvatarUrl(
        selectedUser?.avatar_seed,
        selectedUser?.user_name || "byte-bot"
      ),
    [selectedUser?.avatar_seed, selectedUser?.user_name]
  );

  const browserEmbedUrl = useMemo(
    () => getYouTubeEmbedUrl(browserState.url),
    [browserState.url]
  );

  const messageTimeline = useMemo(
    () =>
      messages.map((message, index) => ({
        message,
        ...getMessageSequence(messages, index),
      })),
    [messages]
  );

  const cleanupPreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const stopRecordingStream = () => {
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    recordingStreamRef.current = null;
  };

  const clearAttachment = () => {
    cleanupPreviewUrl();
    setFile(null);
    setPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetComposer = () => {
    setInput("");
    setComposerNotice("");
    clearAttachment();
  };

  const setPreviewFromFile = (selectedFile) => {
    cleanupPreviewUrl();

    const objectUrl = URL.createObjectURL(selectedFile);
    previewUrlRef.current = objectUrl;

    setPreview({
      kind: getAttachmentKind({
        fileType: selectedFile.type,
        fileUrl: selectedFile.name,
      }),
      url: objectUrl,
      name: selectedFile.name,
      size: selectedFile.size,
      fileType: selectedFile.type,
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setRecordingSeconds(0);
    setComposerNotice("");
    stopRecordingTimer();
    stopRecordingStream();
    mediaRecorderRef.current = null;
    recordingChunksRef.current = [];
  };

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      setMobileSidebarSection("recent");
    }
  }, [selectedUser]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }, [input]);

  useEffect(() => {
    if (!user?.user_name) {
      return;
    }

    axios
      .get(`/api/messages/recent/${user.user_name}`)
      .then((res) => setRecentUsers(res.data))
      .catch((error) => console.error("Failed to fetch recent chats:", error));
  }, [user?.user_name]);

  useEffect(() => {
    if (!selectedUser?.user_name || !user?.user_name) {
      setMessages([]);
      return;
    }

    axios
      .get(
        `/api/messages/between?senderId=${user.user_name}&receiverId=${selectedUser.user_name}`
      )
      .then((res) => setMessages(res.data.map(normalizeMessage)))
      .catch((error) => console.error("Failed to fetch messages:", error));
  }, [selectedUser?.user_name, user?.user_name]);

  useEffect(() => {
    const imageMessages = messages.filter(
      (message) => message.fileUrl && message.kind === "image"
    );

    setLightboxImages(imageMessages.map((message) => ({ src: message.fileUrl })));
  }, [messages]);

  useEffect(() => {
    if (!messagesRef.current) {
      return;
    }

    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!user?.user_name) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem("token"),
        username: user.user_name,
      },
      transports: ["polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", user.user_name);
    });

    socket.on("receive_message", (incomingMessage) => {
      const normalizedMessage = normalizeMessage(incomingMessage);
      const activeConversation = selectedUserRef.current?.user_name;
      const belongsToActiveConversation =
        activeConversation &&
        [normalizedMessage.sender, normalizedMessage.receiver].includes(user.user_name) &&
        [normalizedMessage.sender, normalizedMessage.receiver].includes(activeConversation);

      setRecentUsers((currentUsers) =>
        mergeRecentUsers(currentUsers, normalizedMessage, user.user_name)
      );

      if (!belongsToActiveConversation) {
        return;
      }

      setMessages((currentMessages) =>
        appendMessage(currentMessages, normalizedMessage)
      );
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.user_name]);

  useEffect(
    () => () => {
      cleanupPreviewUrl();
      stopRecordingTimer();
      stopRecordingStream();
    },
    []
  );

  const openInAppBrowser = (rawUrl, title = "") => {
    const normalizedUrl = normalizeLinkUrl(rawUrl);

    setBrowserState({
      open: true,
      url: normalizedUrl,
      title: title || getHostname(normalizedUrl),
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (isRecording) {
      cancelRecording();
    }

    setComposerNotice("");
    setFile(selectedFile);
    setPreviewFromFile(selectedFile);
  };

  const handleSend = async () => {
    if (isRecording || (!input.trim() && !file) || !selectedUser?.user_name || !user?.user_name) {
      return;
    }

    setLoading(true);

    try {
      let sentMessage;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sender", user.user_name);
        formData.append("receiver", selectedUser.user_name);

        if (input.trim()) {
          formData.append("caption", input.trim());
        }

        const response = await axios.post("/api/messages/file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        sentMessage = normalizeMessage(response.data);
      } else {
        const response = await axios.post("/api/messages", {
          sender: user.user_name,
          receiver: selectedUser.user_name,
          content: input.trim(),
        });

        sentMessage = normalizeMessage(response.data);
      }

      setMessages((currentMessages) => appendMessage(currentMessages, sentMessage));
      setRecentUsers((currentUsers) =>
        mergeRecentUsers(currentUsers, sentMessage, user.user_name)
      );
      resetComposer();
    } catch (error) {
      setComposerNotice(
        error.response?.data?.details ||
          error.response?.data?.error ||
          copy.chat.messageFailed
      );
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (!selectedUser?.user_name) {
      setComposerNotice(copy.chat.chooseChatRecording);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setComposerNotice(copy.chat.recordingUnsupported);
      return;
    }

    try {
      clearAttachment();
      setComposerNotice("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeTypeCandidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ];
      const supportedMimeType = mimeTypeCandidates.find((mimeType) =>
        MediaRecorder.isTypeSupported?.(mimeType)
      );
      const recorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);

      recordingStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recordingChunksRef.current = [];
      setIsRecording(true);
      setRecordingSeconds(0);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordingChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const extension = blob.type.includes("ogg")
          ? "ogg"
          : blob.type.includes("mp4")
            ? "m4a"
            : "webm";
        const voiceNote = new File([blob], `voice-note-${Date.now()}.${extension}`, {
          type: blob.type || "audio/webm",
        });

        stopRecordingTimer();
        stopRecordingStream();
        setIsRecording(false);
        setRecordingSeconds(0);
        setFile(voiceNote);
        setPreviewFromFile(voiceNote);
      };

      recorder.start();
      recordingTimerRef.current = setInterval(
        () => setRecordingSeconds((current) => current + 1),
        1000
      );
    } catch (error) {
      cancelRecording();
      setComposerNotice(
        error.name === "NotAllowedError"
          ? copy.chat.micDenied
          : copy.chat.recordingFailed
      );
    }
  };

  const renderLinkedText = (text) => {
    const matches = Array.from(text.matchAll(URL_PATTERN));

    if (matches.length === 0) {
      return text;
    }

    const fragments = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
      const matchedText = match[0];
      const startIndex = match.index ?? 0;

      if (startIndex > lastIndex) {
        fragments.push(
          <span key={`text-${index}-${startIndex}`}>
            {text.slice(lastIndex, startIndex)}
          </span>
        );
      }

      fragments.push(
        <button
          key={`link-${matchedText}-${startIndex}`}
          type="button"
          className="message-link"
          onClick={() => openInAppBrowser(matchedText, getHostname(matchedText))}
        >
          {matchedText}
        </button>
      );

      lastIndex = startIndex + matchedText.length;
    });

    if (lastIndex < text.length) {
      fragments.push(<span key={`tail-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }

    return fragments;
  };

  const renderLinkCard = (link) => (
    <div className="message-link-card">
      <div className="message-link-card-copy">
        <span>{copy.chat.openInside}</span>
        <strong>{getHostname(link)}</strong>
      </div>
      <button
        type="button"
        className="message-link-card-action"
        onClick={() => openInAppBrowser(link, getHostname(link))}
      >
        <FaLink />
        {copy.chat.openHere}
      </button>
    </div>
  );

  const renderCaption = (caption, links) => {
    if (!caption) {
      return null;
    }

    return (
      <div className="file-caption">
        <div className="message-text">{renderLinkedText(caption)}</div>
        {links[0] && renderLinkCard(links[0])}
      </div>
    );
  };

  const renderMessageBody = (message) => {
    if (!message.isFile) {
      return (
        <>
          <div className="message-text">{renderLinkedText(message.content)}</div>
          {message.links[0] && renderLinkCard(message.links[0])}
        </>
      );
    }

    if (!message.fileUrl) {
      return <div className="message-text">{copy.chat.fileUnavailable}</div>;
    }

    const downloadName = getDisplayFileName(message);

    if (message.kind === "image") {
      return (
        <div className="file-message">
          {renderCaption(message.caption, message.links)}
          <img
            src={message.fileUrl}
            alt={downloadName}
            onClick={() => {
              const imageIndex = lightboxImages.findIndex(
                (image) => image.src === message.fileUrl
              );

              setLightboxIndex(imageIndex >= 0 ? imageIndex : 0);
            }}
            className="file-preview-image"
          />
          <div className="message-attachment-actions">
            <a
              href={message.fileUrl}
              download={downloadName}
              className="attachment-action-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDownload />
              {copy.chat.download}
            </a>
          </div>
        </div>
      );
    }

    if (message.kind === "video") {
      return (
        <div className="file-message">
          {renderCaption(message.caption, message.links)}
          <video className="message-video" src={message.fileUrl} controls playsInline />
          <div className="message-attachment-actions">
            <a
              href={message.fileUrl}
              download={downloadName}
              className="attachment-action-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDownload />
              {copy.chat.downloadVideo}
            </a>
          </div>
        </div>
      );
    }

    if (message.kind === "audio") {
      return (
        <div className="file-message">
          {renderCaption(message.caption, message.links)}
          <div className="audio-message-card">
            <div className="audio-message-icon">
              <FaMicrophone />
            </div>
            <div className="audio-message-copy">
              <strong>{downloadName}</strong>
              <audio className="message-audio" src={message.fileUrl} controls />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="file-message">
        {renderCaption(message.caption, message.links)}
        <div className="generic-file-card">
          <div className="generic-file-icon">
            <FaFileAlt />
          </div>
          <div className="generic-file-copy">
            <strong>{downloadName}</strong>
            <span>{copy.chat.attachment}</span>
          </div>
          <a
            href={message.fileUrl}
            download={downloadName}
            className="attachment-action-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaDownload />
            {copy.chat.save}
          </a>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    if (!preview) {
      return null;
    }

    if (preview.kind === "image") {
      return (
        <div className="composer-preview-body">
          <img src={preview.url} alt={preview.name} className="composer-preview-image" />
          <div className="composer-preview-copy">
            <strong>{preview.name}</strong>
            <span>{formatFileSize(preview.size)}</span>
          </div>
        </div>
      );
    }

    if (preview.kind === "video") {
      return (
        <div className="composer-preview-body">
          <video src={preview.url} className="composer-preview-video" controls playsInline />
          <div className="composer-preview-copy">
            <strong>{preview.name}</strong>
            <span>{formatFileSize(preview.size)}</span>
          </div>
        </div>
      );
    }

    if (preview.kind === "audio") {
      return (
        <div className="composer-preview-body">
          <div className="audio-message-card composer-audio-preview">
            <div className="audio-message-icon">
              <FaMicrophone />
            </div>
            <div className="audio-message-copy">
              <strong>{preview.name}</strong>
              <audio src={preview.url} controls />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="composer-preview-body">
        <div className="generic-file-card">
          <div className="generic-file-icon">
            <FaFileAlt />
          </div>
          <div className="generic-file-copy">
            <strong>{preview.name}</strong>
            <span>{formatFileSize(preview.size)}</span>
          </div>
        </div>
      </div>
    );
  };

  const sendDisabled =
    loading || isRecording || (!input.trim() && !file) || !selectedUser?.user_name;

  const handleMobileChatsClick = () => {
    const offcanvasElement = document.getElementById("sidebarOffcanvas");
    const Offcanvas = window.bootstrap?.Offcanvas;

    if (offcanvasElement && Offcanvas) {
      Offcanvas.getOrCreateInstance(offcanvasElement).show();
    }
  };

  return (
    <div className="chat-page">
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        slides={lightboxImages}
        index={lightboxIndex}
      />

      {browserState.open && (
        <div className="browser-overlay">
          <div className="browser-window">
            <div className="browser-header">
              <div className="browser-header-copy">
                <span>{copy.chat.browserTitle}</span>
                <strong>{browserState.title || browserState.url}</strong>
              </div>
              <div className="browser-header-actions">
                <a
                  href={browserState.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="browser-action-link"
                >
                  <FaExternalLinkAlt />
                  <span>{copy.chat.newTab}</span>
                </a>
                <button
                  type="button"
                  className="browser-close-button"
                  onClick={() => setBrowserState({ open: false, url: "", title: "" })}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="browser-surface">
              {browserEmbedUrl ? (
                <iframe
                  title={browserState.title || "Embedded content"}
                  src={browserEmbedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="browser-frame"
                />
              ) : (
                <iframe
                  title={browserState.title || "Embedded browser"}
                  src={browserState.url}
                  className="browser-frame"
                />
              )}
            </div>
            {!browserEmbedUrl && (
              <div className="browser-note">
                {copy.chat.browserNote}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="chat-shell">
        <aside className="chat-sidebar d-none d-lg-flex">
          <UserSidebar
            currentUser={user}
            onSelectUser={setSelectedUser}
            recentUsers={recentUsers}
            selectedUser={selectedUser}
          />
        </aside>

        <div
          className="offcanvas offcanvas-start chat-mobile-sidebar"
          tabIndex="-1"
          id="sidebarOffcanvas"
          aria-labelledby="sidebarOffcanvasLabel"
        >
          <div className="offcanvas-header">
            <div>
              <h5 id="sidebarOffcanvasLabel" className="mb-0">
                {copy.common.chat}
              </h5>
              <small className="chat-offcanvas-copy">
                {copy.sidebar.searchPlaceholder}
              </small>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body p-0">
            <UserSidebar
              currentUser={user}
              onSelectUser={setSelectedUser}
              recentUsers={recentUsers}
              selectedUser={selectedUser}
              activeSection={mobileSidebarSection}
              onSectionChange={setMobileSidebarSection}
            />
          </div>
        </div>

        <section className="chat-panel">
          <header className="chat-topbar">
            <div className="chat-topbar-left">
              <button
                className="chat-icon-button d-lg-none"
                type="button"
                onClick={() => {
                  if (selectedUser) {
                    setSelectedUser(null);
                  }

                  handleMobileChatsClick();
                }}
              >
                {selectedUser ? <FaArrowLeft /> : <FaBars />}
              </button>

              {selectedUser ? (
                <div className="chat-contact-chip">
                  <img
                    src={selectedUserAvatar}
                    alt={`${selectedUser.user_name} avatar`}
                    className="chat-contact-avatar"
                  />
                  <div className="chat-contact-copy">
                    <strong>{selectedUser.user_name}</strong>
                    <span>{copy.chat.directMessage}</span>
                  </div>
                </div>
              ) : (
                <div className="chat-contact-chip empty">
                  <div className="chat-contact-copy">
                    <strong>{copy.chat.selectConversation}</strong>
                    <span>{copy.chat.selectConversationCopy}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-topbar-right">
              <div className="chat-current-user">
                <img
                  src={getAvatarUrl(user?.avatar_seed, user?.user_name)}
                  alt={`${user?.user_name} avatar`}
                  className="chat-current-user-avatar"
                />
                <div>
                  <strong>{user?.user_name}</strong>
                  <span>
                    {copy.chat.online} ·{" "}
                    {theme === "dark"
                      ? copy.chat.themeStatusDark
                      : copy.chat.themeStatusLight}
                  </span>
                </div>
              </div>
              <button
                className="chat-logout-button"
                type="button"
                onClick={toggleTheme}
              >
                {theme === "dark" ? <FaSun /> : <FaMoon />}
                <span>{theme === "dark" ? copy.common.light : copy.common.dark}</span>
              </button>
              <button
                className="chat-logout-button"
                type="button"
                onClick={() => navigate("/settings")}
              >
                <FaCog />
                <span>{copy.chat.settings}</span>
              </button>
              <button className="chat-logout-button" onClick={logOut}>
                <FaSignOutAlt />
                <span>{copy.chat.signOut}</span>
              </button>
            </div>
          </header>

          <div className="chat-feed" ref={messagesRef}>
            {!selectedUser && (
              <div className="chat-empty-state">
                <div className="chat-empty-state-icon orbiting">
                  <FaComments />
                </div>
                <strong>{copy.chat.emptyTitle}</strong>
                <span>{copy.chat.emptyCopy}</span>
                <div className="chat-empty-actions">
                  <button
                    type="button"
                    className="chat-empty-action primary"
                    onClick={handleMobileChatsClick}
                  >
                    <FaComments />
                    <span>{copy.chat.openChats || copy.common.chat}</span>
                  </button>
                  <button
                    type="button"
                    className="chat-empty-action"
                    onClick={() => navigate("/settings")}
                  >
                    <FaCog />
                    <span>{copy.chat.settings}</span>
                  </button>
                </div>
              </div>
            )}

            {messageTimeline.map(
              ({ message, showDateDivider, dayLabel, startsGroup, endsGroup }, index) => (
                <div
                  key={message._id || `${message.sender}-${message.createdAt}-${index}`}
                >
                  {showDateDivider && (
                    <div className="message-day-divider">
                      <span>{dayLabel}</span>
                    </div>
                  )}

                  <article
                    className={`message-row ${
                      message.sender === user.user_name ? "own" : ""
                    } ${startsGroup ? "group-start" : "group-middle"} ${
                      endsGroup ? "group-end" : ""
                    }`}
                  >
                    {message.sender !== user.user_name ? (
                      startsGroup ? (
                        <img
                          src={getAvatarUrl(null, message.sender)}
                          className="avatar"
                          alt={`${message.sender}'s avatar`}
                        />
                      ) : (
                        <div className="avatar avatar-spacer" aria-hidden="true"></div>
                      )
                    ) : null}

                    <div
                      className={`message-bubble ${
                        message.sender === user.user_name ? "own-bubble" : "other-bubble"
                      } ${startsGroup ? "group-start" : ""} ${
                        endsGroup ? "group-end" : ""
                      }`}
                    >
                      {message.sender !== user.user_name && startsGroup && (
                        <div className="message-sender">{message.sender}</div>
                      )}
                      {renderMessageBody(message)}
                      <div className="message-meta">
                        <span>{formatBubbleTime(message.createdAt)}</span>
                      </div>
                    </div>
                  </article>
                </div>
              )
            )}
          </div>

          {(preview || composerNotice || isRecording) && (
            <div className="composer-preview-shell">
              {preview && (
                <div className="composer-preview-card">
                  {renderPreview()}
                  <button
                    type="button"
                    className="composer-dismiss"
                    onClick={clearAttachment}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}

              {isRecording && (
                <div className="composer-notice composer-notice-recording">
                  <span className="recording-dot"></span>
                  {copy.chat.recordingLabel}
                  <strong>{formatElapsedTime(recordingSeconds)}</strong>
                  <button
                    type="button"
                    className="composer-inline-action"
                    onClick={stopRecording}
                  >
                    {copy.chat.stop}
                  </button>
                  <button
                    type="button"
                    className="composer-inline-action ghost"
                    onClick={cancelRecording}
                  >
                    {copy.chat.cancel}
                  </button>
                </div>
              )}

              {composerNotice && !isRecording && (
                <div className="composer-notice">{composerNotice}</div>
              )}
            </div>
          )}

          <footer className="chat-composer">
            <div className="chat-mobile-composer-bar">
              <button
                type="button"
                className="chat-mobile-chip"
                onClick={handleMobileChatsClick}
              >
                <FaComments />
                <span>{copy.chat.openChats || copy.common.chat}</span>
              </button>
              <button
                type="button"
                className="chat-mobile-chip"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaPaperclip />
                <span>{copy.chat.attachMedia || copy.chat.attach || copy.chat.attachment}</span>
              </button>
              <button
                type="button"
                className="chat-mobile-chip"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!selectedUser}
              >
                {isRecording ? <FaStop /> : <FaMicrophone />}
                <span>{copy.chat.voiceNote || copy.chat.recordingLabel}</span>
              </button>
            </div>

            <div className="chat-composer-tools">
              <input
                ref={fileInputRef}
                type="file"
                id="fileInput"
                hidden
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.txt"
                onChange={handleFileChange}
              />
              <label htmlFor="fileInput" className="chat-icon-button">
                <FaPaperclip />
              </label>
              <button
                type="button"
                className={`chat-icon-button ${isRecording ? "recording" : ""}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!selectedUser}
              >
                {isRecording ? <FaStop /> : <FaMicrophone />}
              </button>
            </div>

            <div className="chat-input-shell">
              {selectedUser && (
                <div className="chat-input-context">
                  <span className="chat-input-context-pill">
                    <FaRobot />
                    {selectedUser.user_name}
                  </span>
                  <span className="chat-input-context-hint">{copy.chat.directMessage}</span>
                </div>
              )}
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  selectedUser
                    ? copy.chat.placeholderReady
                    : copy.chat.placeholderIdle
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!selectedUser || isRecording}
                rows={1}
              />
            </div>

            <button
              type="button"
              className="chat-send-button"
              onClick={handleSend}
              disabled={sendDisabled}
            >
              {loading ? <ClipLoader color="#fff" size={18} /> : <FaPaperPlane />}
            </button>
          </footer>
        </section>
      </div>

      <nav className="chat-mobile-dock" aria-label="Mobile chat navigation">
        <button
          type="button"
          className="chat-mobile-dock-item"
          onClick={handleMobileChatsClick}
        >
          <FaComments />
          <span>{copy.common.chat}</span>
        </button>
        <button
          type="button"
          className="chat-mobile-dock-item"
          onClick={() => {
            setMobileSidebarSection("people");
            handleMobileChatsClick();
          }}
        >
          <FaSearch />
          <span>{copy.sidebar.people}</span>
        </button>
        <button
          type="button"
          className="chat-mobile-dock-item chat-mobile-dock-item-accent"
          onClick={() => fileInputRef.current?.click()}
        >
          <FaPaperclip />
          <span>{copy.chat.attach || copy.chat.attachment}</span>
        </button>
        <button
          type="button"
          className="chat-mobile-dock-item"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
          <span>{theme === "dark" ? copy.common.light : copy.common.dark}</span>
        </button>
        <button
          type="button"
          className="chat-mobile-dock-item"
          onClick={() => navigate("/settings")}
        >
          <FaCog />
          <span>{copy.common.settings}</span>
        </button>
      </nav>
    </div>
  );
};

export default Chat;


