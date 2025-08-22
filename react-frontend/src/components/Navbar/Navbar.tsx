import React, { useState } from "react";
import "./Navbar.css";
import { NavLink } from "react-router-dom";

interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

export default function Navbar({ isLoggedIn, setIsLoggedIn }: NavbarProps) {

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
        </ul>
      </div>
      {isLoggedIn ? (
        <div className="navbar-right">
          <span>Welcome, User!</span>
          <button className="logout" onClick={() => setIsLoggedIn(false)}>Logout</button>
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
  )
}