import React, { useState, useRef } from 'react'; // Added useRef
import './Dashboard.css';
import { User, Briefcase, RefreshCw, Settings, ArrowLeft, Send, Calendar } from 'lucide-react'; // Added Calendar icon
import { useNavigate } from 'react-router-dom';

const UserDashboard = ({ isDark }) => {
  const navigate = useNavigate();
  const dateInputRef = useRef(null); // Ref to trigger the hidden date picker
  const [activeTab, setActiveTab] = useState('my-jobs');
  
  const [selectedJobId, setSelectedJobId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [estimateAmount, setEstimateAmount] = useState('');

  const jobData = [
    { 
      sNo: 1, 
      jobNo: "JB-7701", 
      jobName: "Foundation Piling", 
      allocation: "Site A", 
      assignDate: "2024-03-01", 
      deadline: "2024-04-15" 
    },
    { 
      sNo: 2, 
      jobNo: "JB-7705", 
      jobName: "Structural Framing", 
      allocation: "Site B", 
      assignDate: "2024-03-10", 
      deadline: "2024-05-20" 
    },
  ];

  const selectedJob = jobData.find(job => job.jobNo === selectedJobId);

  // Helper to open the calendar picker when the icon is clicked
  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker(); // Modern browser standard
    }
  };

  return (
    <div id="cems-user-dashboard" className={isDark ? 'dark-mode' : 'light-mode'}>
      <div className="dashboard-container">
        
        <aside className="sidebar">
          <div className="profile-box">
            <div className="profile-photo">
              <User size={48} />
            </div>
            <div className="profile-info">
              <h3>John Doe</h3>
              <p className="reg-number">REG/2021/CS/088</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'my-jobs' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-jobs')}
            >
              <Briefcase size={18} /> My Jobs
            </button>
            <button 
              className={`nav-item ${activeTab === 'update-progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('update-progress')}
            >
              <RefreshCw size={18} /> Update Progress
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
              <button 
                className="back-arrow-icon" 
                onClick={() => navigate('/')}
                title="Back to portal"
              >
                <ArrowLeft size={24} />
              </button>
              <h1>{activeTab === 'my-jobs' ? 'My Job Assignments' : activeTab.replace('-', ' ')}</h1>
            </div>
          </header>

          {activeTab === 'my-jobs' && (
            <section className="project-table-section">
              <table className="project-table">
                <thead>
                  <tr>
                    <th>Serial No</th>
                    <th>Job No</th>
                    <th>Job Name</th>
                    <th>Allocation</th>
                    <th>Assign Date</th>
                    <th>To be Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {jobData.map((job) => (
                    <tr key={job.jobNo}>
                      <td>{job.sNo}</td>
                      <td className="font-mono text-cyan-500">{job.jobNo}</td>
                      <td className="font-bold">{job.jobName}</td>
                      <td>{job.allocation}</td>
                      <td>{job.assignDate}</td>
                      <td>
                        <span className="deadline-tag">{job.deadline}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === 'update-progress' && (
            <section className="update-progress-view">
              <div className="selection-area">
                <label>Select Job </label>
                <select 
                  className="job-select-dropdown" 
                  value={selectedJobId} 
                  onChange={(e) => setSelectedJobId(e.target.value)}
                >
                  <option value="">-- Choose Job ID --</option>
                  {jobData.map(job => (
                    <option key={job.jobNo} value={job.jobNo}>{job.jobNo} - {job.jobName}</option>
                  ))}
                </select>
              </div>

              {selectedJob && (
                <div className="form-rectangles">
                  <div className="info-rectangle">
                    <div className="info-grid">
                      <p><strong>Job No:</strong> {selectedJob.jobNo}</p>
                      <p><strong>Job Name:</strong> {selectedJob.jobName}</p>
                      <p><strong>Allocation:</strong> {selectedJob.allocation}</p>
                    </div>
                    <div className="info-parallel">
                      <p><strong>Ass. Date:</strong> {selectedJob.assignDate}</p>
                      <p><strong>Target Complete Date:</strong> {selectedJob.deadline}</p>
                    </div>
                  </div>

                  <div className="input-rectangle">
                    <div className="input-row">
                      <div className="input-group">
                        <label>Field Visit Date</label>
                        <div className="hybrid-date-input">
                          <input 
                            type="text" 
                            placeholder="YYYY-MM-DD"
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                          />
                          <button 
                            type="button" 
                            className="calendar-trigger" 
                            onClick={handleCalendarClick}
                            title="Select from calendar"
                          >
                            <Calendar size={18} />
                          </button>
                          {/* Hidden actual date input for the picker */}
                          <input 
                            type="date"
                            ref={dateInputRef}
                            style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                            onChange={(e) => setVisitDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Estimate Amount (LKR)</label>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          value={estimateAmount}
                          onChange={(e) => setEstimateAmount(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="submission-row">
                      <p>Estimate submitted to OA</p>
                      <button className="btn-send" onClick={() => alert("Submitted to OA")}>
                        <Send size={16} /> Sent
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <div className="placeholder-content">
              <p>Content for {activeTab.replace('-', ' ')} coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;