import React, { createContext, useContext, useEffect, useState } from "react";
import { checkAuth, getUserRole } from "../services/authServices";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ id: null, name: null, surname: null, email: null , role: null, departmentId: null });
  const [department, setDepartment] = useState({ id: null, name: null });
  const [loading, setLoading] = useState(true);

  // Run on mount to check if user already has a valid session (cookie-based)
  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        const role = getUserRole();
        setUser(prev => ({ ...prev, role }));
      }
      setLoading(false);
    };
    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, setUser, loading, department, setDepartment }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
