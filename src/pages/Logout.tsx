
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      navigate("/login");
    });
  }, [navigate]);

  return null;
}
