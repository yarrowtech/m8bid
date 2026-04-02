import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();

  // Check if user is logged in
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
  }

  const decoded = JSON.parse(atob(token.split('.')[1])); // Decode JWT token
  const { name, email } = decoded; // Extract user info

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Email:</strong> {email}</p>
      <button
        onClick={() => navigate("/settings")}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
      >
        Edit Profile
      </button>
    </div>
  );
}
