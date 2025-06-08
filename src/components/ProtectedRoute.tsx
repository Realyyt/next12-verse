import { useAuthUser } from "@/hooks/useAuthUser";
import { Navigate, useNavigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { isAdmin } from "@/lib/supabaseClient";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthUser();
  const [checked, setChecked] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      isAdmin(user.id).then((admin) => {
        setIsAdminUser(admin);
        setChecked(true);
      });
    } else {
      setChecked(true);
    }
  }, [user]);

  if (loading || !checked) return <div className="flex-1 flex justify-center items-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}
