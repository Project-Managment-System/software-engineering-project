import React from "react";
import "./components.css";

const StatBox = ({ label, value, icon }) => {
  return (
    <div className="stat-box">
      <div className="stat-icon">{icon}</div>
      <div>
        <h4>{value}</h4>
        <span>{label}</span>
      </div>
    </div>
  );
};

export default StatBox;
