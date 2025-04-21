
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useAuthUser() {
  const [user, setUser] = useState<null | { email: string; id: string }>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ? { email: user.email!, id: user.id } : null);
      setLoading(false);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
