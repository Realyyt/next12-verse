
import { useAuthUser } from "@/hooks/useAuthUser";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthUser();
  if (loading) return <div className="flex-1 flex justify-center items-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}
