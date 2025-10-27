// src/components/Navbar.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../images/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const islogged = localStorage.getItem("token");
  const role = localStorage.getItem('userRole');

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src={logo} alt="CivicTrack Logo" className="h-16 w-16" />
          <Link to="/" className="text-xl font-bold">
            Civic Track
          </Link>
        </div>

        {/* Menu button for mobile */}
        <div className="md:hidden z-20">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Menu items */}
        <div
          className={`flex-col md:flex md:flex-row md:space-x-4 absolute md:static bg-blue-600 w-max rounded-md shadow-[0_8px_30px_rgba(0,0,0,0.5)] md:shadow-none border md:border-none border-gray-200 md:w-auto right-0  md:left-auto top-6 md:top-auto transition-transform duration-300 ease-in-out ${
            isOpen ? "flex z-8" : "hidden"
          }`}
        >
          {role=== 'admin'? (<Link
            to="/admin/dashboard"
            className="block px-4 py-2 hover:underline"
            onClick={() => setIsOpen(false)}
          >
            Admin Dashboard
          </Link>) : 
          (
            <>
              <Link
            to="/"
            className="block px-4 py-2 hover:underline"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/report"
            className="block px-4 py-2 hover:underline"
            onClick={() => setIsOpen(false)}
          >
            Report Issue
          </Link>

          {islogged ? (
            <Link
              to="/user/dashboard"
              className="block px-4 py-2 hover:underline"
              onClick={() => setIsOpen(false)}
            >
              User Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-2 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
            </>
          )}
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
