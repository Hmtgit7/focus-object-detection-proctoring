import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default Layout;
