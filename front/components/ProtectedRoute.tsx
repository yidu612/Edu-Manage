"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getRedirectPath } from "@/lib/auth";
import { Loader2 } from "lucide-react";

type UserRole = "student" | "teacher" | "admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, reauthenticate } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const refreshed = reauthenticate();
      
      // No user logged in - redirect to login
      if (!refreshed) {
        router.replace("/login");
        return;
      }
      
      // If specific role is required, check authorization
      if (requiredRole && refreshed.role !== requiredRole) {
        // Redirect to user's appropriate dashboard based on their role
        router.replace(getRedirectPath(refreshed.role));
      }
    }
  }, [isLoading, reauthenticate, router, requiredRole]);

  if (isLoading || !user)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  // Additional check for role mismatch after initial load
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
