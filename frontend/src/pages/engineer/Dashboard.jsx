import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { User, Briefcase, RefreshCw, Settings, Edit3, LogOut, Save, Check, X, Menu, UserPlus, Undo, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = ({ isDark }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-jobs');
  const [jobSubTab, setJobSubTab] = useState('approvals'); 
  const [profilePic, setProfilePic] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [filterDivision, setFilterDivision] = useState('All');

  // Division shown at the top of the dashboard. Starts from localStorage
  // (set at login) and gets refreshed from the DB once allSystemUsers loads,
  // in case an admin has changed it since this engineer last logged in.
  const [currentDivision, setCurrentDivision] = useState(localStorage.getItem('userDivision') || '');

  // Real logged-in user info, set by DivisionLogin.js into localStorage
  const [profileData, setProfileData] = useState({
    name: localStorage.getItem('fullName') || 'User',
    reg: localStorage.getItem('employeeId') || '',
    email: localStorage.getItem('email') || '',
    phone: ''
  });
  const [profileForm, setProfileForm] = useState(profileData);

  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [jobTrackingData, setJobTrackingData] = useState([]); 
  const [approvalData, setApprovalData] = useState([]); 

  const [systemUsers, setSystemUsers] = useState([]);
  const [allSystemUsers, setAllSystemUsers] = useState([]); // New: Stores users for dropdown
  const [userFormData, setUserFormData] = useState({
    employeeId: '', firstName: '', secondName: '', email: '', phoneNum: '', nationalId: '', address: '', password: '', division: ''
  });

const fetchData = async () => {
  try {
    const division = localStorage.getItem('userDivision');
    const res = await axios.get(`http://127.0.0.1:5000/api/projects/division/${division}`);
    
    const data = res.data.map((item, index) => ({
      ...item,
      sNo: index + 1,
      assignee: item.assignee || '' // Ensure assignee field exists
    }));
    setApprovalData(data);
    setJobTrackingData(data);
  } catch (err) { console.error("Error fetching data:", err); }
};

// New: Fetch users to populate dropdown
const fetchUsers = async () => {
    try {
        const res = await axios.get(`http://127.0.0.1:5000/api/users`);
        setAllSystemUsers(res.data);

        // Refresh this engineer's division from the DB (in case it changed
        // since they last logged in), rather than trusting localStorage alone.
        const myEmployeeId = localStorage.getItem('employeeId');
        const me = res.data.find(u => u.employeeId === myEmployeeId);
        if (me && me.division) {
            setCurrentDivision(me.division);
            localStorage.setItem('userDivision', me.division);
        }
    } catch (err) { console.error("Error fetching users:", err); }
};

  useEffect(() => { 
      fetchData(); 
      fetchUsers(); 
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      navigate('/');
    }
  };
  const startEdit = (job) => { setEditingJob(job.jobNo); setEditForm(job); };
  
  const handleUpdate = async () => { 
    await axios.put(`http://127.0.0.1:5000/api/projects/update/${editForm.jobNo}`, editForm);
    setEditingJob(null);
    fetchData();
  };
  
  const handleDelete = async (jobNo) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      await axios.delete(`http://127.0.0.1:5000/api/projects/delete/${jobNo}`);
      fetchData();
    }
  };

  const handleApprove = async (jobNo, status) => { 
    await axios.patch(`http://127.0.0.1:5000/api/projects/status/${jobNo}`, { status });
    fetchData(); 
  };

const handleUndoApproval = async (jobNo) => {
  try {
    await axios.patch(`http://127.0.0.1:5000/api/projects/undo/${jobNo}`);
    fetchData(); 
  } catch (error) {
    console.error("Error undoing status:", error);
    alert("Could not undo status. Check console.");
  }
  };

  // New: Update Assignee
  const handleAssigneeChange = async (jobNo, newAssignee) => {
      await axios.patch(`http://127.0.0.1:5000/api/projects/assign/${jobNo}`, { assignee: newAssignee });
      fetchData();
  };

  const handleSaveProfile = () => { setProfileData(profileForm); alert("Profile Updated!"); };
  const handleUserFormChange = (e) => { setUserFormData({ ...userFormData, [e.target.name]: e.target.value }); };


  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    // 1. Add simple loading state to prevent double-clicks
    if (e.target.dataset.submitting === "true") return;
    e.target.dataset.submitting = "true";

    try {
        // ... your axios code ...
        await axios.post('http://127.0.0.1:5000/api/users/add', userFormData);
        alert("User saved successfully!");
        // ...
    } catch (err) {
        console.error("Error:", err);
    } finally {
        e.target.dataset.submitting = "false";
    }
   };

  return (
    <div id="cems-user-dashboard" className={isDark ? 'dark-mode' : 'light-mode'}>
      <button className="sidebar-toggle-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={20} /></button>
      <div className="user-dashboard-layout">
        <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="profile-box">
            <div className="profile-photo">{profilePic ? <img src={profilePic} alt="Profile" /> : <User size={48} />}</div>
            <h3>{profileData.name}</h3>
            <p className="reg-number">{profileData.reg}</p>
          </div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'my-jobs' ? 'active' : ''}`} onClick={() => setActiveTab('my-jobs')}><Briefcase size={18} /> My Jobs</button>
            <button className={`nav-item ${activeTab === 'add-user' ? 'active' : ''}`} onClick={() => setActiveTab('add-user')}><UserPlus size={18} /> Add User</button>
            <button className={`nav-item ${activeTab === 'update-progress' ? 'active' : ''}`} onClick={() => setActiveTab('update-progress')}><RefreshCw size={18} /> Update Progress</button>
            <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}><Edit3 size={18} /> Profile</button>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={18} /> Settings</button>
            <button className="nav-item logout-nav-item" onClick={handleLogout}><LogOut size={18} /> Logout</button>
          </nav>
        </aside>

        <main className={`dashboard-content ${isSidebarOpen ? 'content-shifted-open' : 'content-shifted-closed'}`}>
          {currentDivision && (
            <div className="division-banner" style={{
              marginBottom: '20px',
              padding: '12px 20px',
              background: 'transparent',
              color: '#000',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>
              {currentDivision} Division
            </div>
          )}
          {activeTab === 'my-jobs' && (
            <>

              <div className="sub-tabs" style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
                <button onClick={() => setJobSubTab('approvals')} style={{ padding: '10px', background: jobSubTab === 'approvals' ? '#ddd' : 'transparent', border: 'none', cursor: 'pointer' }}>Approval Requests</button>
                <button onClick={() => setJobSubTab('tracking')} style={{ padding: '10px', background: jobSubTab === 'tracking' ? '#ddd' : 'transparent', border: 'none', cursor: 'pointer' }}>Assignee</button>
              </div>

              {jobSubTab === 'approvals' && (
                <table className="project-table">
                  <thead><tr><th>No</th><th>Job No</th><th>Division</th><th>Job Name</th><th>Date of request</th><th>Allocation</th><th>Approval</th></tr></thead>
                  <tbody>
                    {approvalData.filter(j => filterDivision === 'All' || j.division === filterDivision).map((job) => (
                      <tr key={job.jobNo}>
                        <td>{job.sNo}</td><td>{job.jobNo}</td><td>{job.division}</td><td>{job.jobName}</td><td>{formatDate(job.dateReq)}</td><td>{job.allocation}</td>
                        <td>
                          {job.status === 'Pending' ? (
                            <>
                              <button className="approve-btn" onClick={() => handleApprove(job.jobNo, 'Approved')}><Check size={16} /></button>
                              <button className="reject-btn" onClick={() => handleApprove(job.jobNo, 'Rejected')}><X size={16} /></button>
                            </>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {job.status} 
                              <button onClick={() => handleUndoApproval(job.jobNo)} title="Reset to Pending" style={{ cursor: 'pointer', background: 'none', border: 'none' }}><Undo size={14}/></button>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {jobSubTab === 'tracking' && (
                <>
                  <table className="project-table">
                    <thead><tr><th>No</th><th>Job No</th><th>Division</th><th>Job Name</th><th>Allocation</th><th>Assignee</th><th>Action</th></tr></thead>
                    <tbody>
                      {jobTrackingData.map((job) => (
                        <tr key={job.jobNo}>
                          <td>{job.sNo}</td><td>{job.jobNo}</td><td>{job.division}</td><td>{job.jobName}</td><td>{job.allocation}</td>
                          <td>
                              <select value={job.assignee || ''} onChange={(e) => handleAssigneeChange(job.jobNo, e.target.value)}>
                                  <option value="">Select Assignee</option>
                                  {allSystemUsers.map(user => (
                                      <option key={user.employeeId} value={user.firstName}>{user.firstName}</option>
                                  ))}
                              </select>
                          </td>
                          <td>
                            <button className="edit-btn" onClick={() => startEdit(job)}><Edit3 size={16} /> Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(job.jobNo)}><Trash2 size={16} color="red" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {editingJob && (
                    <div className="edit-section" style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                      <h3>Update Job: {editForm.jobNo}</h3>
                      <input value={editForm.jobName} onChange={(e) => setEditForm({...editForm, jobName: e.target.value})} placeholder="Job Name" />
                      <input value={editForm.allocation} onChange={(e) => setEditForm({...editForm, allocation: e.target.value})} placeholder="Allocation" />
                      <button className="confirm-btn" onClick={handleUpdate}><Save size={16} /> Update Changes</button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === 'add-user' && (
             <div className="profile-section" style={{ padding: '30px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'left', width: '500px' }}>
               <h3>Add User Into System</h3>
               <form className="profile-form" onSubmit={handleSaveUser}>
                  <label>EMPLOYEE ID *</label><input name="employeeId" value={userFormData.employeeId} onChange={handleUserFormChange} />
                  <label>FIRST NAME *</label><input name="firstName" value={userFormData.firstName} onChange={handleUserFormChange} />
                  <label>EMAIL ADDRESS *</label><input type="email" name="email" value={userFormData.email} onChange={handleUserFormChange} />
                  <label>PASSWORD *</label><input type="password" name="password" value={userFormData.password} onChange={handleUserFormChange} />
                  <label>DIVISION</label><input name="division" value={userFormData.division} onChange={handleUserFormChange} />
                  <div className="action-buttons">
                    <button type="submit" className="confirm-btn">Save User</button>
                    <button type="button" className="cancel-btn" onClick={() => setActiveTab('my-jobs')}>Cancel</button>
                  </div>
               </form>
             </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section" style={{ padding: '30px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'left', width: '500px' }}>
              <h3 style={{ fontWeight: '800', textAlign: 'center', marginBottom: '20px' }}>Personal Details</h3>
              <div className="profile-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label>FULL NAME</label><input value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} />
                <label>EMPLOYEE ID</label><input value={profileForm.reg} onChange={(e) => setProfileForm({...profileForm, reg: e.target.value})} />
                <button className="confirm-btn" onClick={handleSaveProfile}>Confirm</button>
              </div>
            </div>
          )}

          {activeTab === 'update-progress' && <div className="placeholder-content"><p>Content for Update Progress coming soon...</p></div>}
          
          {activeTab === 'settings' && (
             <div className="settings-section" style={{ padding: '20px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
               <h3>System Settings</h3>
               <div className="profile-form"><label>THEME</label><select><option>Light Mode</option><option>Dark Mode</option></select></div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;