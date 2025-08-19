// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom"; // if you're using react-router
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">My App</h1>
          <nav className="space-x-4">
            <a href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </a>
            <a href="/about" className="text-gray-700 hover:text-blue-600">
              About
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4">
        {/* If you use react-router, use <Outlet /> */}
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} My App. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
