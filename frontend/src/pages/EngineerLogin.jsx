import React from "react";
import { useNavigate } from "react-router-dom";

const EngineerLogin = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem("token", "engineer-token");
    localStorage.setItem("role", "engineer");
    navigate("/engineer/dashboard");
  };

  return (
    <div style={styles.box}>
      <h2>Engineer Login</h2>
      <input placeholder="Engineer ID" />
      <input type="password" placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

const styles = {
  box: { width: "300px", margin: "100px auto", textAlign: "center" }
};

export default EngineerLogin;
