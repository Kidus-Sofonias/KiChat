import axios from "../../Components/axios";
import { useState, useEffect } from "react";

const UserSidebar = ({ currentUser, onSelectUser, recentUsers }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    axios
      .get("/api/users/all")
      .then((res) => setUsers(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredUsers([]);
      return;
    }
    const matches = users.filter((u) =>
      u.user_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(matches);
  }, [search, users]);

  return (
    <div className="p-3 h-100 d-flex flex-column">
      <h5 className="mb-3">Recent Chats</h5>
      {recentUsers.length === 0 ? (
        <div className="text-muted mb-4">No recent chats available.</div>
      ) : (
        <div className="list-group mb-4">
          {recentUsers.map((u, i) => (
            <button
              key={i}
              className="list-group-item list-group-item-action"
              onClick={() => onSelectUser(u)}
            >
              {u.user_name}
            </button>
          ))}
        </div>
      )}

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredUsers.length > 0 && (
        <div className="list-group mb-3">
          {filteredUsers.map((u) => (
            <button
              key={u.user_id}
              className="list-group-item list-group-item-action"
              onClick={() => onSelectUser(u)}
            >
              {u.user_name}
            </button>
          ))}
        </div>
      )}

      {filteredUsers.length === 0 && search && (
        <div className="alert alert-warning">No such user found</div>
      )}
    </div>
  );
};

export default UserSidebar;
