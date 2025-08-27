import "./Navbar.css";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href="https://umd.edu/">University of Maryland</a>
      </div>
      <div className="navbar-middle">
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/feed">Feed</NavLink>
          </li>
          {isAuthenticated && (
            <li>
              <NavLink to="/chat">Messages</NavLink>
            </li>
          )}
        </ul>
      </div>
      {isAuthenticated ? (
        <div className="navbar-right">
          <ul>
            <li>
              <NavLink to={`/profile/${user?.username}`} className="profile-link">Welcome, {user?.username}!</NavLink>
            </li>
            <li>
              <button 
                className="logout-btn" 
                onClick={handleLogout}
                style={{ fontFamily: 'inherit' }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      ) : (
        <div className="navbar-right">
          <ul>
            <li>
              <NavLink to="/login" className="login">Login</NavLink>
            </li>
            <li>
              <NavLink to="/register" className="register">Register</NavLink>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}