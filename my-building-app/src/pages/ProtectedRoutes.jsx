import React from "react";
import { Route, Navigate , Routes } from "react-router-dom";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const token = localStorage.getItem("token");

  // If token exists, the user is logged in; if not, redirect to login page
  return (
    <Routes>
    <Route
      {...rest}
      render={(props) =>
        token ? (
          <Component {...props} /> // Allow access to the protected component
        ) : (
          <Navigate to="/login" /> // Redirect to login page if no token
        )
      }
    />
    </Routes>
  );
};

export default ProtectedRoute;
