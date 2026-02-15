import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const role = localStorage.getItem("role"); // user | engineer | admin

  return (
    <div className="sidebar">
      <h3>Menu</h3>

      {/* User Links */}
      {role === "user" && (
        <>
          <Link to="/user/dashboard">Dashboard</Link>
          <Link to="/user/dashboard">My Projects</Link>
          <Link to="/user/dashboard">Tasks</Link>
        </>
      )}

      {/* Engineer Links */}
      {role === "engineer" && (
        <>
          <Link to="/engineer/dashboard">Dashboard</Link>
          <Link to="/engineer/dashboard">Employees</Link>
          <Link to="/engineer/dashboard">Reports</Link>
        </>
      )}

      {/* Admin Links */}
      {role === "admin" && (
        <>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/dashboard">Manage Users</Link>
          <Link to="/admin/dashboard">Settings</Link>
        </>
      )}

      {/* Logout Link */}
      <Link
        to="/"
        onClick={() => {
          localStorage.clear();
        }}
        style={{ marginTop: "20px", display: "block", color: "#ff4d4f" }}
      >
        Logout
      </Link>
    </div>
  );
};

export default Sidebar;
