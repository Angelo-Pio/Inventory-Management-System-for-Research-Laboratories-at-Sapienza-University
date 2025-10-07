import React, { createContext, useContext, useEffect, useState } from "react";
import { checkAuth, getUserRole } from "../services/authServices";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Run on mount to check if user already has a valid session (cookie-based)
  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);
      if (isAuth) setRole(getUserRole());
      setLoading(false);
    };
    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, role, setRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
