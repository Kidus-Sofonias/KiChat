import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage.jsx";
import SignUp from "./Pages/SignUp/SignUp";
import { userProvider } from "./Context/UserProvider";
import axios from "./Components/axios";
import { useContext, useEffect } from "react";
import HowItWorks from "./Pages/HowItWorks/HowItWorks";
import PrivateRoute from "./Context/PrivateRoute.jsx";
import SignIn from "./Pages/SignIn/SignIn.jsx";
import Chat from "./Pages/Chat/Chat";

function App() {
  const [user, setUser] = useContext(userProvider);
  const navigate = useNavigate();
  const location = useLocation();

  function logOut() {
    setUser({});
    navigate("/");
  }

  async function checkUser() {
    try {
      const { data } = await axios.get("/api/users/check", {
        withCredentials: true,
      });

      setUser({
        username: data.user_name,
        user_id: data.user_id,
      });
    } catch (error) {
      console.error("Auth error:", error);
      navigate("/");
    }
  }

  useEffect(() => {
    checkUser();
  }, []);

  const isLandingPage = location.pathname === "/";

  return (
    <div className="app-container">
      {/* {!isLandingPage && <Header logOut={logOut} />} */}
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
        <Route path="/how-it-works" element={<HowItWorks />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
