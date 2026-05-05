import "./App.css";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import CosmicBackdrop from "./Components/CosmicBackdrop/CosmicBackdrop";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage.jsx";
import SignUp from "./Pages/SignUp/SignUp";
import { userProvider } from "./Context/UserContext";
import axios from "./Components/axios";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import HowItWorks from "./Pages/HowItWorks/HowItWorks";
import PrivateRoute from "./Context/PrivateRoute.jsx";
import SignIn from "./Pages/SignIn/SignIn.jsx";
import Chat from "./Pages/Chat/Chat";
import Settings from "./Pages/Settings/Settings";
import { getBrowserCapabilities } from "./Utils/browserSupport";

function App() {
  const [, setUser] = useContext(userProvider);
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/chat");
  const browserSupport = useMemo(() => getBrowserCapabilities(), []);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const logOut = useCallback(() => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Failed to clear auth storage:", error);
    }

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

      try {
        localStorage.setItem("user", JSON.stringify(authenticatedUser));
      } catch (error) {
        console.error("Failed to persist authenticated user:", error);
      }

      setUser(authenticatedUser);
    } catch (error) {
      console.error("Auth error:", error);
      logOut();
    } finally {
      setIsCheckingAuth(false);
    }
  }, [logOut, setUser]);

  useEffect(() => {
    let storedUser = null;
    let token = null;

    try {
      storedUser = localStorage.getItem("user");
      token = localStorage.getItem("token");
    } catch (error) {
      console.error("Failed to read auth storage:", error);
    }

    if (!token) {
      try {
        localStorage.removeItem("user");
      } catch (error) {
        console.error("Failed to clear stored user:", error);
      }

      setUser({ user_name: "", user_id: "", avatar_seed: "byte-bot" });
      setIsCheckingAuth(false);
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to restore stored user:", error);
        try {
          localStorage.removeItem("user");
        } catch (removeError) {
          console.error("Failed to remove invalid stored user:", removeError);
        }
      }
    }

    checkUser();
  }, [checkUser, setUser]);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("legacy-browser", browserSupport.shouldUseLegacyExperience);
    root.classList.toggle("reduced-effects", browserSupport.shouldUseLegacyExperience);
    root.classList.toggle("simple-backdrop", !browserSupport.supportsBackdropFilter);
  }, [browserSupport]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="app-container">
      <CosmicBackdrop browserSupport={browserSupport} />
      {browserSupport.shouldUseLegacyExperience && (
        <div className="compatibility-banner">
          <strong>Compatibility mode enabled.</strong>
          <span>KiChat is using simpler effects for this browser.</span>
          {!browserSupport.supportsVoiceRecording && (
            <span>Voice recording is unavailable here.</span>
          )}
          {!browserSupport.supportsModernModules && (
            <span>
              This browser still needs a true legacy production bundle to fully match new browsers.
            </span>
          )}
        </div>
      )}
      {!isChatPage && <Header logOut={logOut} />}

      <main className={`app-main ${isChatPage ? "chat-main" : ""}`}>
        <div className={`app-main-content ${isChatPage ? "chat-content" : ""}`}>
          <Routes>
            <Route
              path="/chat"
              element={
                <PrivateRoute isCheckingAuth={isCheckingAuth}>
                  <Chat logOut={logOut} browserSupport={browserSupport} />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute isCheckingAuth={isCheckingAuth}>
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      {!isChatPage && <Footer />}
    </div>
  );
}

export default App;
