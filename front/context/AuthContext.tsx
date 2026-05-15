"use client";

import { createContext, useContext, useEffect, useCallback, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AuthUser,
  HARDCODED_USERS,
  getRegisteredUsers,
  createToken,
  saveToken,
  getToken,
  parseToken,
  removeToken,
  validateAndRefreshToken,
} from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  reauthenticate: () => AuthUser | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const reauthenticate = useCallback((): AuthUser | null => {
    const refreshed = validateAndRefreshToken();
    if (refreshed) {
      setUser(refreshed);
    } else {
      setUser(null);
      removeToken();
    }
    return refreshed;
  }, []);

  useEffect(() => {
    const refreshed = validateAndRefreshToken();
    setUser(refreshed);
    setIsLoading(false);
  }, []);

  // Re-validate session when tab regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") reauthenticate();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [reauthenticate]);

  const login = async (email: string, password: string) => {
    const allUsers = [...HARDCODED_USERS, ...getRegisteredUsers()];
    const found = allUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) return { success: false, message: "Invalid email or password." };

    const { password: _, ...authUser } = found;
    const token = createToken(authUser);
    saveToken(token);
    setUser(authUser);
    return { success: true, message: "Welcome back!" };
  };

  const logout = () => {
    removeToken();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, reauthenticate }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
