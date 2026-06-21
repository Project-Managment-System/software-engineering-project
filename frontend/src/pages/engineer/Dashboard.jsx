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
  const [allSystemUsers, setAllSystemUsers] = useState([]); 
  const [userFormData, setUserFormData] = useState({
    employeeId: '', firstName: '', secondName: '', email: '', password: '', division: ''
  });
  const [userDivision, setUserDivision] = useState('');
  // User Edit States
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({});

  // Change password form state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetches the jobs/projects for this engineer's division
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

  // Fetches all system users (for the assignee dropdown, Add User table,
  // and to refresh this engineer's own division from the DB)
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
    setUserDivision(localStorage.getItem('userDivision') || '');
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

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/users/${userId}`);
        setAllSystemUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        alert("User deleted successfully!");
      } catch (err) { 
        console.error("Error deleting user:", err); 
        alert("Failed to delete user.");
      }
    }
  };

  const startEditUser = (user) => {
    setEditingUser(user._id);
    setEditUserForm({ ...user });
  };

  const handleUpdateUser = async () => {
    try {
      await axios.put(`http://127.0.0.1:5000/api/users/${editingUser}`, editUserForm);
      setEditingUser(null);
      fetchUsers();
      alert("User updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Update failed.");
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
    } catch (error) { console.error("Error undoing status:", error); }
  };

  const handleAssigneeChange = async (jobNo, newAssignee) => {
    const url = `http://127.0.0.1:5000/api/projects/assign/${jobNo}`;
    try {
        await axios.patch(url, { assignee: newAssignee });
        setJobTrackingData(prev => prev.map(j => j.jobNo === jobNo ? { ...j, assignee: newAssignee } : j));
    } catch (error) { console.error("Failed to update:", error); }
  };

  const handleSaveProfile = () => { setProfileData(profileForm); alert("Profile Updated!"); };
  const handleUserFormChange = (e) => { setUserFormData({ ...userFormData, [e.target.name]: e.target.value }); };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (isChangingPassword) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirmation don't match.");
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      alert("Please fill in all password fields.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const userId = localStorage.getItem('userId');
      await axios.patch(`http://127.0.0.1:5000/api/users/${userId}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      alert("Password updated successfully!");
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const code = err.response?.data?.error;
      if (code === 'INCORRECT_CURRENT_PASSWORD') {
        alert("Current password is incorrect.");
      } else if (code === 'PASSWORD_TOO_SHORT') {
        alert("New password is too short.");
      } else {
        alert("Failed to update password. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Inside EngineerDashboard.jsx
const handleSaveUser = async (e) => {
    e.preventDefault();
    const payload = {
        employeeId: userFormData.employeeId, // Essential for Login
        fullName: `${userFormData.firstName} ${userFormData.secondName || ''}`.trim(),
        email: userFormData.email,
        password: userFormData.password,      // Essential for Login
        division: userFormData.division,
        role: 'engineer'
    };

    try {
        await axios.post('http://127.0.0.1:5000/api/users/add', payload);
        alert("User saved! They can now log in using their Employee ID.");
        // Reset form
        setUserFormData({ employeeId: '', firstName: '', secondName: '', email: '', password: '', division: '' });
        await fetchUsers(); 
    } catch (err) {
        alert("Save failed. Check if all fields are filled.");
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
                  <thead><tr><th>No</th><th>Job No</th><th>Job Name</th><th>Date of request</th><th>Allocation</th><th>Approval</th></tr></thead>
                  <tbody>
                    {approvalData.filter(j => filterDivision === 'All' || j.division === filterDivision).map((job) => (
                      <tr key={job.jobNo}>
                        <td>{job.sNo}</td><td>{job.jobNo}</td><td>{job.jobName}</td><td>{formatDate(job.dateReq)}</td><td>{job.allocation}</td>
                        <td>
                          {job.status === 'Pending' ? (
                            <>
                              <button className="approve-btn" onClick={() => handleApprove(job.jobNo, 'Approved')}><Check size={16} /></button>
                              <button className="reject-btn" onClick={() => handleApprove(job.jobNo, 'Rejected')}><X size={16} /></button>
                            </>
                          ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{job.status} <button onClick={() => handleUndoApproval(job.jobNo)} title="Reset" style={{ cursor: 'pointer', background: 'none', border: 'none' }}><Undo size={14}/></button></span>
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
                              <select style={{ color: 'black', backgroundColor: 'white', padding: '5px' }} value={job.assignee || ""} onChange={(e) => handleAssigneeChange(job.jobNo, e.target.value)}>
                                  <option value="" disabled>Select Assignee</option>
                                  {allSystemUsers.map((user) => {
                                      const displayName = user.fullName || `${user.firstName || ''} ${user.secondName || ''}`.trim();
                                      return <option key={user._id} value={displayName}>{displayName || "Unnamed User"}</option>;
                                  })}
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
             <div style={{ padding: '20px' }}>
               <div className="profile-section" style={{ padding: '30px', background: 'white', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'left', width: '500px', marginBottom: '30px' }}>
                 <h3>Add User Into System</h3>
                 <form className="profile-form" onSubmit={handleSaveUser}>
                    <label>EMPLOYEE ID *</label><input name="employeeId" value={userFormData.employeeId} onChange={handleUserFormChange} />
                    <label>FIRST NAME *</label><input name="firstName" value={userFormData.firstName} onChange={handleUserFormChange} />
                    <label>SECOND NAME</label><input name="secondName" value={userFormData.secondName} onChange={handleUserFormChange} />
                    <label>EMAIL ADDRESS *</label><input type="email" name="email" value={userFormData.email} onChange={handleUserFormChange} />
                    <label>PASSWORD *</label><input type="password" name="password" value={userFormData.password} onChange={handleUserFormChange} />
                    <label>DIVISION</label><input name="division" value={userFormData.division} onChange={handleUserFormChange} />
                    <div className="action-buttons">
                      <button type="submit" className="confirm-btn">Save User</button>
                      <button type="button" className="cancel-btn" onClick={() => setActiveTab('my-jobs')}>Cancel</button>
                    </div>
                 </form>
               </div>

               <h3>System Users</h3>
               <table className="project-table">
                 <thead><tr><th>#</th><th>Employee ID</th><th>Name</th><th>Email</th><th>Division</th><th>Action</th></tr></thead>
                 <tbody>
  {allSystemUsers.map((user, i) => (
    <tr key={user._id}>
      <td>{i + 1}</td>
      <td>
        {editingUser === user._id ? (
          <input 
            value={editUserForm.employeeId || ''} 
            onChange={e => setEditUserForm({...editUserForm, employeeId: e.target.value})}
            style={{ display: 'block', width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        ) : user.employeeId}
      </td>
      <td>
        {editingUser === user._id ? (
          <input 
            value={editUserForm.fullName || ''} 
            onChange={e => setEditUserForm({...editUserForm, fullName: e.target.value})}
            style={{ display: 'block', width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        ) : user.fullName}
      </td>
      <td>
        {editingUser === user._id ? (
          <input 
            value={editUserForm.email || ''} 
            onChange={e => setEditUserForm({...editUserForm, email: e.target.value})}
            style={{ display: 'block', width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        ) : user.email}
      </td>
      <td>
        {editingUser === user._id ? (
          <input 
            value={editUserForm.division || ''} 
            onChange={e => setEditUserForm({...editUserForm, division: e.target.value})}
            style={{ display: 'block', width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        ) : user.division}
      </td>
      <td>
        {editingUser === user._id ? (
          <div style={{ display: 'flex', gap: '5px' }}>
            <button onClick={handleUpdateUser} style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              <Check size={16} />
            </button>
            <button onClick={() => setEditingUser(null)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '5px' }}>
            <button className="edit-btn" onClick={() => startEditUser(user)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <Edit3 size={16} />
            </button>
            <button className="delete-btn" onClick={() => handleDeleteUser(user._id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'red' }}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </td>
    </tr>
  ))}
</tbody>
               </table>
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

               <h3 style={{ marginTop: '30px' }}>Change Password</h3>
               <form className="profile-form" onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                 <label>CURRENT PASSWORD</label>
                 <input
                   type="password"
                   value={passwordForm.currentPassword}
                   onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                 />
                 <label>NEW PASSWORD</label>
                 <input
                   type="password"
                   value={passwordForm.newPassword}
                   onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                 />
                 <label>CONFIRM NEW PASSWORD</label>
                 <input
                   type="password"
                   value={passwordForm.confirmPassword}
                   onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                 />
                 <button type="submit" className="confirm-btn" disabled={isChangingPassword}>
                   {isChangingPassword ? 'Updating...' : 'Update Password'}
                 </button>
               </form>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;