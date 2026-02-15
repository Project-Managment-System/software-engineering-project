import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ops.css";

const OpsRegister = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("All fields required");
      return;
    }

    // TEMP register logic (replace with API)
    localStorage.setItem("opsToken", "dummy_ops_token");
    navigate("/ops/dashboard");
  };

  return (
    <div className="ops-container">
      <div className="ops-card">
        <h2>OPS Register</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button type="submit">Register</button>
        </form>

        <p>
          Already registered? <a href="/ops/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default OpsRegister;
