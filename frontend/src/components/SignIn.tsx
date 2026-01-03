import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../AuthContext";

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already signed in
  if (user) {
    return <Navigate to="/profile" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(formData);
      navigate("/profile");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "2rem" }}>
      <h2>Sign In</h2>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "1rem",
            padding: "0.5rem",
            border: "1px solid red",
            borderRadius: "4px",
            backgroundColor: "#ffe6e6",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
              marginTop: "0.25rem",
              padding: "0.5rem",
              width: "100%",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
              marginTop: "0.25rem",
              padding: "0.5rem",
              width: "100%",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? "#ccc" : "#007bff",
            border: "none",
            borderRadius: "4px",
            boxSizing: "border-box",
            color: "white",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            padding: "0.75rem",
            width: "100%",
          }}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Don't have an account?{" "}
        <Link to="/signup" style={{ color: "#007bff", textDecoration: "none" }}>
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default SignIn;
