import React from "react";
import { useNavigate } from "react-router-dom";
import "./ops.css";

const OpsDashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("opsToken");
    navigate("/ops/login");
  };

  return (
    <div className="ops-dashboard">
      {/* ===== Header ===== */}
      <header className="ops-header">
        <h1>OPS Dashboard</h1>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </header>

      {/* ===== Stats Section ===== */}
      <div className="ops-stats">
        <div className="stat-card">
          <h3>Assigned Tasks</h3>
          <p>12</p>
        </div>

        <div className="stat-card">
          <h3>Completed</h3>
          <p>8</p>
        </div>

        <div className="stat-card">
          <h3>Pending</h3>
          <p>4</p>
        </div>
      </div>

      {/* ===== Content Section ===== */}
      <div className="ops-content">
        <h2>Today’s Work</h2>

        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Site</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Foundation Inspection</td>
              <td>Site A</td>
              <td className="done">Done</td>
            </tr>
            <tr>
              <td>Material Check</td>
              <td>Site B</td>
              <td className="pending">Pending</td>
            </tr>
            <tr>
              <td>Safety Report</td>
              <td>Site C</td>
              <td className="done">Done</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpsDashboard;
