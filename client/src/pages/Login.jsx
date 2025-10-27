import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errs.email = "Email is invalid";
    if (!formData.password) errs.password = "Password is required";
    return errs;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      try{
        const url = "http://localhost:8080/api/auth/login";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        console.log(result);
        const { message, token, user } = result;

        if (token && message && user) {
          handleSuccess(message);
          localStorage.setItem("token", token);
          localStorage.setItem("loggedInUser", user.name);
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("userRole", user.role);
          setTimeout(() => {
            {user.role === "admin" ? navigate("/admin/dashboard") : navigate("/report");}
          }, 1000);
        }
        // Submit registration data to backend API here
        setFormData({ email: "", password: "" });
      }catch(err){
        handleError(err);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-semibold">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className={`w-full p-2 border rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-red-500 mt-1 text-sm">{errors.email}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block mb-1 font-semibold">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className={`w-full p-2 border rounded ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="text-red-500 mt-1 text-sm">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 mb-3 rounded font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
        <p>Don't have any account? <Link to={'/register'} className="text-blue-600">Sign Up</Link></p>
      </form>
      <ToastContainer/>
    </div>
  );
};

export default Login;
