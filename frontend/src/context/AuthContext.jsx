import { useEffect, useState } from "react";
import { AuthContext } from "./authContextValue";
import api from "../services/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
    if (token) {
      sessionStorage.setItem("token", token);
    }
  };

  const startImpersonation = (userData, token) => {
    const currentUser = sessionStorage.getItem("user");
    const currentToken = sessionStorage.getItem("token");
    if (currentUser && currentToken) {
      sessionStorage.setItem("supportOriginalUser", currentUser);
      sessionStorage.setItem("supportOriginalToken", currentToken);
    }
    login(userData, token);
  };

  const stopImpersonation = () => {
    const originalUser = sessionStorage.getItem("supportOriginalUser");
    const originalToken = sessionStorage.getItem("supportOriginalToken");
    if (originalUser && originalToken) {
      setUser(JSON.parse(originalUser));
      sessionStorage.setItem("user", originalUser);
      sessionStorage.setItem("token", originalToken);
    }
    sessionStorage.removeItem("supportOriginalUser");
    sessionStorage.removeItem("supportOriginalToken");
  };

  const logout = () => {
    api.post("/auth/logout").catch(() => {});
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("supportOriginalUser");
    sessionStorage.removeItem("supportOriginalToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, startImpersonation, stopImpersonation }}>
      {children}
    </AuthContext.Provider>
  );
};
