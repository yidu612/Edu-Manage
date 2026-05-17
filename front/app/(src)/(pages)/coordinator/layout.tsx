import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="coordinator">
      {children}
    </ProtectedRoute>
  );
}
