import { useNavigate } from "react-router-dom";
import "./HomePage.css"; // optional for custom styles
import Header from "../../Components/Header/Header";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* <Header /> */}
      <div className="container py-5 whole">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold">
            Welcome to <span className="text-primary">KiChat</span>
          </h1>
          <p className="lead">
            Your personal real-time chat app. Connect, share, and chat
            instantly.
          </p>
        </div>

        <div className="text-center">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/chat")}
          >
            Start Chatting
          </button>
        </div>
      </div>
    </>
  );
};

export default HomePage;
