import React, { useState, useRef } from 'react';
import './Dashboard.css';
import { User, Briefcase, RefreshCw, Settings, ArrowLeft, Send, Calendar, Save, Edit3, Camera, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = ({ isDark }) => {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('my-jobs');
  
  const [selectedJobId, setSelectedJobId] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [estimateAmount, setEstimateAmount] = useState('');

  const [profileName, setProfileName] = useState('John Doe');
  const [regNo, setRegNo] = useState('REG/2021/CS/088');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phoneNo, setPhoneNo] = useState('071-2345678');
  const [profilePic, setProfilePic] = useState(null);

  const [editProfileName, setEditProfileName] = useState('');
  const [editRegNo, setEditRegNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNo, setEditPhoneNo] = useState('');

  const [editableJobName, setEditableJobName] = useState('');
  const [editableAllocation, setEditableAllocation] = useState('');
  const [editableAssignDate, setEditableAssignDate] = useState('');
  const [editableDeadline, setEditableDeadline] = useState('');

  const [submittedEstimates, setSubmittedEstimates] = useState([]);

  const handleCheckEstimate = (estimateNo) => {
    setSubmittedEstimates(submittedEstimates.map(est => 
      est.no === estimateNo ? { ...est, isChecked: !est.isChecked } : est
    ));
  };

  const handleProfileTabOpen = () => {
    setEditProfileName(profileName);
    setEditRegNo(regNo);
    setEditEmail(email);
    setEditPhoneNo(phoneNo);
  };

  const handleConfirmProfile = () => {
    setProfileName(editProfileName);
    setRegNo(editRegNo);
    setEmail(editEmail);
    setPhoneNo(editPhoneNo);
    alert("Profile Saved!");
  };

  const handleCancelProfile = () => {
    setActiveTab('my-jobs');
  };

  const [jobData, setJobData] = useState([
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
  ]);

  const selectedJob = jobData.find(job => job.jobNo === selectedJobId);

  const handleSelectionChange = (id) => {
    setSelectedJobId(id);
    const foundJob = jobData.find(j => j.jobNo === id);
    if (foundJob) {
      setEditableJobName(foundJob.jobName);
      setEditableAllocation(foundJob.allocation);
      setEditableAssignDate(foundJob.assignDate);
      setEditableDeadline(foundJob.deadline);
    }
  };

  const handleSaveJob = () => {
    setJobData(jobData.map(job => job.jobNo === selectedJobId ? {
      ...job,
      jobName: editableJobName,
      allocation: editableAllocation,
      assignDate: editableAssignDate,
      deadline: editableDeadline
    } : job));
    alert("Job details saved successfully!");
  };

  const handleSubmitEstimate = () => {
    if (!selectedJobId || !visitDate || !estimateAmount) {
      alert("Please fill in all fields");
      return;
    }
    const newEstimate = {
      no: submittedEstimates.length + 1,
      jobNo: selectedJob.jobNo,
      jobName: selectedJob.jobName,
      toName: profileName,
      allocation: selectedJob.allocation,
      estimatedAmount: estimateAmount,
      checkedOn: visitDate,
      sendApproval: "Pending",
      isChecked: false
    };
    setSubmittedEstimates([...submittedEstimates, newEstimate]);
    setVisitDate('');
    setEstimateAmount('');
    alert("Estimate submitted to OA");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      window.location.href = '/';
    }
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker ? dateInputRef.current.showPicker() : dateInputRef.current.focus();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEstimateAmountChange = (e) => {
    const value = e.target.value;
    // Allow only digits and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setEstimateAmount(value);
    }
  };

  const handleEstimateAmountKeyDown = (e) => {
    // Prevent e, E, +, - from being typed
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div id="cems-user-dashboard" className={isDark ? 'dark-mode' : 'light-mode'}>
      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="profile-box">
            <div className="profile-photo" style={{ overflow: 'hidden' }}>
              {profilePic ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={48} />}
            </div>
            <div className="profile-info">
              <h3>{profileName}</h3>
              <p className="reg-number">{regNo}</p>
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
              <RefreshCw size={18} /> <strong>Update Progress</strong>
            </button>
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('profile');
                handleProfileTabOpen();
              }}
            >
              <Edit3 size={18} /> Profile
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} /> Settings
            </button>
            <button className="nav-item logout-nav-item" onClick={handleLogout}><LogOut size={18} /> Logout</button>
            
          </nav>
        </aside>

        <main className="dashboard-content">
          <header className="content-header">
            <div className="header-left">    
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
              <div className="selection-area" style={{ marginBottom: '30px' }}>
                <label>Select Job</label>
                <select 
                  className="job-select-dropdown" 
                  value={selectedJobId} 
                  onChange={(e) => handleSelectionChange(e.target.value)}
                >
                  <option value="">-- Choose Job ID --</option>
                  {jobData.map(job => (
                    <option key={job.jobNo} value={job.jobNo}>{job.jobNo} - {job.jobName}</option>
                  ))}
                </select>
              </div>

              {selectedJob && (
                <div className="form-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <div className="field-card">
                    <p className="instruction-text" style={{ marginTop: '0px', marginBottom: '20px' }}>You can update the job details below:</p>
                    <div className="input-row-group">
                      <label>Job No:</label>
                      <input type="text" disabled value={selectedJob.jobNo} className="input-field disabled" />
                    </div>
                    <div className="input-row-group">
                      <label>Job Name</label>
                      <input type="text" value={editableJobName} onChange={(e) => setEditableJobName(e.target.value)} className="input-field" />
                    </div>
                    <div className="input-row-group">
                      <label>Allocation</label>
                      <input type="text" value={editableAllocation} onChange={(e) => setEditableAllocation(e.target.value)} className="input-field" />
                    </div>
                    <div className="input-row-group">
                      <label>Assign Date</label>
                      <input type="date" value={editableAssignDate} onChange={(e) => setEditableAssignDate(e.target.value)} className="input-field" />
                    </div>
                    <div className="input-row-group">
                      <label>Target Complete Date</label>
                      <input type="date" value={editableDeadline} onChange={(e) => setEditableDeadline(e.target.value)} className="input-field" />
                    </div>
                    <button className="save-btn" onClick={handleSaveJob}>
                      <Save size={16} /> Save Changes
                    </button>
                  </div>

                  <div className="field-card">
                    <div className="input-row-group">
                      <label>Field Visit Date</label>
                      <div className="hybrid-date-wrapper">
                        <input type="text" className="input-field" placeholder="YYYY-MM-DD" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                        <button type="button" className="cal-btn" onClick={handleCalendarClick}><Calendar size={18} /></button>
                        <input type="date" ref={dateInputRef} className="hidden-date" onChange={(e) => setVisitDate(e.target.value)} style={{ opacity: 0, position: 'absolute' }} />
                      </div>
                    </div>
                    <div className="input-row-group">
                      <label>Estimate Amount (LKR)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        placeholder="0.00" 
                        value={estimateAmount} 
                        onChange={handleEstimateAmountChange}
                        onKeyDown={handleEstimateAmountKeyDown}
                      />
                    </div>
                    <button className="send-btn" onClick={handleSubmitEstimate}>
                      <Send size={16} /> Submit Estimate
                    </button>
                  </div>
                </div>
              )}

              {submittedEstimates.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontWeight: 900 }}>Submitted Estimates</h3>
                  <table className="project-table">
                    <thead>
                      <tr>
                        <th>NO</th>
                        <th>Job No</th>
                        <th>Job Name</th>
                        <th>To Name</th>
                        <th>Allocation</th>
                        <th>Estimated Amount (LKR)</th>
                        <th>Checked On</th>
                        <th>Send Approval</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submittedEstimates.map((estimate) => (
                        <tr key={estimate.no}>
                          <td>{estimate.no}</td>
                          <td className="font-mono text-cyan-500">{estimate.jobNo}</td>
                          <td className="font-bold">{estimate.jobName}</td>
                          <td>{estimate.toName}</td>
                          <td>{estimate.allocation}</td>
                          <td className="font-bold">{estimate.estimatedAmount}</td>
                          <td>
                            <button 
                              onClick={() => handleCheckEstimate(estimate.no)}
                              style={{
                                background: estimate.isChecked ? '#10b981' : '#f0f0f0',
                                color: estimate.isChecked ? 'white' : '#666',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                              }}
                            >
                              {estimate.isChecked ? '✓ Checked' : '☐ Not Checked'}
                            </button>
                          </td>
                          <td>
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                              {estimate.sendApproval}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {activeTab === 'profile' && (
            <section className="profile-view">
              <div className="form-container" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="field-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {profilePic ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} />}
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                      <button onClick={() => fileInputRef.current.click()} style={{ position: 'absolute', bottom: '0', right: '0', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer' }}><Camera size={16}/></button>
                    </div>
                    <h3>Personal Details</h3>
                  </div>
                  <div className="input-row-group">
                    <label>FULL NAME</label>
                    <input type="text" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} className="input-field" />
                  </div>
                  <div className="input-row-group">
                    <label>REGISTRATION NUMBER</label>
                    <input type="text" value={editRegNo} onChange={(e) => setEditRegNo(e.target.value)} className="input-field" />
                  </div>
                  <div className="input-row-group">
                    <label>EMAIL ADDRESS</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input-field" />
                  </div>
                  <div className="input-row-group">
                    <label>PHONE NUMBER</label>
                    <input type="text" value={editPhoneNo} onChange={(e) => setEditPhoneNo(e.target.value)} className="input-field" />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button className="confirm-btn" onClick={handleConfirmProfile} style={{ padding: '10px 20px', background: 'purple', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Confirm
                    </button>
                    <button className="cancel-btn" onClick={handleCancelProfile} style={{ padding: '10px 20px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
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