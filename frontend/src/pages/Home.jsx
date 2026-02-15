import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div style={styles.container}>
      <h1>Civil Engineering Management System</h1>
      <p>Select your role</p>

      <div style={styles.btnGroup}>
        <Link to="/login">User Login</Link>
        <Link to="/engineer-login">Engineer Login</Link>
        <Link to="/admin-login">Admin Login</Link>
      </div>
    </div>
  );
};

const styles = {
  container: { textAlign: "center", marginTop: "100px" },
  btnGroup: { display: "flex", gap: "20px", justifyContent: "center" }
};

export default Home;
