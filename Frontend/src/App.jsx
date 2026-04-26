import "./App.css";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import CosmicBackdrop from "./Components/CosmicBackdrop/CosmicBackdrop";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage.jsx";
import SignUp from "./Pages/SignUp/SignUp";
import { userProvider } from "./Context/UserContext";
import axios from "./Components/axios";
import { useCallback, useContext, useEffect } from "react";
import HowItWorks from "./Pages/HowItWorks/HowItWorks";
import PrivateRoute from "./Context/PrivateRoute.jsx";
import SignIn from "./Pages/SignIn/SignIn.jsx";
import Chat from "./Pages/Chat/Chat";
import Settings from "./Pages/Settings/Settings";

function App() {
  const [, setUser] = useContext(userProvider);
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");

  const logOut = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser({ user_name: "", user_id: "", avatar_seed: "byte-bot" });
    navigate("/signin");
  }, [navigate, setUser]);

  const checkUser = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/users/check", {
        withCredentials: true,
      });

      const authenticatedUser = {
        user_name: data.user_name,
        user_id: data.user_id,
        avatar_seed: data.avatar_seed || "byte-bot",
      };

      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
    } catch (error) {
      console.error("Auth error:", error);
      logOut();
    }
  }, [logOut, setUser]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      localStorage.removeItem("user");
      setUser({ user_name: "", user_id: "", avatar_seed: "byte-bot" });
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to restore stored user:", error);
        localStorage.removeItem("user");
      }
    }

    checkUser();
  }, [checkUser, setUser]);

  return (
    <div className="app-container">
      <CosmicBackdrop />
      {!isChatPage && <Header logOut={logOut} />}

      <main className={`app-main ${isChatPage ? "chat-main" : ""}`}>
      <Routes>
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat logOut={logOut} />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
      </main>

      {!isChatPage && <Footer />}
    </div>
  );
}

export default App;
