
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "./useAuthUser";

// Counts only pending friend requests sent to the current user (not accepted yet).
export function useNotificationCount() {
  const { user } = useAuthUser();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setCount(0);
      return;
    }
    let cancelled = false;
    async function fetchCount() {
      // Get number of pending friend requests ("connections" where friend_id = me, status='pending')
      const { data, error } = await supabase
        .from("connections")
        .select("*", { count: "exact", head: true })
        .eq("friend_id", user.id)
        .eq("status", "pending");
      if (!cancelled) setCount(data?.length ?? 0); // fallback to 0 if not loaded
    }
    fetchCount();
    return () => { cancelled = true };
  }, [user]);

  return count;
}
