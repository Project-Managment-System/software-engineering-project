import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js"; // Explicitly point to the .js file you are editing
import "./index.css"; 
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();