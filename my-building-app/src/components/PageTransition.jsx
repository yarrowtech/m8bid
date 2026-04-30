import React from "react";

export default function PageTransition({ routeKey, children }) {
  return (
    <div key={routeKey} className="app-page-transition">
      {children}
    </div>
  );
}

