import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Replace with your backend URL
});

// Auth
export const loginUser = (data) => API.post("/login", data);

// Dashboard data
export const getTasks = () => API.get("/tasks");
export const getEmployees = () => API.get("/employees");
export const getContractors = () => API.get("/contractors");
