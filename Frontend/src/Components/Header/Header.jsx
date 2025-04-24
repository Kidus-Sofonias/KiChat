import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userProvider } from "../../Context/UserProvider";


const Header = ({ logOut }) => {
  const [user, setUser] = useContext(userProvider);
  const navigate = useNavigate();

  const avatarUrl = `https://robohash.org/${user?.username}.png?size=40x40`;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light px-3 shadow-sm">
      <Link className="navbar-brand fw-bold fs-4" to="/">
        KiChat
      </Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/home">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/chat">
              Chat
            </Link>
          </li>
        </ul>

        {user?.username && (
          <div className="d-flex align-items-center gap-2">
            <img
              src={avatarUrl}
              alt="avatar"
              className="rounded-circle"
              width={36}
              height={36}
            />
            <span className="me-3">{user.username}</span>
            <button className="btn btn-outline-danger btn-sm" onClick={logOut}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
