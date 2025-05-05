import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import Header from "../../Components/Header/Header";

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartChatting = () => {
    const token = localStorage.getItem("token");
    navigate(token ? "/chat" : "/signin");
  };

  return (
    <>
      {/* <Header /> */}
      <div className="home-container py-5">
        <div className="hero text-center mb-5">
          <h1 className="display-4 fw-bold">
            Welcome to <span className="text-primary">KiChat</span>
          </h1>
          <p className="lead">
            Lightning-fast, secure, and user-friendly messaging platform for
            everyone.
          </p>
          <button
            className="btn btn-primary btn-lg mt-3"
            onClick={handleStartChatting}
          >
            Start Chatting
          </button>
        </div>

        <div className="container mt-5">
          <div className="row text-center">
            <div className="col-md-4">
              <h4>🚀 How It Works</h4>
              <p>
                Sign up, pick a username, and start chatting instantly. Our
                platform uses real-time sockets to ensure your messages are
                delivered instantly.
              </p>
            </div>
            <div className="col-md-4">
              <h4>🎯 Why KiChat?</h4>
              <p>
                We focus on simplicity and speed. No clutter, no unnecessary
                features. Just you and your conversations—secure and
                straightforward.
              </p>
            </div>
            <div className="col-md-4">
              <h4>📱 How to Use</h4>
              <p>
                1. Login or Sign up <br />
                2. Select a user from the sidebar <br />
                3. Type and send messages instantly <br />
                4. Receive real-time updates and notifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
