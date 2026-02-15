import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./components.css";

const Navbar = ({ role }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2 className="logo">CivilMS</h2>

      <ul className="nav-links">
        <li><Link to={`/${role}/dashboard`}>Dashboard</Link></li>
        <li><Link to={`/${role}/profile`}>Profile</Link></li>
        <li><Link to={`/${role}/settings`}>Settings</Link></li>
      </ul>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
