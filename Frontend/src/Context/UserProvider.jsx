import React, { useState, useEffect } from "react";
import { userProvider as UserProviderContext } from "./UserContext";

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return {
          user_name: "",
          user_id: "",
          avatar_seed: "byte-bot",
        };
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Failed to restore user from storage:", error);
      return {
        user_name: "",
        user_id: "",
        avatar_seed: "byte-bot",
      };
    }
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
