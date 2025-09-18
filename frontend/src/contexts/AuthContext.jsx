import React, { createContext, useContext } from "react";
import { useAuthLogic } from "../hooks/useAuth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuthLogic();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
