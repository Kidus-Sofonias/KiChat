import React, { useState, useEffect } from "react";
import { userProvider as UserProviderContext } from "./UserContext";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    user_name: "",
    user_id: "",
    avatar_seed: "byte-bot",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        console.error("Failed to parse user from storage:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  return (
    <UserProviderContext.Provider value={[user, setUser]}>
      {children}
    </UserProviderContext.Provider>
  );
};

export default UserProvider;
