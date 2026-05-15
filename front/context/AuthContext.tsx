"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  AuthUser,
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

  // Hydrate user from stored token on mount
  useEffect(() => {
    const user = validateAndRefreshToken();
    setUser(user);
    setIsLoading(false);
  }, []);

  // Re-validate when tab regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") reauthenticate();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [reauthenticate]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, user: userData } = res.data.data;

      saveToken(accessToken);

      // Build AuthUser from the response body (already normalized by interceptor)
      const authUser: AuthUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        imageUrl: userData.imageUrl,
      };
      setUser(authUser);

      return { success: true, message: "Welcome back!" };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Invalid email or password.";
      return { success: false, message };
    }
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
