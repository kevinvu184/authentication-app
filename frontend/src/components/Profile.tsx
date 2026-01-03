import React from "react";

import { useAuth } from "../AuthContext";

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return null; // This should be protected by ProtectedRoute
  }

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      signOut();
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2>Profile</h2>
        <button
          onClick={handleSignOut}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>

      <div
        style={{
          padding: "1.5rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <strong>Name:</strong> {user.firstName} {user.lastName}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <strong>Email:</strong> {user.email}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <strong>Member Since:</strong>{" "}
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <strong>Last Updated:</strong>{" "}
          {new Date(user.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
