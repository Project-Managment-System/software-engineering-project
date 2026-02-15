import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ProjectForm = () => {
  const navigate = useNavigate();

  // --- Form state ---
  const [formData, setFormData] = useState({
    projectName: '',
    location: '',
    budget: '',
    status: 'Pending',
    managerId: '696f918a910011646d33879e' // Replace with actual Admin ID
  });

  const { projectName, location, budget, status } = formData;

  // --- Handle form input changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- Handle form submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/projects/add', formData);
      alert("Project Registered in System! 🏗️");
      navigate('/'); // Redirect back to Dashboard
    } catch (err) {
      console.error("PROJECT_REGISTRATION_ERROR:", err);
    }
  };

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      className="form-page"
    >
      <h2>Register New Project</h2>

      <form onSubmit={handleSubmit} className="ultra-form">
        {/* Project Name */}
        <div className="input-group">
          <label>Project Name</label>
          <input 
            type="text" 
            name="projectName"
            value={projectName} 
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Location */}
        <div className="input-group">
          <label>Location</label>
          <input 
            type="text" 
            name="location"
            value={location} 
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Budget */}
        <div className="input-group">
          <label>Budget ($)</label>
          <input 
            type="number" 
            name="budget"
            value={budget} 
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Status */}
        <div className="input-group">
          <label>Status</label>
          <select 
            name="status"
            value={status} 
            onChange={handleChange}
          >
            <option value="Pending">Pending</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button type="submit" className="submit-btn">Deploy Project</button>
      </form>
    </motion.div>
  );
};

export default ProjectForm;
