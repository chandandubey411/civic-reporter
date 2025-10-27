// src/App.js
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportIssue from "./pages/ReportIssue";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RefreshHandler from "./RefreshHandler";

function App() {
  const [isAuthenticated, setisAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const PrivateRoute = ({ element }) => {
    if (isAuthLoading) return <div>Loading...</div>; // or a spinner
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };

  const PrivateRouteAdmin = ({ element }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");

    if (!token) return <Navigate to="/login" replace />;
    if (role !== "admin")
      return (
        <div className="text-center text-red-600 p-10 font-bold text-xl">
          Not Authorized
        </div>
      );
    return element;
  };

  return (
    <Router>
      <RefreshHandler
        setisAuthenticated={setisAuthenticated}
        setIsAuthLoading={setIsAuthLoading}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route
              path="/user/dashboard"
              element={<PrivateRoute element={<UserDashboard />} />}
            />
            <Route path="/admin/dashboard" element={<PrivateRouteAdmin element={<AdminDashboard />}/>}/>
          </Routes>
        </main>
        <footer className="bg-gray-200 text-center p-4">
          &copy; 2025 CivicTrack System
        </footer>
      </div>
    </Router>
  );
}

export default App;
