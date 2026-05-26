import React from "react";

export default function PageTransition({ routeKey, children, className = "" }) {
  return (
    <div key={routeKey} className={`app-page-transition ${className}`}>
      {children}
    </div>
  );
}
