// src/context/FundraiserContext.jsx
import React, { createContext, useContext, useState } from "react";

const FundraiserContext = createContext();

export const useFundraisers = () => {
  const context = useContext(FundraiserContext);
  if (!context) {
    throw new Error("useFundraisers must be used within a FundraiserProvider");
  }
  return context;
};

export function FundraiserProvider({ children }) {
  const [fundraisers, setFundraisers] = useState([]);

  const addFundraiser = (fundraiser) => {
    setFundraisers((prev) => [...prev, fundraiser]);
  };

  return (
    <FundraiserContext.Provider value={{ fundraisers, addFundraiser }}>
      {children}
    </FundraiserContext.Provider>
  );
}
