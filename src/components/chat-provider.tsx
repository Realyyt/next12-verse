
import { ChatDialog } from "./chat-dialog";
import { useChat } from "@/hooks/use-chat";

export function ChatProvider() {
  const { isOpen, activeUser, closeChat } = useChat();

  if (!activeUser) return null;

  return (
    <ChatDialog
      isOpen={isOpen}
      onClose={closeChat}
      user={activeUser}
    />
  );
}
