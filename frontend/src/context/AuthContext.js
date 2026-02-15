import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Unified Context
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load session on startup
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = (role) => {
    const userData = { role, name: "Engineer Alpha", id: "CE-102" };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <AppContext.Provider value={{ user, login, logout, darkMode, toggleTheme, loading }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook for easy access
export const useApp = () => useContext(AppContext);