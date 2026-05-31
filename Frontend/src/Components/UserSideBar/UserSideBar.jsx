import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "../../Components/axios";
import { usePreferences } from "../../Context/usePreferences";
import { buildAvatarUrl } from "../../Utils/avatarOptions";
import { formatLastSeen, isOnline } from "../../Utils/formatLastSeen";

const POLL_INTERVAL_MS = 15_000;

const UserSidebar = ({
  currentUser,
  onSelectUser,
  recentUsers,
  selectedUser,
  activeSection = "all",
  onSectionChange,
}) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);
  const { copy } = usePreferences();

  const fetchUsers = () => {
    if (!currentUser?.user_name) {
      setUsers([]);
      return;
    }

    axios
      .get("/api/users/all")
      .then((res) => setUsers(res.data))
      .catch((error) => console.error("Failed to fetch users:", error));
  };

  // Initial fetch + periodic polling for updated last_seen values
  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [currentUser?.user_name]);

  // Re-render periodically so relative "last seen X ago" strings stay fresh
  useEffect(() => {
    const tickInterval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(tickInterval);
  }, []);

  const availableUsers = useMemo(
    () => users.filter((user) => user.user_name !== currentUser?.user_name),
    [currentUser?.user_name, users]
  );

  const searchResults = useMemo(() => {
    if (!search.trim()) {
      return availableUsers;
    }

    return availableUsers.filter((user) =>
      user.user_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [availableUsers, search]);

  const recentLookup = useMemo(
    () => new Set(recentUsers.map((user) => user.user_name)),
    [recentUsers]
  );

  const recentEntries = useMemo(
    () =>
      recentUsers.map((entry) => {
        const completeUser = availableUsers.find(
          (user) => user.user_name === entry.user_name
        );

        return completeUser || entry;
      }),
    [availableUsers, recentUsers]
  );

  const discoverEntries = useMemo(
    () =>
      searchResults.filter((user) => search.trim() || !recentLookup.has(user.user_name)),
    [recentLookup, search, searchResults]
  );

  const handleSelectUserAndClose = (user) => {
    onSelectUser(user);

    setTimeout(() => {
      const offcanvasElement = document.getElementById("sidebarOffcanvas");

      if (!offcanvasElement) {
        return;
      }

      try {
        const Offcanvas = window.bootstrap?.Offcanvas;

        if (Offcanvas) {
          Offcanvas.getOrCreateInstance(offcanvasElement).hide();
        }
      } catch (error) {
        console.error("Offcanvas initialization error:", error);
      }
    }, 100);
  };

  const renderUserButton = (user, subtitle) => {
    const online = isOnline(user.last_seen);
    const lastSeenText = formatLastSeen(user.last_seen);

    return (
      <button
        key={user.user_name}
        className={`sidebar-user-card ${
          selectedUser?.user_name === user.user_name ? "selected" : ""
        }`}
        onClick={() => handleSelectUserAndClose(user)}
      >
        <div className="sidebar-avatar-wrapper">
          <img
            src={buildAvatarUrl(user.avatar_seed, user.user_name)}
            alt={`${user.user_name} avatar`}
            className="sidebar-avatar"
          />
          <span
            className={`sidebar-status-dot ${online ? "online" : "offline"}`}
            aria-label={online ? "Online" : "Offline"}
          />
        </div>
        <div className="sidebar-user-copy">
          <strong>{user.user_name}</strong>
          <span className="sidebar-user-status">
            {user.lastMessage
              ? user.lastMessage
              : lastSeenText || subtitle}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="sidebar-shell">
      <div className="sidebar-profile-card">
        <div className="sidebar-avatar-wrapper sidebar-avatar-wrapper-large">
          <img
            src={buildAvatarUrl(
              currentUser?.avatar_seed,
              currentUser?.user_name || "aurora-bot",
              128
            )}
            alt={`${currentUser?.user_name || "Current user"} avatar`}
            className="sidebar-avatar sidebar-avatar-large"
          />
          <span
            className="sidebar-status-dot sidebar-status-dot-large online"
            aria-label="Online"
          />
        </div>
        <div className="sidebar-profile-copy">
          <span className="sidebar-profile-label">{copy.sidebar.signedInAs}</span>
          <strong>{currentUser?.user_name || copy.common.guest}</strong>
          <span className="sidebar-profile-subtitle">{copy.sidebar.directMessages}</span>
        </div>
      </div>

      <div className="sidebar-search-shell">
        <FaSearch className="sidebar-search-icon" />
        <input
          type="text"
          className="sidebar-search-input"
          placeholder={copy.sidebar.searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {onSectionChange && (
        <div className="sidebar-mobile-switcher">
          <button
            type="button"
            className={`sidebar-mobile-tab ${activeSection === "recent" ? "active" : ""}`}
            onClick={() => onSectionChange("recent")}
          >
            {copy.sidebar.recent}
          </button>
          <button
            type="button"
            className={`sidebar-mobile-tab ${activeSection === "people" ? "active" : ""}`}
            onClick={() => onSectionChange("people")}
          >
            {search.trim() ? copy.sidebar.searchResults : copy.sidebar.people}
          </button>
        </div>
      )}

      {activeSection !== "people" && (
        <section className="sidebar-section">
          <div className="sidebar-section-header">
            <span>{copy.sidebar.recent}</span>
            <small>{recentEntries.length}</small>
          </div>

          {recentEntries.length > 0 ? (
            <div className="sidebar-user-list">
              {recentEntries.map((user) =>
                renderUserButton(user, copy.sidebar.recentChat)
              )}
            </div>
          ) : (
            <div className="sidebar-empty-state">{copy.sidebar.startConversation}</div>
          )}
        </section>
      )}

      {activeSection !== "recent" && (
        <section className="sidebar-section sidebar-section-fill">
          <div className="sidebar-section-header">
            <span>
              {search.trim() ? copy.sidebar.searchResults : copy.sidebar.people}
            </span>
            <small>{discoverEntries.length}</small>
          </div>

          {discoverEntries.length > 0 ? (
            <div className="sidebar-user-list">
              {discoverEntries.map((user) =>
                renderUserButton(
                  user,
                  search.trim()
                    ? copy.sidebar.matchingContact
                    : copy.sidebar.availableToMessage
                )
              )}
            </div>
          ) : (
            <div className="sidebar-empty-state">
              {search.trim()
                ? copy.sidebar.noMatch
                : copy.sidebar.noUsers}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default UserSidebar;