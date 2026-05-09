import { useEffect, useState } from "react";
import { AuthContext } from "./authContextValue";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const startImpersonation = (userData, token) => {
    const currentUser = localStorage.getItem("user");
    const currentToken = localStorage.getItem("token");
    if (currentUser && currentToken) {
      localStorage.setItem("supportOriginalUser", currentUser);
      localStorage.setItem("supportOriginalToken", currentToken);
    }
    login(userData, token);
  };

  const stopImpersonation = () => {
    const originalUser = localStorage.getItem("supportOriginalUser");
    const originalToken = localStorage.getItem("supportOriginalToken");
    if (originalUser && originalToken) {
      setUser(JSON.parse(originalUser));
      localStorage.setItem("user", originalUser);
      localStorage.setItem("token", originalToken);
    }
    localStorage.removeItem("supportOriginalUser");
    localStorage.removeItem("supportOriginalToken");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("supportOriginalUser");
    localStorage.removeItem("supportOriginalToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, startImpersonation, stopImpersonation }}>
      {children}
    </AuthContext.Provider>
  );
};
