
import { useState, useRef, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserIcon, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: Date;
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
}

export function ChatDialog({ isOpen, onClose, user }: ChatDialogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Simulated messages for demo purposes
  useEffect(() => {
    if (isOpen) {
      // In a real app, you would fetch actual message history from your backend
      const demoMessages: ChatMessage[] = [
        {
          id: "1",
          text: `Hi there! How are you?`,
          sender: "other",
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: "2",
          text: "I'm good, thanks for asking! How about you?",
          sender: "me",
          timestamp: new Date(Date.now() - 3500000),
        },
        {
          id: "3",
          text: "Doing well! Are you attending the Next12 community event this weekend?",
          sender: "other",
          timestamp: new Date(Date.now() - 1800000),
        },
      ];
      
      setMessages(demoMessages);
    }
  }, [isOpen]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add the new message to the chat
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        text: newMessage,
        sender: "me",
        timestamp: new Date(),
      },
    ]);
    
    setNewMessage("");
    
    // Simulate response (in a real app, you would send to your backend)
    setTimeout(() => {
      toast({
        title: "Message sent",
        description: "Your message was delivered successfully",
      });
    }, 500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : (
                <AvatarFallback>
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              )}
            </Avatar>
            <span>{user.name}</span>
            <span className="text-sm text-next12-gray font-normal ml-1">@{user.username}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-[400px]">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      message.sender === "me" 
                        ? "bg-next12-orange text-white" 
                        : "bg-gray-100 text-next12-dark"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`text-xs ${message.sender === "me" ? "text-white/70" : "text-next12-gray"} mt-1`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <form 
              className="flex gap-2" 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
