import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/hooks/useAuthUser";
import { CallPopup } from "./CallPopup";

interface CallContextType {
  incomingCall: null | {
    id: string;
    sender_id: string;
    sender_name: string;
    sender_avatar?: string;
  };
  acceptCall: () => void;
  rejectCall: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => useContext(CallContext);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<CallContextType["incomingCall"]>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  // Subscribe to incoming calls globally
  useEffect(() => {
    if (!user) return;
    const channelName = `incoming-calls:${user.id}`;
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `and(type=eq.call,receiver_id.eq.${user.id})`
        },
        async (payload) => {
          const message = payload.new;
          if (message.call_status === 'missed') {
            // Fetch sender profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, avatar')
              .eq('id', message.sender_id)
              .single();
            setIncomingCall({
              id: message.id,
              sender_id: message.sender_id,
              sender_name: profile?.name || 'Unknown',
              sender_avatar: profile?.avatar || undefined,
            });
            setPopupOpen(true);
          }
        }
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Accept call: update message, navigate to chat
  const acceptCall = async () => {
    if (!incomingCall) return;
    await supabase
      .from('messages')
      .update({ call_status: 'answered', content: 'Call answered' })
      .eq('id', incomingCall.id);
    setPopupOpen(false);
    // Navigate to chat page with the caller
    navigate(`/chat/${incomingCall.sender_id}`);
  };

  // Reject call: update message
  const rejectCall = async () => {
    if (!incomingCall) return;
    await supabase
      .from('messages')
      .update({ call_status: 'rejected', content: 'Call rejected' })
      .eq('id', incomingCall.id);
    setPopupOpen(false);
    setIncomingCall(null);
  };

  return (
    <CallContext.Provider value={{ incomingCall, acceptCall, rejectCall }}>
      {children}
      <CallPopup
        open={popupOpen && !!incomingCall}
        callerName={incomingCall?.sender_name || ''}
        callerAvatar={incomingCall?.sender_avatar}
        onAccept={acceptCall}
        onReject={rejectCall}
      />
    </CallContext.Provider>
  );
}; 