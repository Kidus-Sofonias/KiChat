import React, { createContext, useState, useEffect } from "react";

export const userProvider = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ user_name: "", user_id: "" });

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
    <userProvider.Provider value={[user, setUser]}>
      {children}
    </userProvider.Provider>
  );
};

export default UserProvider;
