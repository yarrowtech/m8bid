// src/context/RaiserContext.jsx
import React, { createContext, useContext, useState } from "react";

const RaiserContext = createContext();

export const useRaisers = () => {
  const context = useContext(RaiserContext);
  if (!context) {
    throw new Error("useRaisers must be used within a RaiserProvider");
  }
  return context;
};

export function RaiserProvider({ children }) {
  const [raisers, setRaisers] = useState([]);

  const addRaiser = (raiser) => {
    setRaisers((prev) => [...prev, raiser]);
  };

  return (
    <RaiserContext.Provider value={{ raisers, addRaiser }}>
      {children}
    </RaiserContext.Provider>
  );
}
