import React from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../AuthContext";

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Welcome to Auth App
      </h1>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          A minimal authentication application with secure user management.
        </p>

        {user ? (
          <div>
            <p style={{ marginBottom: "1rem" }}>
              Hello, {user.firstName}! You are successfully signed in.
            </p>
            <Link
              to="/profile"
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#007bff",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                fontSize: "1.1rem",
              }}
            >
              View Profile
            </Link>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: "2rem" }}>
              Get started by creating an account or signing in.
            </p>
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
              <Link
                to="/signup"
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "1.1rem",
                }}
              >
                Sign Up
              </Link>
              <Link
                to="/signin"
                style={{
                  display: "inline-block",
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#007bff",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "1.1rem",
                }}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
