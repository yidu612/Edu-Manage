import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="teacher">
      {children}
    </ProtectedRoute>
  );
}
