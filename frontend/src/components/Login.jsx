import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const location = useLocation();
  const [verifiedMessage, setVerifiedMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "https://news-app-akvl.onrender.com/api/auth/login",
        // "http://localhost:4000/api/auth/login",
        {
          email,
          password,
        }
      );
      localStorage.setItem("token", res.data.token);
      navigate("/"); // 🔹 Changed from "/" to "/dashboard"
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Your email is not verified. Please check your inbox.");
      } else {
        setError(err.response?.data?.error || "Invalid credentials");
      }
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified")) {
      const message =
        params.get("verified") === "true"
          ? "✅ Email verified successfully! You can now log in."
          : "❌ Email verification failed. Try again.";
      setVerifiedMessage(message);
      sessionStorage.setItem("verifiedMessage", message);
    } else {
      setVerifiedMessage(sessionStorage.getItem("verifiedMessage") || "");
    }
  }, [location]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form
        onSubmit={handleLogin}
        className="card p-4 shadow-lg"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="text-center mb-4">Login</h2>

        {verifiedMessage && (
          <div
            className="alert"
            style={{ color: verifiedMessage.includes("✅") ? "green" : "red" }}
          >
            {verifiedMessage}
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
