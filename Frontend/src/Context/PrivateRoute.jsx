import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { userProvider } from "./UserContext";

const PrivateRoute = ({ children, isCheckingAuth = false }) => {
  const [user] = useContext(userProvider); // Correctly access user context
  const token = localStorage.getItem("token");

  if (isCheckingAuth && token) {
    return null;
  }

  return user?.user_name && token ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;
