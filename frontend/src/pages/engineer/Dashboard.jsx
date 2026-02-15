import React from 'react';
import './engineer.css';

const Dashboard = () => {
  return (
    <div className="engineer-container">
      <header className="engineer-header">
        <h1>Engineer Dashboard</h1>
        <button onClick={() => window.location.href='/'} className="portal-btn">Logout</button>
      </header>

      <div className="engineer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="engineer-card">
          <h3>Active Projects</h3>
          <p>You have 3 pending technical tasks.</p>
        </div>
        <div className="engineer-card">
          <h3>System Status</h3>
          <p style={{ color: '#27ae60' }}>● All systems operational</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;