import React, { useState } from "react";
import "./Navbar.css";
import { NavLink } from "react-router";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2>University of Maryland</h2>
      </div>
      <div className="navbar-middle">
        <ul>
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/contact">Contact</NavLink>
          </li>
        </ul>
      </div>
      {isLoggedIn ? (
        <div className="navbar-right">
          <span>Welcome, User!</span>
          <button className="logout" onClick={() => setIsLoggedIn(false)}>Logout</button>
        </div>
      ) : (
        <div className="navbar-right">
          <button className="login" onClick={() => setIsLoggedIn(true)}>Login</button>
          <button className="register">Register</button>
        </div>
      )}
    </nav>
  )
}