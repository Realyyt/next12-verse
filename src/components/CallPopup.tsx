import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, UserIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CallPopupProps {
  open: boolean;
  callerName: string;
  callerAvatar?: string;
  onAccept: () => void;
  onReject: () => void;
}

export const CallPopup: React.FC<CallPopupProps> = ({ open, callerName, callerAvatar, onAccept, onReject }) => {
  const [ringing, setRinging] = useState(false);

  useEffect(() => {
    if (open) {
      setRinging(true);
      // Play ringtone
      const audio = new Audio('/ringtone.mp3');
      audio.loop = true;
      audio.play().catch(() => {
        // Handle autoplay restrictions
        console.log('Autoplay prevented');
      });

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-4 left-1/2 z-[1000] -translate-x-1/2 bg-white shadow-xl rounded-2xl px-6 py-4 flex items-center gap-4 w-[350px] border border-gray-200"
      >
        <motion.div
          animate={ringing ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Avatar className="h-14 w-14">
            {callerAvatar ? (
              <AvatarImage src={callerAvatar} alt={callerName} />
            ) : (
              <AvatarFallback>
                <UserIcon className="h-7 w-7" />
              </AvatarFallback>
            )}
          </Avatar>
        </motion.div>
        <div className="flex-1">
          <div className="font-semibold text-lg text-next12-dark flex items-center gap-2">
            <Phone className="h-5 w-5 text-next12-orange" /> Incoming call
          </div>
          <div className="text-sm text-next12-gray mt-1">{callerName}</div>
          <div className="flex gap-2 mt-3">
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white flex-1" 
              size="sm" 
              onClick={() => {
                setRinging(false);
                onAccept();
              }}
            >
              Accept
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white flex-1" 
              size="sm" 
              onClick={() => {
                setRinging(false);
                onReject();
              }}
            >
              Reject
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Add a simple slide-down animation
// In your global CSS (e.g., tailwind.config.js or index.css), add:
// @keyframes slideDown { from { opacity: 0; transform: translateY(-40px); } to { opacity: 1; transform: translateY(0); } }
// .animate-slideDown { animation: slideDown 0.3s cubic-bezier(0.4,0,0.2,1); } 