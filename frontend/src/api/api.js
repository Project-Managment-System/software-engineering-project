import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// =======================
// AUTH APIs
// =======================

// Register user
export const registerUser = (data) => API.post("/auth/enroll", data);

// Login user
export const loginUser = (data) => API.post("/auth/login", data);

// =======================
// Dashboard data
// =======================

export const getTasks = () => API.get("/tasks");
export const getEmployees = () => API.get("/employees");
export const getContractors = () => API.get("/contractors");