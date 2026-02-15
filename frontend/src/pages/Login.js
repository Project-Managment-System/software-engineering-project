import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem("token", "user-token");
    localStorage.setItem("role", "user");
    navigate("/user/dashboard");
  };

  return (
    <div style={styles.box}>
      <h2>User Login</h2>
      <input placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

const styles = {
  box: { width: "300px", margin: "100px auto", textAlign: "center" }
};

export default Login;
