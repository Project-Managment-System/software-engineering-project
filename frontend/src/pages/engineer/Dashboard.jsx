import React, { useState, useRef } from 'react';
import './Dashboard.css'; // Corrected path for files in the same folder
import { HardHat, ClipboardCheck, Settings, ArrowLeft, ShieldCheck, Calendar, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EngineerDashboard = ({ isDark }) => {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('active-projects');
  
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [technicalStatus, setTechnicalStatus] = useState('');

  const projectData = [
    { 
      sNo: 1, 
      projNo: "ENG-2024-001", 
      projName: "Foundation Piling Audit", 
      siteLocation: "Site Alpha", 
      startDate: "2024-03-01", 
      status: "Verified" 
    },
    { 
      sNo: 2, 
      projNo: "ENG-2024-042", 
      projName: "Structural Load Test", 
      siteLocation: "Site Beta", 
      startDate: "2024-03-12", 
      status: "Pending" 
    },
  ];

  const selectedProject = projectData.find(proj => proj.projNo === selectedProjectId);

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  return (
    <div id="cems-engineer-dashboard" className={isDark ? 'dark-mode' : 'light-mode'}>
      <div className="dashboard-container">
        
        <aside className="sidebar">
          <div className="profile-box">
            <div className="profile-photo">
              <HardHat size={48} />
            </div>
            <div className="profile-info">
              <h3>Eng. Baba</h3>
              <p className="reg-number">ID: 2026-ENG-088</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'active-projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('active-projects')}
            >
              <Zap size={18} /> Active Projects
            </button>
            <button 
              className={`nav-item ${activeTab === 'technical-audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('technical-audit')}
            >
              <ClipboardCheck size={18} /> Technical Audit
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> Settings
            </button>
          </nav>
        </aside>

        <main className="dashboard-content">
          <header className="content-header">
            <div className="header-left">
              <button className="back-arrow-icon" onClick={() => navigate('/')}>
                <ArrowLeft size={24} />
              </button>
              <h1>{activeTab === 'active-projects' ? 'Engineering Command' : activeTab.replace('-', ' ')}</h1>
            </div>
          </header>

          {activeTab === 'active-projects' && (
            <section className="project-table-section">
              <table className="project-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Project ID</th>
                    <th>Project Name</th>
                    <th>Location</th>
                    <th>Assigned</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projectData.map((proj) => (
                    <tr key={proj.projNo}>
                      <td>{proj.sNo}</td>
                      <td className="job-id-cell">{proj.projNo}</td>
                      <td className="font-bold">{proj.projName}</td>
                      <td>{proj.siteLocation}</td>
                      <td>{proj.startDate}</td>
                      <td><span className="deadline-tag">{proj.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === 'technical-audit' && (
            <section className="update-progress-view">
              <div className="selection-area">
                <label>Select Project Log </label>
                <select 
                  className="job-select-dropdown" 
                  value={selectedProjectId} 
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">-- Choose Project ID --</option>
                  {projectData.map(proj => (
                    <option key={proj.projNo} value={proj.projNo}>{proj.projNo} - {proj.projName}</option>
                  ))}
                </select>
              </div>

              {selectedProject && (
                <div className="form-rectangles">
                  <div className="info-rectangle">
                    <div className="info-grid">
                      <p><strong>ID:</strong> {selectedProject.projNo}</p>
                      <p><strong>Site:</strong> {selectedProject.siteLocation}</p>
                      <p><strong>Safety:</strong> Class-A Verified</p>
                    </div>
                  </div>

                  <div className="input-rectangle">
                    <div className="input-row">
                      <div className="input-group">
                        <label>Inspection Date</label>
                        <div className="hybrid-date-input">
                          <input 
                            type="text" 
                            placeholder="YYYY-MM-DD"
                            value={inspectionDate}
                            onChange={(e) => setInspectionDate(e.target.value)}
                          />
                          <button type="button" className="calendar-trigger" onClick={handleCalendarClick}>
                            <Calendar size={18} />
                          </button>
                          <input 
                            type="date"
                            ref={dateInputRef}
                            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                            onChange={(e) => setInspectionDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Status Code</label>
                        <input 
                          type="text" 
                          placeholder="e.g. SEC-01"
                          value={technicalStatus}
                          onChange={(e) => setTechnicalStatus(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="submission-row">
                      <p>Push updates to central mainframe</p>
                      <button className="btn-send" onClick={() => alert("Audit Log Synchronized")}>
                        <ShieldCheck size={16} /> Sync Audit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default EngineerDashboard;