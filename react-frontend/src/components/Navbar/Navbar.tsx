import React, { useState } from "react";
import "./Navbar.css";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

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