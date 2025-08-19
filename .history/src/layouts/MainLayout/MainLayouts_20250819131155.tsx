// src/layouts/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom"; // if you're using react-router
import Header from "@/shared/components/Footer";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
  return (
    <div className="tw-min-h-screen tw-flex tw-flex-col tw-bg-gray-50">
      {/* Header */}
      <header className="tw-bg-white tw-shadow tw-p-4">
        <div className="tw-container tw-mx-auto tw-flex tw-items-center tw-justify-between">
          <h1 className="tw-text-xl tw-font-bold">My App</h1>
          <nav className="tw-space-x-4">
            <a href="/" className="tw-text-gray-700 hover:tw-text-blue-600">
              Home
            </a>
            <a
              href="/about"
              className="tw-text-gray-700 hover:tw-text-blue-600"
            >
              About
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="tw-flex-1 tw-container tw-mx-auto tw-p-4">
        {/* If you use react-router, use <Outlet /> */}
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="tw-bg-gray-100 tw-p-4 tw-text-center tw-text-sm tw-text-gray-600">
        © {new Date().getFullYear()} My App. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
