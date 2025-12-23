"use client";

import { createContext, useContext, useState } from "react";

interface User {
  username: string;
  role: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("testpilot_user");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });

  const [loading] = useState(false);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("testpilot_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("testpilot_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};