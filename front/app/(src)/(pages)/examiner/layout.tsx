import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function ExaminerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="examiner">
      {children}
    </ProtectedRoute>
  );
}
