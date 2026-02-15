import React from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem("token", "admin-token");
    localStorage.setItem("role", "admin");
    navigate("/admin/dashboard");
  };

  return (
    <div style={styles.box}>
      <h2>Admin Login</h2>
      <input placeholder="Admin Username" />
      <input type="password" placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

const styles = {
  box: { width: "300px", margin: "100px auto", textAlign: "center" }
};

export default AdminLogin;
