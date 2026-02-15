import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const MainLayout = () => {
  return (
    <div className="app-container">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="p-4 w-full">
          <Outlet /> {/* This renders the specific dashboard page */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;