import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ops.css";

const OpsLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    // TEMP login logic (replace with API)
    localStorage.setItem("opsToken", "dummy_ops_token");
    navigate("/ops/dashboard");
  };

  return (
    <div className="ops-container">
      <div className="ops-card">
        <h2>OPS Login</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>

        <p>
          No account? <a href="/ops/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default OpsLogin;
