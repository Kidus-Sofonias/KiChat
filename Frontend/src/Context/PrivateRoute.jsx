import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { userProvider } from "./UserProvider"; 

const PrivateRoute = ({ children }) => {
  const [user] = useContext(userProvider); // Correctly access user context

  return user?.user_name ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;