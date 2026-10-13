import React from "react";

export default function PageTransition({ routeKey, children, className = "", disabled = false }) {
  return (
    <div key={routeKey} className={`${disabled ? "" : "app-page-transition"} ${className}`}>
      {children}
    </div>
  );
}
