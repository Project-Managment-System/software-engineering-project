import React from "react";
import { useNavigate } from "react-router-dom";
import "./components.css";

const PortalCard = ({ title, description, icon, path }) => {
  const navigate = useNavigate();

  return (
    <div className="portal-card" onClick={() => navigate(path)}>
      <div className="portal-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button>Enter</button>
    </div>
  );
};

export default PortalCard;
