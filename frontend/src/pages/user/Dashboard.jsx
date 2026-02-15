import React from "react";
import { useNavigate } from "react-router-dom";
import "./user.css";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="user-dashboard">
      <header>
        <h1>User Dashboard</h1>
        <button onClick={() => navigate("/")}>Logout</button>
      </header>

      <div className="user-grid">
        <div className="user-box">
          <h3>Status</h3>
          <p>ACTIVE</p>
        </div>

        <div className="user-box">
          <h3>Assigned Tasks</h3>
          <p>6 Ongoing</p>
        </div>

        <div className="user-box">
          <h3>Reports</h3>
          <p>12 Submitted</p>
        </div>
      </div>
    </div>
  );
}
